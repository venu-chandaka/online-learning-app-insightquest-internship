# Client (React + Vite + Tailwind)

Quick instructions to run the frontend locally:

1. Install dependencies

```powershell
cd D:\insightquest-internship\client
npm install
```

2. Start dev server

```powershell
npm run dev
# open http://localhost:5173
```

Notes:
- Tailwind is configured via `tailwind.config.cjs` and `postcss.config.cjs`.
- The frontend expects the backend API at `http://localhost:4000/api/auth` by default; change `REACT_APP_API_URL` to override.
- Protected routes use cookie-based JWT auth; ensure backend sets cookie and CORS allows credentials.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
