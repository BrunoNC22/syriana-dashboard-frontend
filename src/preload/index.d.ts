import { ElectronAPI } from '@electron-toolkit/preload'
import { LoggerOutputPort } from '../main/logger/LoggerOutputPort'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    logger: LoggerOutputPort
  }
}
