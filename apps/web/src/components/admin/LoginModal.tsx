import { useState, useRef, useEffect } from 'react'

interface Props {
  onEntrar: (email: string, senha: string) => Promise<boolean>
  onFechar: () => void
  erro:     string
  loading:  boolean
}

const MAX_TENT   = 5
const BLOQ_SEG   = 120

export default function LoginModal({ onEntrar, onFechar, erro, loading }: Props) {
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [tentativas, setTentativas] = useState(0)
  const [bloqAte, setBloqAte]   = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [inputErro, setInputErro] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => { emailRef.current?.focus() }, [])

  useEffect(() => {
    if (!bloqAte) return
    const int = setInterval(() => {
      const restam = Math.ceil((bloqAte - Date.now()) / 1000)
      if (restam <= 0) { setBloqAte(null); setTentativas(0); setCountdown(0); clearInterval(int) }
      else setCountdown(restam)
    }, 1000)
    return () => clearInterval(int)
  }, [bloqAte])

  async function handleEntrar() {
    if (bloqAte) return
    if (!email || !senha) return

    const ok = await onEntrar(email, senha)
    if (!ok) {
      const novas = tentativas + 1
      setTentativas(novas)
      setInputErro(true)
      setSenha('')
      setTimeout(() => setInputErro(false), 400)
      if (novas >= MAX_TENT) {
        setBloqAte(Date.now() + BLOQ_SEG * 1000)
        setCountdown(BLOQ_SEG)
        setTentativas(0)
      }
    }
  }

  const bloqueado = bloqAte !== null
  const msgErro   = bloqueado
    ? `Muitas tentativas. Aguarde ${countdown}s.`
    : erro
      ? `${erro}${tentativas > 0 && tentativas < MAX_TENT ? ` (${MAX_TENT - tentativas} tentativa(s) restante(s))` : ''}`
      : ''

  return (
    <div className="rk-overlay" onClick={e => e.target === e.currentTarget && onFechar()}>
      <div className="rk-modal">
        <div className="rk-modal-icon">🔐</div>
        <div className="rk-modal-titulo">Área Restrita</div>
        <div className="rk-modal-sub">
          Digite suas credenciais para acessar<br />o painel do professor
        </div>

        <div className="rk-modal-campo">
          <input
            ref={emailRef}
            className="rk-modal-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEntrar()}
            disabled={bloqueado || loading}
          />
        </div>

        <div className="rk-modal-campo">
          <div className="rk-input-wrap">
            <input
              className={`rk-modal-input ${inputErro ? 'erro' : ''}`}
              type={verSenha ? 'text' : 'password'}
              placeholder="• • • • • • • •"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEntrar()}
              disabled={bloqueado || loading}
              style={{ letterSpacing: verSenha ? 'normal' : '4px', textAlign: 'center' }}
            />
            <button className="rk-btn-olho" type="button" onClick={() => setVerSenha(v => !v)}>
              {verSenha ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="rk-msg-erro">{msgErro}</div>

        <div className="rk-modal-btns">
          <button className="rk-btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button
            className="rk-btn-entrar"
            onClick={handleEntrar}
            disabled={bloqueado || loading}
          >
            {loading ? '⏳ Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
