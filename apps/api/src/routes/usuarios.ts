import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'

const usuariosRoutes: FastifyPluginAsync = async (server) => {
  // Lista usuários (admin)
  server.get('/', { preHandler: server.autenticarAdmin }, async (_req, reply) => {
    const usuarios = await server.prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, role: true, ativo: true, criadoEm: true },
      orderBy: { criadoEm: 'asc' },
    })
    return reply.send(usuarios)
  })

  // Criar usuário (admin)
  server.post('/', { preHandler: server.autenticarAdmin }, async (req, reply) => {
    const { nome, email, senha, role } = req.body as {
      nome: string; email: string; senha: string; role?: string
    }

    if (!nome || !email || !senha) {
      return reply.status(400).send({ error: 'Nome, email e senha são obrigatórios' })
    }
    if (senha.length < 6) {
      return reply.status(400).send({ error: 'Senha deve ter pelo menos 6 caracteres' })
    }

    const existe = await server.prisma.usuario.findUnique({ where: { email } })
    if (existe) return reply.status(409).send({ error: 'Email já cadastrado' })

    const senhaHash = await bcrypt.hash(senha, 10)
    const usuario = await server.prisma.usuario.create({
      data: { nome, email, senhaHash, role: role ?? 'PROFESSOR' },
      select: { id: true, nome: true, email: true, role: true, ativo: true, criadoEm: true },
    })
    return reply.status(201).send(usuario)
  })

  // Atualizar usuário (admin)
  server.patch('/:id', { preHandler: server.autenticarAdmin }, async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id)
    const { nome, role, ativo, senha } = req.body as {
      nome?: string; role?: string; ativo?: boolean; senha?: string
    }

    const data: Record<string, unknown> = {}
    if (nome  !== undefined) data.nome  = nome
    if (role  !== undefined) data.role  = role
    if (ativo !== undefined) data.ativo = ativo
    if (senha) {
      if (senha.length < 6) return reply.status(400).send({ error: 'Senha muito curta' })
      data.senhaHash = await bcrypt.hash(senha, 10)
    }

    const usuario = await server.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, role: true, ativo: true, criadoEm: true },
    })
    return reply.send(usuario)
  })

  // Desativar usuário (admin) — soft delete
  server.delete('/:id', { preHandler: server.autenticarAdmin }, async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id)
    await server.prisma.usuario.update({ where: { id }, data: { ativo: false } })
    return reply.send({ ok: true })
  })
}

export default usuariosRoutes
