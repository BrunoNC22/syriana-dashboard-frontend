# syriana-dashboard

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Demonstração (dados fictícios)

```bash
$ npm run demo
```

Abre o aplicativo sem banco de dados, com uma API de demonstração (`scripts/demo/demo-api.mjs`) que responde nos mesmos endpoints e no mesmo formato da API real, com cardápio, equipe e movimento inventados. Serve para apresentações e capturas de tela sem expor dados do restaurante. A senha do login é `demo`.

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
