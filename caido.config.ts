import { defineConfig } from '@caido-community/dev';

export default defineConfig({
  id: "ssrf-scanner",
  name: "SSRF Scanner",
  description: "Detects SSRF vectors by analyzing and probing request bodies for URLs.",
  version: "4.2.0",
  author: {
    "name": "BigCod3"
  },
  plugins: [
    {
      kind: "backend",
      id: "ssrf-scanner-backend",
      root: "packages/backend"
    },
    {
      kind: 'frontend',
      id: "ssrf-scanner-frontend",
      root: 'packages/frontend',
      backend: {
        id: "ssrf-scanner-backend",
      },
    }
  ],
});