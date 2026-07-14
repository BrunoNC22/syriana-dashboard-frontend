import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { LoggerOutputPort } from '../main/logger/LoggerOutputPort'
import type { WindowOptions } from '../shared/windowOptions'

// Custom APIs for renderer
const api = {}
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
