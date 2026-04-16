type Categoria = 'Todos' | 'Adulto' | 'Kids'

interface Props {
  ativa:    Categoria
  onChange: (cat: Categoria) => void
}

const CATEGORIAS: { label: string; value: Categoria; emoji: string }[] = [
  { label: 'Todos',  value: 'Todos',  emoji: '🌍' },
  { label: 'Adulto', value: 'Adulto', emoji: '🎾' },
  { label: 'Kids',   value: 'Kids',   emoji: '🧒' },
]

export default function FilterTabs({ ativa, onChange }: Props) {
  return (
    <div className="rk-filtros">
      {CATEGORIAS.map(c => (
        <button
          key={c.value}
          className={`rk-filtro-btn ${ativa === c.value ? 'ativo' : ''}`}
          onClick={() => onChange(c.value)}
        >
          {c.emoji} {c.label}
        </button>
      ))}
    </div>
  )
}
