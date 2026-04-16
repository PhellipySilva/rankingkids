import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    autenticar: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
    autenticarAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    usuarioId: number
    usuarioRole: string
    usuarioNome: string
  }
}

const authPlugin: FastifyPluginAsync = fp(async (server) => {
  server.decorate('autenticar', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = await req.jwtVerify() as { id: number; role: string; nome: string }
      req.usuarioId   = payload.id
      req.usuarioRole = payload.role
      req.usuarioNome = payload.nome
    } catch {
      reply.status(401).send({ error: 'Token inválido ou expirado' })
    }
  })

  server.decorate('autenticarAdmin', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = await req.jwtVerify() as { id: number; role: string; nome: string }
      req.usuarioId   = payload.id
      req.usuarioRole = payload.role
      req.usuarioNome = payload.nome
      if (payload.role !== 'ADMIN') {
        reply.status(403).send({ error: 'Acesso restrito a administradores' })
      }
    } catch {
      reply.status(401).send({ error: 'Token inválido ou expirado' })
    }
  })
})

export default authPlugin
