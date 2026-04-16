import type { ToastTipo } from '../hooks/useToast'

interface Props {
  msg:  string
  tipo: ToastTipo
  show: boolean
}

export default function Toast({ msg, tipo, show }: Props) {
  return (
    <div className={`rk-toast ${tipo} ${show ? 'show' : ''}`}>
      {msg}
    </div>
  )
}
