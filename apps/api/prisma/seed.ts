import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Admin
  const senhaAdmin = await bcrypt.hash('admin123', 10)
  await prisma.usuario.upsert({
    where: { email: 'admin@rankingkids.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@rankingkids.com',
      senhaHash: senhaAdmin,
      role: 'ADMIN',
    },
  })

  // Professor
  const senhaProfessor = await bcrypt.hash('beach2025', 10)
  await prisma.usuario.upsert({
    where: { email: 'professor@rankingkids.com' },
    update: {},
    create: {
      nome: 'Professor',
      email: 'professor@rankingkids.com',
      senhaHash: senhaProfessor,
      role: 'PROFESSOR',
    },
  })

  // Temporada ativa
  const temporada = await prisma.temporada.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nome: 'Temporada 29',
      numero: 29,
      semanaAtual: 'Semana 2 (30/03 a 12/04)',
      ativa: true,
    },
  })

  // Alunos adultos
  const alunosAdultos = [
    { nome: 'Carlos Mendes',   categoria: 'Adulto', pontos: 980 },
    { nome: 'Ana Lima',        categoria: 'Adulto', pontos: 870 },
    { nome: 'Bruno Tavares',   categoria: 'Adulto', pontos: 820 },
    { nome: 'Fernanda Costa',  categoria: 'Adulto', pontos: 750 },
    { nome: 'Rafael Souza',    categoria: 'Adulto', pontos: 680 },
    { nome: 'Juliana Moraes',  categoria: 'Adulto', pontos: 610 },
    { nome: 'Diego Alves',     categoria: 'Adulto', pontos: 540 },
    { nome: 'Patricia Nunes',  categoria: 'Adulto', pontos: 490 },
  ]

  // Alunos kids
  const alunosKids = [
    { nome: 'Lucas Ferreira',  categoria: 'Kids', pontos: 920 },
    { nome: 'Sofia Rocha',     categoria: 'Kids', pontos: 860 },
    { nome: 'Pedro Oliveira',  categoria: 'Kids', pontos: 800 },
    { nome: 'Isabela Santos',  categoria: 'Kids', pontos: 730 },
    { nome: 'Mateus Ribeiro',  categoria: 'Kids', pontos: 650 },
    { nome: 'Larissa Cruz',    categoria: 'Kids', pontos: 580 },
    { nome: 'Gabriel Torres',  categoria: 'Kids', pontos: 510 },
    { nome: 'Camila Pereira',  categoria: 'Kids', pontos: 440 },
  ]

  for (const aluno of [...alunosAdultos, ...alunosKids]) {
    const existe = await prisma.aluno.findFirst({
      where: { nome: aluno.nome, temporadaId: temporada.id },
    })
    if (!existe) {
      await prisma.aluno.create({
        data: { ...aluno, temporadaId: temporada.id },
      })
    }
  }

  console.log('Seed concluído!')
  console.log('  Admin: admin@rankingkids.com / admin123')
  console.log('  Professor: professor@rankingkids.com / beach2025')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
