import { Context, Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono<Env>({ strict: false })

app.use(logger())

async function handler(ctx: Context<'name', Env>) {
  const { name } = ctx.req.param()
  const url = new URL(ctx.req.url)
  const { pathname, search, host } = url
  const proxyUrl = await ctx.env.PROXY_DATA.get(`${host}:${name}`)
  const path = pathname.replace(new RegExp(`^/${name}`), '')
  return fetch(`${proxyUrl}${path}${search}`)
}

app.get('/:name', handler)
app.get('/:name/*', handler)

export default app
