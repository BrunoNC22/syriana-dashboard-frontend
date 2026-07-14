import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import type { WindowOptions } from '../shared/windowOptions'

function resolveSize(
  value: number | `${number}%` | undefined,
  workAreaSize: number,
  fallback: number
): number {
  if (value === undefined) return fallback
  if (typeof value === 'number') return value
  const percent = parseFloat(value) / 100
  return Math.round(workAreaSize * percent)
}

export function openWindow(
  route: string,
  options: WindowOptions = {},
  parentWindow?: BrowserWindow
): BrowserWindow {
  const referencePoint = parentWindow
    ? { x: parentWindow.getBounds().x, y: parentWindow.getBounds().y }
    : screen.getCursorScreenPoint()

  const { width: workWidth, height: workHeight } =
    screen.getDisplayNearestPoint(referencePoint).workArea

  const width = resolveSize(options.width, workWidth, 800)
  const height = resolveSize(options.height, workHeight, 600)

  const win = new BrowserWindow({
    width,
    height,
    title: options.title,
    modal: options.modal ?? false,
    parent: options.modal && parentWindow ? parentWindow : undefined,
    resizable: options.resizable ?? true,
    maximizable: options.maximizable ?? true,
    minimizable: options.minimizable ?? true,
    alwaysOnTop: options.alwaysOnTop ?? false,
    frame: options.frame ?? true,
    transparent: options.transparent ?? false,
    center: options.center ?? true,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('ready-to-show', () => win.show())

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${route}`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: route })
  }

  return win
}

export function openModal(
  route: string,
  options: WindowOptions = {},
  parentWindow?: BrowserWindow
): BrowserWindow {
  return openWindow(route, { ...options, modal: true }, parentWindow)
}
