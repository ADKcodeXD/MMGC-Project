import JSZip from 'jszip'
import type { MovieVo } from '../types'
import { text } from './i18n'

export type ExportProgress = {
  /** 当前正在处理的视频索引 (0-based) */
  current: number
  /** 总视频文件数（含多语言展开） */
  total: number
  /** 当前文件名 */
  fileName: string
  /** 整体进度百分比 0-100 */
  percent: number
  /** 状态 */
  phase: 'downloading' | 'zipping' | 'done' | 'error'
  /** 错误信息 */
  error?: string
}

type LangEntry = { lang: 'cn' | 'en' | 'jp'; label: string; url: string }

/**
 * 清理文件名中不允许的特殊字符
 */
function sanitize(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim() || '未命名'
}

/**
 * 从 URL 中提取文件扩展名，默认 .mp4
 */
function getExtFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const dotIndex = pathname.lastIndexOf('.')
    if (dotIndex !== -1) {
      const ext = pathname.substring(dotIndex).toLowerCase()
      // 只接受常见视频扩展名
      if (['.mp4', '.webm', '.mkv', '.mov', '.avi', '.flv'].includes(ext)) {
        return ext
      }
    }
  } catch { /* ignore */ }
  return '.mp4'
}

/**
 * 收集一个视频的所有语言版本下载项
 */
function collectLangEntries(movie: MovieVo): LangEntry[] {
  const playlink = movie.moviePlaylink
  if (!playlink) return []

  const entries: LangEntry[] = []
  if (playlink.cn) entries.push({ lang: 'cn', label: '中', url: playlink.cn })
  if (playlink.en) entries.push({ lang: 'en', label: 'EN', url: playlink.en })
  if (playlink.jp) entries.push({ lang: 'jp', label: '日', url: playlink.jp })

  return entries
}

/**
 * 构建单个视频文件的文件名
 */
function buildFileName(
  activityId: number,
  dayIndex: number,
  movie: MovieVo,
  langEntry: LangEntry | null,
  hasMultiLang: boolean
): string {
  const movieName = sanitize(text(movie.movieName) || `视频${movie.movieId}`)
  const authorName = sanitize(movie.authorName || movie.author?.memberName || '未知作者')
  const ext = langEntry ? getExtFromUrl(langEntry.url) : '.mp4'
  const langSuffix = hasMultiLang && langEntry ? `(${langEntry.label})` : ''

  return `MMGC-${activityId}-Day ${dayIndex}-${movieName}-${authorName}${langSuffix}${ext}`
}

export type ExportItem = {
  fileName: string
  url: string
}

/**
 * 预览导出文件列表（不实际下载）
 */
export function previewExportFiles(
  activityId: number,
  dayIndex: number,
  movies: MovieVo[]
): ExportItem[] {
  const items: ExportItem[] = []

  for (const movie of movies) {
    const entries = collectLangEntries(movie)
    if (entries.length === 0) continue

    const hasMultiLang = entries.length > 1

    for (const entry of entries) {
      items.push({
        fileName: buildFileName(activityId, dayIndex, movie, entry, hasMultiLang),
        url: entry.url
      })
    }
  }

  return items
}

/**
 * 导出视频：从 CDN 下载并打包为 ZIP
 */
export async function exportVideos(
  activityId: number,
  dayIndex: number,
  movies: MovieVo[],
  onProgress: (progress: ExportProgress) => void,
  signal?: AbortSignal
): Promise<void> {
  const items = previewExportFiles(activityId, dayIndex, movies)

  if (items.length === 0) {
    onProgress({ current: 0, total: 0, fileName: '', percent: 100, phase: 'done' })
    return
  }

  const zip = new JSZip()
  const total = items.length
  // 用于检测并处理重名文件
  const usedNames = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    if (signal?.aborted) {
      throw new DOMException('Export cancelled', 'AbortError')
    }

    let fileName = items[i].fileName
    // 处理重名
    if (usedNames.has(fileName)) {
      const dotIdx = fileName.lastIndexOf('.')
      const base = dotIdx > 0 ? fileName.substring(0, dotIdx) : fileName
      const ext = dotIdx > 0 ? fileName.substring(dotIdx) : ''
      let counter = 2
      while (usedNames.has(`${base}_${counter}${ext}`)) counter++
      fileName = `${base}_${counter}${ext}`
    }
    usedNames.add(fileName)

    onProgress({
      current: i + 1,
      total,
      fileName,
      percent: Math.round((i / total) * 90),
      phase: 'downloading'
    })

    try {
      const response = await fetch(items[i].url, { signal })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const blob = await response.blob()
      zip.file(fileName, blob)
    } catch (err: any) {
      if (err.name === 'AbortError') throw err
      // 记录失败但继续处理其他文件
      console.warn(`下载失败: ${fileName}`, err)
      // 在 ZIP 中放入一个错误说明文件
      zip.file(
        fileName.replace(/\.[^.]+$/, '_下载失败.txt'),
        `文件下载失败: ${items[i].url}\n错误: ${err.message}`
      )
    }
  }

  if (signal?.aborted) {
    throw new DOMException('Export cancelled', 'AbortError')
  }

  onProgress({
    current: total,
    total,
    fileName: '正在生成压缩包...',
    percent: 92,
    phase: 'zipping'
  })

  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'STORE' },
    (metadata) => {
      onProgress({
        current: total,
        total,
        fileName: '正在生成压缩包...',
        percent: 92 + Math.round(metadata.percent * 0.08),
        phase: 'zipping'
      })
    }
  )

  // 触发浏览器下载
  const zipName = `MMGC-${activityId}-Day${dayIndex}-视频合集.zip`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = zipName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  onProgress({
    current: total,
    total,
    fileName: zipName,
    percent: 100,
    phase: 'done'
  })
}
