import { JSX, useState } from 'react'
import { VarianteShell } from './VarianteShell'
import { VARIANTES } from './variantes'
import { useKpi } from './useKpi'
import { CORES_TENDENCIA, MetricaKpi, formatarValor, percentual } from './metricas'
import { Variacao } from './partes'
import { estadoDoKpi } from './estados'
import { TiraPrevisao } from './CardPrevisao'
import { KpiDetalheModal } from './KpiDetalheModal'

const variante = VARIANTES[3]

type AoAbrir = (metrica: MetricaKpi) => void

const COR_CUSTO = '#c0705c'
const COR_LUCRO = '#e5c483'

/**
 * Segmento clicável da barra de composição. Cada um abre o detalhe da sua
 * própria métrica — a barra não é só ilustração, é navegação.
 */
const Segmento = ({
  rotulo,
  valor,
  fracao,
  cor,
  metrica,
  onAbrir
}: {
  rotulo: string
  valor: string
  fracao: number
  cor: string
  metrica: MetricaKpi
  onAbrir: AoAbrir
}): JSX.Element => (
  <button
    onClick={() => onAbrir(metrica)}
    className="text-left min-w-0 group"
    style={{ flexGrow: Math.max(fracao, 0.08), flexBasis: 0 }}
    title={`${rotulo}: ${valor}`}
  >
    <div
      className="h-3 rounded-full transition-opacity group-hover:opacity-80"
      style={{ backgroundColor: cor }}
    />
    <div className="mt-2 font-label-caps text-label-caps text-on-surface-variant truncate">
      {rotulo}
    </div>
    <div className="font-data-display font-bold text-lg truncate" style={{ color: cor }}>
      {valor}
    </div>
  </button>
)

/**
 * Faturamento, custo e lucro num card só.
 *
 * Como três cards separados, a relação entre eles ficava por conta do gerente
 * fazer de cabeça. Aqui a barra mostra quanto do faturamento virou custo e
 * quanto sobrou, e a margem — que hoje não existe em lugar nenhum — vira
 * número de primeira classe.
 */
const CardResultado = ({ onAbrir }: { onAbrir: AoAbrir }): JSX.Element => {
  const faturamento = useKpi('faturamento')
  const custo = useKpi('custo')
  const lucro = useKpi('lucro')

  const estado = estadoDoKpi(faturamento)
  const principal = faturamento.comparacoes[0]

  const totalFaturado = faturamento.valor ?? 0
  const totalCusto = custo.valor ?? 0
  const totalLucro = lucro.valor ?? 0

  const margem = totalFaturado > 0 ? (totalLucro / totalFaturado) * 100 : null
  const fracaoCusto = totalFaturado > 0 ? Math.min(totalCusto / totalFaturado, 1) : 0.5
  const fracaoLucro = 1 - fracaoCusto

  return (
    <div className="xl:col-span-2 bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />

      <div className="flex justify-between items-start">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          Resultado do período
        </span>
        <span className="material-symbols-outlined text-primary opacity-50">account_balance</span>
      </div>

      {estado ?? (
        <>
          <div className="mt-stack-sm flex items-end justify-between gap-4 flex-wrap">
            <div>
              <button
                onClick={() => onAbrir('faturamento')}
                className="text-left hover:opacity-80 transition-opacity"
              >
                <div className="font-data-display text-primary font-bold text-4xl leading-none">
                  {faturamento.texto}
                </div>
              </button>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-on-surface-variant opacity-60">faturado</span>
                {principal && (
                  <Variacao
                    comparacao={principal}
                    maiorEhMelhor
                    comRotulo={false}
                    className="text-xs"
                  />
                )}
              </div>
            </div>

            {margem !== null && (
              <div className="text-right">
                <div
                  className="font-data-display font-bold text-3xl leading-none"
                  style={{ color: margem >= 0 ? CORES_TENDENCIA.boa : CORES_TENDENCIA.ruim }}
                >
                  {percentual.format(margem).replace('+', '')}%
                </div>
                <div className="text-xs text-on-surface-variant opacity-60 mt-1">
                  margem de lucro
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-2 items-start">
            <Segmento
              rotulo="Custo dos insumos"
              valor={custo.textoCurto}
              fracao={fracaoCusto}
              cor={COR_CUSTO}
              metrica="custo"
              onAbrir={onAbrir}
            />
            <Segmento
              rotulo="Lucro"
              valor={lucro.textoCurto}
              fracao={fracaoLucro}
              cor={COR_LUCRO}
              metrica="lucro"
              onAbrir={onAbrir}
            />
          </div>

          <p className="mt-4 text-[11px] text-on-surface-variant opacity-50 leading-relaxed">
            A barra é proporcional ao faturamento do período. Custo considera apenas insumos —
            não inclui folha, aluguel ou demais despesas fixas.
          </p>
        </>
      )}
    </div>
  )
}

/**
 * Operação: pedidos e ticket médio. O ticket médio é derivado de dois números
 * que já temos, sem requisição nova, e responde a uma pergunta que nenhum card
 * atual responde — "vendemos mais porque veio mais gente ou porque cada um
 * gastou mais?".
 */
const CardOperacao = ({ onAbrir }: { onAbrir: AoAbrir }): JSX.Element => {
  const pedidos = useKpi('pedidos')
  const faturamento = useKpi('faturamento')

  const estado = estadoDoKpi(pedidos)
  const principal = pedidos.comparacoes[0]

  const ticket =
    pedidos.valor && pedidos.valor > 0 && faturamento.valor !== undefined
      ? faturamento.valor / pedidos.valor
      : null

  return (
    <button
      onClick={() => onAbrir('pedidos')}
      className="text-left bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md relative hover:border-primary/50 transition-colors w-full"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />

      <div className="flex justify-between items-start">
        <span className="font-label-caps text-label-caps text-on-surface-variant">Operação</span>
        <span className="material-symbols-outlined text-primary opacity-50">receipt_long</span>
      </div>

      {estado ?? (
        <>
          <div className="mt-stack-sm">
            <div className="font-data-display text-primary font-bold text-4xl leading-none">
              {pedidos.texto}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-on-surface-variant opacity-60">pedidos</span>
              {principal && (
                <Variacao
                  comparacao={principal}
                  maiorEhMelhor
                  comRotulo={false}
                  className="text-xs"
                />
              )}
            </div>
          </div>

          {ticket !== null && (
            <div className="mt-6 pt-4 border-t border-outline-variant">
              <div className="font-data-display text-primary font-bold text-2xl leading-none">
                {formatarValor(ticket, 'moeda')}
              </div>
              <div className="text-xs text-on-surface-variant opacity-60 mt-1">ticket médio</div>
            </div>
          )}
        </>
      )}
    </button>
  )
}

export const Dashboard4Page = (): JSX.Element => {
  const [detalhe, setDetalhe] = useState<MetricaKpi | null>(null)

  return (
    <VarianteShell variante={variante}>
      <div className="space-y-gutter">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
          <CardResultado onAbrir={setDetalhe} />
          <CardOperacao onAbrir={setDetalhe} />
        </div>

        <TiraPrevisao />

        <KpiDetalheModal metrica={detalhe} onClose={() => setDetalhe(null)} />
      </div>
    </VarianteShell>
  )
}
