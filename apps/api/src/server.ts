import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fp from 'fastify-plugin'

import prismaPlugin    from './plugins/prisma'
import authPlugin      from './plugins/auth'
import authRoutes      from './routes/auth'
import alunosRoutes    from './routes/alunos'
import temporadasRoutes from './routes/temporadas'
import usuariosRoutes  from './routes/usuarios'
import exportRoutes    from './routes/export'

const server = Fastify({ logger: { level: 'info' } })

async function start() {
  await server.register(cors, {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })

  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'rankingkids-secret',
  })

  await server.register(prismaPlugin)
  await server.register(authPlugin)

  await server.register(authRoutes,       { prefix: '/api/auth' })
  await server.register(alunosRoutes,     { prefix: '/api/alunos' })
  await server.register(temporadasRoutes, { prefix: '/api/temporadas' })
  await server.register(usuariosRoutes,   { prefix: '/api/usuarios' })
  await server.register(exportRoutes,     { prefix: '/api/export' })

  server.get('/api/health', async () => ({ status: 'ok' }))

  const port = parseInt(process.env.PORT || '3001')
  await server.listen({ port, host: '0.0.0.0' })
  console.log(`API rodando em http://localhost:${port}`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
