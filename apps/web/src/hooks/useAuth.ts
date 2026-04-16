import { useState, useCallback } from 'react'
import type { Usuario } from '@rankingkids/types'
import * as api from '../lib/api'

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro]       = useState('')

  const entrar = useCallback(async (email: string, senha: string) => {
    setLoading(true)
    setErro('')
    try {
      const res = await api.login({ email, senha })
      sessionStorage.setItem('rk_token', res.token)
      setUsuario(res.usuario)
      return true
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao entrar')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const sair = useCallback(() => {
    sessionStorage.removeItem('rk_token')
    setUsuario(null)
  }, [])

  const isAdmin = usuario?.role === 'ADMIN'

  return { usuario, loading, erro, setErro, entrar, sair, isAdmin }
}
