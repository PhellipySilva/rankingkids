import { FastifyPluginAsync } from 'fastify'

const exportRoutes: FastifyPluginAsync = async (server) => {
  // Export CSV do ranking
  server.get('/ranking', async (req, reply) => {
    const { temporadaId, categoria } = req.query as {
      temporadaId?: string; categoria?: string
    }

    let tId: number | undefined
    if (temporadaId) {
      tId = parseInt(temporadaId)
    } else {
      const ativa = await server.prisma.temporada.findFirst({ where: { ativa: true } })
      tId = ativa?.id
    }

    if (!tId) return reply.status(404).send({ error: 'Temporada não encontrada' })

    const temporada = await server.prisma.temporada.findUnique({ where: { id: tId } })
    const alunos = await server.prisma.aluno.findMany({
      where: { temporadaId: tId, ...(categoria ? { categoria } : {}) },
      orderBy: { pontos: 'desc' },
    })

    const linhas = [
      ['Posição', 'Nome', 'Categoria', 'Pontos'],
      ...alunos.map((a, i) => [i + 1, a.nome, a.categoria, a.pontos]),
    ]

    const csv = linhas.map(l => l.join(',')).join('\n')
    const nomeArquivo = `ranking-${temporada?.nome ?? 'export'}-${categoria ?? 'todos'}.csv`
      .replace(/\s+/g, '-').toLowerCase()

    reply.header('Content-Type', 'text/csv; charset=utf-8')
    reply.header('Content-Disposition', `attachment; filename="${nomeArquivo}"`)
    return reply.send('\uFEFF' + csv) // BOM para UTF-8 no Excel
  })
}

export default exportRoutes
