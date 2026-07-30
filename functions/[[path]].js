const FILE_PATH_PATTERN = /\/[^/]+\.[^/]+$/

export async function onRequest(context) {
  const response = await context.next()
  const { method } = context.request
  const pathname = new URL(context.request.url).pathname

  if (
    response.status !== 404 ||
    (method !== 'GET' && method !== 'HEAD') ||
    FILE_PATH_PATTERN.test(pathname)
  ) {
    return response
  }

  const indexUrl = new URL('/', context.request.url)
  const indexRequest = new Request(indexUrl, context.request)
  return context.env.ASSETS.fetch(indexRequest)
}
