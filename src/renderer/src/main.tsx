import './assets/main.css'
import './ChartJSConfig'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { configurarRelogio } from './appClock'

// O relógio de negócio precisa estar definido antes do primeiro render: o
// período default e os presets do DateRangePicker são derivados de hoje().
// Se o IPC falhar, segue com o relógio real em vez de deixar a tela em branco.
async function bootstrap(): Promise<void> {
  try {
    configurarRelogio(await window.api.getDataAtual())
  } catch (err) {
    window.logger?.warning?.(`Não foi possível resolver a data atual: ${String(err)}`)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>
  )
}

bootstrap()
