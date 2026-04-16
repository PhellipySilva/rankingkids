import { FastifyPluginAsync } from 'fastify'

const temporadasRoutes: FastifyPluginAsync = async (server) => {
  // Lista todas
  server.get('/', async (_req, reply) => {
    const temporadas = await server.prisma.temporada.findMany({
      orderBy: { numero: 'desc' },
    })
    return reply.send(temporadas)
  })

  // Temporada ativa
  server.get('/ativa', async (_req, reply) => {
    const temporada = await server.prisma.temporada.findFirst({
      where: { ativa: true },
    })
    if (!temporada) return reply.status(404).send({ error: 'Nenhuma temporada ativa' })
    return reply.send(temporada)
  })

  // Criar nova (admin)
  server.post('/', { preHandler: server.autenticarAdmin }, async (req, reply) => {
    const { nome, numero, semanaAtual } = req.body as {
      nome: string; numero: number; semanaAtual?: string
    }
    if (!nome || !numero) {
      return reply.status(400).send({ error: 'Nome e número são obrigatórios' })
    }
    const temporada = await server.prisma.temporada.create({
      data: { nome, numero, semanaAtual: semanaAtual ?? null, ativa: false },
    })
    return reply.status(201).send(temporada)
  })

  // Atualizar semana (professor ou admin)
  server.patch('/:id', { preHandler: server.autenticar }, async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id)
    const { nome, semanaAtual } = req.body as { nome?: string; semanaAtual?: string }
    const temporada = await server.prisma.temporada.update({
      where: { id },
      data: { nome, semanaAtual },
    })
    return reply.send(temporada)
  })

  // Ativar temporada (admin) — desativa as demais
  server.patch('/:id/ativar', { preHandler: server.autenticarAdmin }, async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id)
    await server.prisma.temporada.updateMany({ data: { ativa: false } })
    const temporada = await server.prisma.temporada.update({
      where: { id },
      data: { ativa: true },
    })
    return reply.send(temporada)
  })
}

export default temporadasRoutes
