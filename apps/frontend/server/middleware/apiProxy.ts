export default defineEventHandler(async event => {
  const runtime = useRuntimeConfig()
  const baseUrl = runtime.public.apiLocal || ''
  const prefix = runtime.public.apiPrefix || ''
  if (event.node.req.url?.startsWith('/api/__sitemap__/')) {
    return
  }

  if (event.node.req.url?.startsWith('/api')) {
    const url = baseUrl + prefix + event.node.req.url.replace('/api', '')
    const query = getQuery(event)
    const token = getCookie(event, 'token')
    const method = getMethod(event)
    const headers: any = event.node.req.headers
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    let body = null
    if (method !== 'GET' && event.node.req.url.includes('upload')) {
      const parts = await readMultipartFormData(event)
      const file = parts?.find(part => part.filename)
      if (!file?.data || !file.filename) {
        throw createError({ statusCode: 400, statusMessage: 'Missing upload file' })
      }
      const uploadForm = new FormData()
      uploadForm.append(
        file.name || 'file',
        new Blob([file.data], { type: file.type || 'application/octet-stream' }),
        file.filename
      )
      delete headers['content-type']
      delete headers['content-length']
      body = uploadForm
    } else if (method !== 'GET') {
      body = await readBody(event)
    }
    return $fetch(url, {
      method,
      params: query,
      body,
      headers
    })
  }
})
