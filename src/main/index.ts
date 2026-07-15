import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'

import { join } from 'path'

import { spawn, ChildProcess } from 'child_process'

import { existsSync, writeFileSync, readFileSync } from 'fs'

import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import icon from '../../resources/icon.png?asset'
import { FileLoggerAdapter } from './logger/FileLoggerAdapter'
import config from '../shared/config'
import { openWindow, openModal } from './windowManager'
import type { WindowOptions } from '../shared/windowOptions'

let backendProcess: ChildProcess | null = null

const CONFIG_FILE_NAME = 'server-config.json'
/** Senha usada quando o server-config.json não define `adminPassword` (configs legadas). */
const DEFAULT_ADMIN_PASSWORD = 'admin'
const logger = new FileLoggerAdapter(join(process.cwd(), 'log.txt'))

function getConfigPath(): string {
  const configFilePath = join(process.cwd(), CONFIG_FILE_NAME)
  logger.info(`Caminho do arquivo de configuração obtido: ${configFilePath}`)

  return configFilePath
}

function configExists(): boolean {
  return existsSync(getConfigPath())
}

function readServerConfig(): Record<string, unknown> | null {
  try {
    if (!configExists()) return null
    return JSON.parse(readFileSync(getConfigPath(), 'utf-8'))
  } catch (err) {
    logger.error(`Erro ao ler o arquivo de configuração: ${String(err)}`)
    return null
  }
}

/** Compara a senha informada com `adminPassword` do server-config.json. */
function verifyAdminPassword(password: string): boolean {
  const config = readServerConfig()
  const expected =
    typeof config?.adminPassword === 'string' && config.adminPassword.length > 0
      ? config.adminPassword
      : DEFAULT_ADMIN_PASSWORD

  return password === expected
}

function startBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info('Tentando iniciar backend')
    // desenvolvimento
    if (!app.isPackaged) {
      logger.info(
        'App em desenvolvimento, backend deve ser iniciado externamente. Pulando para proxima etapa'
      )
      return resolve()
    }

    const backendPath = join(process.resourcesPath, 'backend', 'www.exe')
    logger.info(`Iniciando backend da pasta ${backendPath}`)

    backendProcess = spawn(backendPath, [], {
      windowsHide: true,
      stdio: 'ignore'
    })

    backendProcess.on('spawn', () => {
      logger.info('Backend iniciado')
      resolve()
    })

    backendProcess.on('error', (err) => {
      logger.error(`Erro ao iniciar backend: ${err.name}\n${err.message}\n${err.stack}`)
      reject(err)
    })

    backendProcess.on('exit', (code) => {
      logger.info(`Backend encerrado com código ${code}`)
    })
  })
}

