import { JSX } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { hoje, isDataSimulada } from '@renderer/appClock'

type ItemDeNavegacao = {
  rota: string
  icone: string
  rotulo: string
}

const ITENS: ItemDeNavegacao[] = [
  { rota: '/', icone: 'dashboard', rotulo: 'Dashboard' },
  { rota: '/garcons', icone: 'groups', rotulo: 'Garçons' },
  { rota: '/saude-cardapio', icone: 'health_and_safety', rotulo: 'Saúde do cardápio' },
  { rota: '/relatorio-compras', icone: 'shopping_cart', rotulo: 'Relatório de compras' }
]

/**
 * Aviso de que a aplicação está com data simulada (só em desenvolvimento).
 * Fica no rodapé da sidebar para aparecer em todas as telas — sem ele, um
 * dashboard "parado" num mês antigo vira bug fantasma.
 */
const DataSimuladaChip = (): JSX.Element | null => {
  if (!isDataSimulada()) return null

  return (
    <div
      className="mx-2 mb-2 px-2 py-2 border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1.5 justify-center lg:justify-start"
      title={`Data simulada: ${hoje().toLocaleDateString('pt-BR')} — definido por 'dataAtualSimulada' no server-config.json. Não vale no app empacotado.`}
    >
      <span className="material-symbols-outlined text-base shrink-0">schedule</span>
      <span className="hidden lg:inline truncate">{hoje().toLocaleDateString('pt-BR')}</span>
    </div>
  )
}

const ItemDaSidebar = ({ item }: { item: ItemDeNavegacao }): JSX.Element => (
  <li>
    <NavLink
      to={item.rota}
      // `end` só no dashboard: sem isso a rota "/" casaria com todas.
      end={item.rota === '/'}
      title={item.rotulo}
      className={({ isActive }) =>
        `px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-bold transition-colors justify-center lg:justify-start ${
          isActive
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-primary/5 border border-transparent'
        }`
      }
    >
      <span className="material-symbols-outlined text-xl shrink-0">{item.icone}</span>
      <span className="hidden lg:inline truncate">{item.rotulo}</span>
    </NavLink>
  </li>
)

/**
 * Chrome da janela principal: sidebar de navegação + área de conteúdo.
 *
 * Envolve apenas as telas de nível superior (dashboard, garçons, saúde do
 * cardápio, relatório de compras). Janelas filhas — detalhes de produto,
 * insumo, garçom e os rankings — carregam suas rotas direto, sem sidebar:
 * são janelas de consulta pontual, onde navegação lateral só tomaria espaço.
 *
 * `print:hidden` na sidebar é obrigatório: o PDF do relatório de compras sai
 * de `printToPDF` da própria janela, então sem isso a navegação apareceria
 * impressa ao lado da tabela.
 */
export const AppLayout = (): JSX.Element => {
  return (
    <div className="flex min-h-screen">
      <nav className="sticky top-0 h-screen shrink-0 w-16 lg:w-60 border-r border-outline-variant bg-surface-container-low flex flex-col print:hidden">
        <div className="px-2 lg:px-4 py-6 flex items-center gap-2 justify-center lg:justify-start">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0">
            restaurant
          </span>
          <span className="hidden lg:inline font-h1 text-primary text-h3 truncate">Syriana</span>
        </div>

        <ul className="flex-1 px-2 space-y-1">
          {ITENS.map((item) => (
            <ItemDaSidebar key={item.rota} item={item} />
          ))}
        </ul>

        <DataSimuladaChip />
      </nav>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
