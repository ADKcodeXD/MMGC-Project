import { defineEventHandler, setHeader } from 'h3'

function getSiteUrl() {
  return process.env.NUXT_PUBLIC_API_BASE || 'https://mirai-mad.com'
}

export default defineEventHandler(event => {
  const siteUrl = getSiteUrl().replace(/\/$/, '')
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`
  ].join('\n')
})
