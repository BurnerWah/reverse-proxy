import { Context, Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono<Env>({ strict: false })

app.use(logger())

async function handler(ctx: Context<'name', Env>): Promise<Response> {
  const { name } = ctx.req.param()
  const url = new URL(ctx.req.url)
  const { pathname, search, host } = url
  const proxyUrl = await ctx.env.PROXY_DATA.get(`${host}:${name}`)
  const path = pathname.replace(new RegExp(`^/${name}`), '')
  const proxyRequest = new Request(`${proxyUrl}${path}${search}`, ctx.req)
  return fetch(proxyRequest)
}

// This route should never see any actual use, but it's useful for testing
// Without it, the worker runs into some errors since we don't actually check to see if
// we should proxy the request.
app.get('/favicon.ico', (ctx) => ctx.notFound())

app.all('/:name', handler)
app.all('/:name/*', handler)

export default app
