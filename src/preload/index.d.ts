import { ElectronAPI } from '@electron-toolkit/preload'
import { LoggerOutputPort } from '../main/logger/LoggerOutputPort'
import { WindowOptions } from '../shared/windowOptions'

declare global {
  interface Window {
    electron: ElectronAPI & {
      openWindow: (route: string, options?: WindowOptions) => Promise<void>
      openModal: (route: string, options?: WindowOptions) => Promise<void>
    }
    api: {
      verifyAdminPassword: (password: string) => Promise<boolean>
    }
    logger: LoggerOutputPort
  }
}
