export interface WindowOptions {
  width?: number | `${number}%`
  height?: number | `${number}%`
  title?: string
  modal?: boolean
  resizable?: boolean
  maximizable?: boolean
  minimizable?: boolean
  alwaysOnTop?: boolean
  frame?: boolean
  transparent?: boolean
  center?: boolean
}