async function waitForBackend(): Promise<void> {
  await logger.info(`Buscando contato com backend.`)
  // desenvolvimento
  if (!app.isPackaged) {
    await logger.info('App em desenvolvimento, pulando para a proxima etapa.')
    return
  }

  for (let i = 0; i < 30; i++) {
    try {
      await logger.info(`Tentativa n ${i}...`)
      const response = await fetch(
        `${config.server.protocol}://${config.server.host}:${config.server.port}`
      )

      if (response.ok || response.status < 500) {
        return
      }
    } catch {
      await logger.info('API ainda não está pronta')
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  await logger.error('Backend não iniciou a tempo')
  throw new Error('Backend não iniciou a tempo')
}

function createMainWindow(): void {
  logger.info('Criando tela principal')
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,

    ...(process.platform === 'linux' ? { icon } : {}),

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),

      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    app.quit()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)

    return {
      action: 'deny'
    }
  })

  // A janela principal abre na tela de login; após autenticar o renderer
  // navega para o dashboard (`/`).
  const initialRoute = '/login'

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    logger.info(
      `Tela principal sera carregada a partir da url ${process.env['ELECTRON_RENDERER_URL']}`
    )
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${initialRoute}`)
  } else {
    const mainWindowFilePath = join(__dirname, '../renderer/index.html')
    logger.info(`Tela principal sera carregada a partir do arquivo ${mainWindowFilePath}`)
    mainWindow.loadFile(mainWindowFilePath, { hash: initialRoute })
  }
}

function createConfigWindow(): BrowserWindow {
  const configWindow = new BrowserWindow({
    width: 700,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Configuração do Servidor</title>

      <style>
        body {
          font-family: Arial;
          padding: 24px;
          background: #181818;
          color: white;
        }

        h1 {
          margin-bottom: 24px;
        }

        .field {
          margin-bottom: 16px;
        }

        label {
          display: block;
          margin-bottom: 6px;
        }

        input {
          width: 100%;
          padding: 10px;
          box-sizing: border-box;
        }

        .database-row {
          display: flex;
          gap: 8px;
        }

        button {
          padding: 10px 16px;
          cursor: pointer;
        }

        .save-button {
          width: 100%;
          margin-top: 24px;
        }

      </style>
    </head>

    <body>
      <h1>
        Configuração do Firebird
      </h1>

      <div class="field">
        <label>
          Host
        </label>
        <input
          id="host"
          value="localhost"
        />
      </div>

      <div class="field">
        <label>
          Porta
        </label>
        <input
          id="port"
          type="number"
          value="3050"
        />
      </div>

      <div class="field">
        <label>
          Usuário
        </label>
        <input
          id="user"
          value="SYSDBA"
        />
      </div>

      <div class="field">
        <label>
          Senha
        </label>
        <input
          id="password"
          value="masterkey"
        />
      </div>

      <div class="field">
        <label>
          Arquivo .fdb
        </label>
        <div class="database-row">
          <input id="databaseFile" />
          <button
            id="browseButton"
          >
            Procurar
          </button>
        </div>
      </div>

      <div class="field">
        <label>
          Senha de administrador (login do aplicativo)
        </label>
        <input
          id="adminPassword"
          type="password"
          value="admin"
        />
      </div>

      <button
        class="save-button"
        id="saveButton"
      >
        Salvar Configuração
      </button>

      <script>
        const {
          ipcRenderer
        } = require('electron')

        const browseButton =
          document.getElementById(
            'browseButton'
          )

        browseButton.addEventListener(
          'click',
          async () => {

            const result =
              await ipcRenderer.invoke(
                'select-database-file'
              )

            if (result) {

              document.getElementById(
                'databaseFile'
              ).value = result
            }
          }
        )

        const saveButton =
          document.getElementById(
            'saveButton'
          )

        saveButton.addEventListener(
          'click',
          async () => {

            const config = {

              host:
                document.getElementById(
                  'host'
                ).value,

              port:
                Number(
                  document.getElementById(
                    'port'
                  ).value
                ),

              user:
                document.getElementById(
                  'user'
                ).value,

              password:
                document.getElementById(
                  'password'
                ).value,

              databaseFile:
                document.getElementById(
                  'databaseFile'
                ).value,

              adminPassword:
                document.getElementById(
                  'adminPassword'
                ).value
            }

            await ipcRenderer.invoke(
              'save-server-config',
              config
            )
          }
        )

      </script>
    </body>
    </html>
  `

  configWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))

  return configWindow
}

async function ensureServerConfig(): Promise<void> {
  return new Promise((resolve) => {
    if (configExists()) {
      logger.info('Arquivo de configuração ja existe, pulando setup de configuração')
      return resolve()
    }

    logger.info('Arquivo de configuração não existe, iniciando tela de configuração.')
    const configWindow = createConfigWindow()

    ipcMain.handle('select-database-file', async () => {
      const result = await dialog.showOpenDialog(configWindow, {
        properties: ['openFile'],

        filters: [
          {
            name: 'Firebird Database',
            extensions: ['fdb']
          }
        ]
      })

      if (result.canceled) {
        return null
      }

      return result.filePaths[0]
    })

    ipcMain.handle('save-server-config', async (_, config) => {
      if (!config.databaseFile) {
        dialog.showErrorBox('Erro', 'Selecione um arquivo .fdb')

        return
      }

      const configInfo = JSON.stringify(config, null, 2)
      logger.info(`Informações de configuração obtidas: ${configInfo}\nSalvando configurações...`)

      logger.info('Escrevendo no arquivo de configuração...').then(async () => {
        writeFileSync(getConfigPath(), configInfo)
        await logger.info('Informações salvas com sucesso!')
        configWindow.close()
        return resolve()
      })
    })
  })
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('log:info', (_, data) => {
    logger.info(data)
  })
  ipcMain.on('log:warning', (_, data) => {
    logger.warning(data)
  })
  ipcMain.on('log:error', (_, data) => {
    logger.error(data)
  })

  ipcMain.handle('verify-admin-password', (_, password: string) => {
    const isValid = verifyAdminPassword(password)
    logger.info(`Verificação de senha de administrador: ${isValid ? 'sucesso' : 'falha'}`)
    return isValid
  })

  ipcMain.handle('open-window', (event, route: string, options: WindowOptions) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender) ?? undefined
    openWindow(route, options, parentWindow)
  })

  ipcMain.handle('open-modal', (event, route: string, options: WindowOptions) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender) ?? undefined
    openModal(route, options, parentWindow)
  })

  await ensureServerConfig()

  await startBackend()

  await waitForBackend()

  createMainWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// app.on('window-all-closed', () => {
//   if (backendProcess) {
//     backendProcess.kill()

//     backendProcess = null
//   }

//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

app.on('before-quit', () => {
  logger.info('Fechando aplicação')
  if (backendProcess) {
    logger.info('Matando backend')
    backendProcess.kill()

    backendProcess = null
  }
})
