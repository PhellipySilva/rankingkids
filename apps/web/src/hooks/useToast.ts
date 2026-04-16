import { useState, useCallback, useRef } from 'react'

export type ToastTipo = 'success' | 'error'

export function useToast() {
  const [msg, setMsg]   = useState('')
  const [tipo, setTipo] = useState<ToastTipo>('success')
  const [show, setShow] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const toast = useCallback((mensagem: string, t: ToastTipo = 'success') => {
    setMsg(mensagem)
    setTipo(t)
    setShow(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setShow(false), 3200)
  }, [])

  return { msg, tipo, show, toast }
}
