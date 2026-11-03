/**
 * Abre o aplicativo em MODO DEMONSTRAÇÃO, com dados 100% fictícios.
 *
 * Sobe a API de demonstração (demo-api.mjs) na porta da API real, compila o
 * app e abre o Electron a partir desta pasta, onde é gerado um
 * server-config.json de demonstração (ignorado pelo git). O main process lê a
 * configuração do process.cwd(), por isso o Electron é aberto daqui e não da
 * raiz do projeto. Nenhum banco de dados é acessado.
 *
 * Uso: npm run demo                                      (senha do login: demo)
 *      npm run demo -- --remote-debugging-port=9222      (argumentos extras vão para o Electron)
 */
import { spawn, spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const demoDir = dirname(fileURLToPath(import.meta.url))
const frontendDir = resolve(demoDir, '..', '..')

writeFileSync(
  join(demoDir, 'server-config.json'),
  JSON.stringify(
    {
      host: 'localhost',
      port: 3050,
      user: 'demo',
      password: 'demo',
      databaseFile: 'demonstracao-sem-banco.fdb',
      adminPassword: 'demo'
    },
    null,
    2
  )
)

const build = spawnSync('npx', ['electron-vite', 'build'], { cwd: frontendDir, stdio: 'inherit', shell: true })
if (build.status !== 0) process.exit(build.status ?? 1)

const api = spawn(process.execPath, [join(demoDir, 'demo-api.mjs')], { stdio: 'inherit' })

const app = spawn('npx', ['electron', `"${frontendDir}"`, ...process.argv.slice(2)], {
  cwd: demoDir,
  stdio: 'inherit',
  shell: true
})

const encerrar = () => {
  api.kill()
  app.kill()
}

app.on('exit', (code) => {
  api.kill()
  process.exit(code ?? 0)
})
process.on('SIGINT', encerrar)
process.on('SIGTERM', encerrar)
