import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'downloads-mime-headers',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';
            if (url.includes('.pptx')) {
              res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
              res.setHeader('Content-Disposition', 'attachment; filename="GameON_Tele_EthioTelecom_Partnership_Proposal.pptx"');
              res.setHeader('Access-Control-Allow-Origin', '*');
            } else if (url.includes('.zip')) {
              res.setHeader('Content-Type', 'application/zip');
              res.setHeader('Content-Disposition', 'attachment; filename="GameON_Tele_EthioTelecom_Partnership_Proposal_Bundle.zip"');
              res.setHeader('Access-Control-Allow-Origin', '*');
            } else if (url.includes('.pdf')) {
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'inline; filename="GameON_Tele_EthioTelecom_Partnership_Proposal.pdf"');
              res.setHeader('Access-Control-Allow-Origin', '*');
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
