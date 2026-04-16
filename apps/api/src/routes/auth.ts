import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'

const authRoutes: FastifyPluginAsync = async (server) => {
  server.post('/login', async (req, reply) => {
    const { email, senha } = req.body as { email: string; senha: string }

    if (!email || !senha) {
      return reply.status(400).send({ error: 'Email e senha são obrigatórios' })
    }

    const usuario = await server.prisma.usuario.findUnique({ where: { email } })
    if (!usuario || !usuario.ativo) {
      return reply.status(401).send({ error: 'Credenciais inválidas' })
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senhaHash)
    if (!senhaOk) {
      return reply.status(401).send({ error: 'Credenciais inválidas' })
    }

    const token = server.jwt.sign(
      { id: usuario.id, role: usuario.role, nome: usuario.nome },
      { expiresIn: '8h' }
    )

    return reply.send({
      token,
      usuario: {
        id:       usuario.id,
        nome:     usuario.nome,
        email:    usuario.email,
        role:     usuario.role,
        ativo:    usuario.ativo,
        criadoEm: usuario.criadoEm,
      },
    })
  })

  server.get('/me', { preHandler: server.autenticar }, async (req, reply) => {
    const usuario = await server.prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: { id: true, nome: true, email: true, role: true, ativo: true, criadoEm: true },
    })
    if (!usuario) return reply.status(404).send({ error: 'Usuário não encontrado' })
    return reply.send(usuario)
  })

  server.patch('/me/senha', { preHandler: server.autenticar }, async (req, reply) => {
    const { senhaAtual, novaSenha } = req.body as { senhaAtual: string; novaSenha: string }

    const usuario = await server.prisma.usuario.findUnique({ where: { id: req.usuarioId } })
    if (!usuario) return reply.status(404).send({ error: 'Usuário não encontrado' })

    const ok = await bcrypt.compare(senhaAtual, usuario.senhaHash)
    if (!ok) return reply.status(401).send({ error: 'Senha atual incorreta' })

    if (novaSenha.length < 6) {
      return reply.status(400).send({ error: 'Nova senha deve ter pelo menos 6 caracteres' })
    }

    const hash = await bcrypt.hash(novaSenha, 10)
    await server.prisma.usuario.update({
      where: { id: req.usuarioId },
      data: { senhaHash: hash },
    })

    return reply.send({ ok: true })
  })
}

export default authRoutes
