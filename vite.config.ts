import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Derive repo name to configure base path for GitHub Pages deployments
  const repoName = (process.env.GITHUB_REPOSITORY || 'LShifter').split('/').pop() || 'LShifter';
  return {
    base: `/${repoName}/`, // GH Pages: serve under /<repo>/ path
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
