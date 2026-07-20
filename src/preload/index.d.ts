import { ElectronAPI } from '@electron-toolkit/preload'
import { LoggerOutputPort } from '../main/logger/LoggerOutputPort'
import { WindowOptions } from '../shared/windowOptions'
import { ExportResult } from '../shared/exportResult'

declare global {
  interface Window {
    electron: ElectronAPI & {
      openWindow: (route: string, options?: WindowOptions) => Promise<void>
      openModal: (route: string, options?: WindowOptions) => Promise<void>
    }
    api: {
      verifyAdminPassword: (password: string) => Promise<boolean>
      exportarPdf: (nomeSugerido: string) => Promise<ExportResult>
      exportarCsv: (conteudo: string, nomeSugerido: string) => Promise<ExportResult>
    }
    logger: LoggerOutputPort
  }
}
