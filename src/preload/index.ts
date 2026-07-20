import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { LoggerOutputPort } from '../main/logger/LoggerOutputPort'
import type { WindowOptions } from '../shared/windowOptions'
import type { ExportResult } from '../shared/exportResult'

// Custom APIs for renderer
const api = {
  verifyAdminPassword: (password: string): Promise<boolean> =>
    ipcRenderer.invoke('verify-admin-password', password),
  /** Exporta a janela atual como PDF (printToPDF no main). */
  exportarPdf: (nomeSugerido: string): Promise<ExportResult> =>
    ipcRenderer.invoke('export-pdf', nomeSugerido),
  /** Salva um CSV já montado no renderer. */
  exportarCsv: (conteudo: string, nomeSugerido: string): Promise<ExportResult> =>
    ipcRenderer.invoke('export-csv', conteudo, nomeSugerido)
}
const logger: LoggerOutputPort = {
  log: async (props) => {
    ipcRenderer.send(`log:${props.logLevel}`, props.info)
  },

  info: async (data: string) => {
    ipcRenderer.send('log:info', data)
  },

  warning: async (data: string) => {
    ipcRenderer.send('log:warning', data)
  },

  error: async (data: string) => {
    ipcRenderer.send('log:error', data)
  }
}

const customElectron = {
  ...electronAPI,
  openWindow: (route: string, options?: WindowOptions): Promise<void> =>
    ipcRenderer.invoke('open-window', route, options),
  openModal: (route: string, options?: WindowOptions): Promise<void> =>
    ipcRenderer.invoke('open-modal', route, options)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', customElectron)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('logger', logger)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = customElectron
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.logger = logger
}
