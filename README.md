# Sistema de Agendamento de Consultas (React + Vite + Tailwind)

Este projeto demonstra duas features principais:

* **Agendamento de consulta**
* **Cancelamento de consulta**

Interface SPA moderna com React 18, roteamento via React‑Router 6 e design em Tailwind CSS.

---

## 🚧 Requisitos

| Ferramenta / Biblioteca | Versão mínima | Observação |
| ----------------------- | ------------- | ---------- |
| **Node.js**             | 18 LTS ou 20 LTS | `nvm` / `nvm‑windows` recomendado |
| **npm**                 | ≥ 9           | já incluso no Node 20 |
| **Vite**                | 5.1.x         | instalado em *devDependencies* |
| **React**               | 18.x          | |
| **react‑router‑dom**    | 6.x           | |
| **Tailwind CSS**        | 3.4.x         | compilado via PostCSS |
| **date‑fns**            | 3.x           | utils de data/hora |

---

## 🔧 Instalação & Execução local

```bash
# clone o repositório
git clone https://github.com/<seu-user>/<seu-repo>.git
cd <seu-repo>

# instala todas as dependências
npm install

# dev‑server com hot‑reload (http://localhost:5173)
npm run dev

# build de produção (gera ./dist)
npm run build

# preview do build de produção
npm run preview
```

---

## 📁 Estrutura de Pastas (essencial)

```
├─ public/
│  └─ index.html                # ponto de entrada
├─ src/
│  ├─ AppointmentScheduler.tsx  # lógica principal (contexto, rotas, UI)
│  ├─ App.jsx                   # wrapper → export default
│  ├─ main.jsx                  # ReactDOM.createRoot
│  ├─ index.css                 # @tailwind base/components/utilities
│  └─ ...
├─ tailwind.config.(c)js        # paths + tema
├─ postcss.config.cjs           # tailwindcss + autoprefixer
└─ vite.config.(t)s             # plugins
```

---

## 📜 Scripts `package.json`

```jsonc
{
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview",
    "lint":    "eslint src --ext .js,.jsx,.ts,.tsx"
  }
}
```

---

## 🌱 Variáveis de Ambiente

Não há variáveis obrigatórias para rodar localmente.  
Se futuramente precisar de chaves/API, crie um arquivo `.env` e leia via `import.meta.env`.

---

## 🚀 Publicar no GitHub via CLI (VS Code)

### Repo **novo**

```bash
git init
git add .
git commit -m "feat: initial commit"

# cria repo no GitHub (gh CLI) e configura remote
gh repo create <user>/<repo> --public --source=. --remote=origin

git branch -M main
git push -u origin main
```

### Repo **existente** (clone vazio)

```bash
git remote add origin https://github.com/<user>/<repo>.git
git add .
git commit -m "feat: initial commit"
git push -u origin main
```

> Use o painel **Source Control** do VS Code para commits/push se preferir UI.

---

## 📝 Licença

não há necessidades de licença
