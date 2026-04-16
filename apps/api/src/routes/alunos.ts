import { FastifyPluginAsync } from 'fastify'

const alunosRoutes: FastifyPluginAsync = async (server) => {
  // Lista alunos (público) — filtros: categoria, temporadaId
  server.get('/', async (req, reply) => {
    const { categoria, temporadaId } = req.query as {
      categoria?: string; temporadaId?: string
    }

    // Resolve qual temporada usar
    let tId: number | undefined
    if (temporadaId) {
      tId = parseInt(temporadaId)
    } else {
      const ativa = await server.prisma.temporada.findFirst({ where: { ativa: true } })
      tId = ativa?.id
    }

    if (!tId) return reply.send([])

    const alunos = await server.prisma.aluno.findMany({
      where: {
        temporadaId: tId,
        ...(categoria ? { categoria } : {}),
      },
      orderBy: { pontos: 'desc' },
    })
    return reply.send(alunos)
  })

  // Histórico de um aluno
  server.get('/:id/historico', { preHandler: server.autenticar }, async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id)
    const historico = await server.prisma.historicoPontos.findMany({
      where: { alunoId: id },
      orderBy: { criadoEm: 'desc' },
      take: 50,
    })
    return reply.send(historico)
  })

  // Adicionar aluno (autenticado)
  server.post('/', { preHandler: server.autenticar }, async (req, reply) => {
    const { nome, categoria, pontos, temporadaId } = req.body as {
      nome: string; categoria: string; pontos?: number; temporadaId?: number
    }

    if (!nome || !categoria) {
      return reply.status(400).send({ error: 'Nome e categoria são obrigatórios' })
    }
    if (!['Adulto', 'Kids'].includes(categoria)) {
      return reply.status(400).send({ error: 'Categoria deve ser Adulto ou Kids' })
    }

    let tId = temporadaId
    if (!tId) {
      const ativa = await server.prisma.temporada.findFirst({ where: { ativa: true } })
      if (!ativa) return reply.status(400).send({ error: 'Nenhuma temporada ativa' })
      tId = ativa.id
    }

    const aluno = await server.prisma.aluno.create({
      data: { nome, categoria, pontos: pontos ?? 0, temporadaId: tId },
    })
    return reply.status(201).send(aluno)
  })

  // Atualizar pontos (autenticado) — registra histórico
  server.patch('/:id', { preHandler: server.autenticar }, async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id)
    const { pontos, nome, categoria } = req.body as {
      pontos?: number; nome?: string; categoria?: string
    }

    const atual = await server.prisma.aluno.findUnique({ where: { id } })
    if (!atual) return reply.status(404).send({ error: 'Aluno não encontrado' })

    // Registra histórico se pontos mudou
    if (pontos !== undefined && pontos !== atual.pontos) {
      await server.prisma.historicoPontos.create({
        data: {
          alunoId:     id,
          pontosAnt:   atual.pontos,
          pontosNov:   pontos,
          usuarioNome: req.usuarioNome,
        },
      })
    }

    const aluno = await server.prisma.aluno.update({
      where: { id },
      data: {
        ...(pontos    !== undefined ? { pontos }    : {}),
        ...(nome      !== undefined ? { nome }      : {}),
        ...(categoria !== undefined ? { categoria } : {}),
      },
    })
    return reply.send(aluno)
  })

  // Salvar múltiplos pontos de uma vez (autenticado)
  server.post('/salvar-lote', { preHandler: server.autenticar }, async (req, reply) => {
    const { atualizacoes } = req.body as {
      atualizacoes: Array<{ id: number; pontos: number }>
    }

    if (!Array.isArray(atualizacoes)) {
      return reply.status(400).send({ error: 'atualizacoes deve ser um array' })
    }

    const promises = atualizacoes.map(async ({ id, pontos }) => {
      const atual = await server.prisma.aluno.findUnique({ where: { id } })
      if (!atual || atual.pontos === pontos) return

      await server.prisma.historicoPontos.create({
        data: { alunoId: id, pontosAnt: atual.pontos, pontosNov: pontos, usuarioNome: req.usuarioNome },
      })
      await server.prisma.aluno.update({ where: { id }, data: { pontos } })
    })

    await Promise.all(promises)
    return reply.send({ ok: true })
  })

  // Remover aluno (autenticado)
  server.delete('/:id', { preHandler: server.autenticar }, async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id)
    const aluno = await server.prisma.aluno.findUnique({ where: { id } })
    if (!aluno) return reply.status(404).send({ error: 'Aluno não encontrado' })

    await server.prisma.aluno.delete({ where: { id } })
    return reply.send({ ok: true })
  })
}

export default alunosRoutes
