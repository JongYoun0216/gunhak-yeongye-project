import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages 프로젝트 사이트(https://<user>.github.io/gunhak-yeongye-project/)로
// 배포하기 위해 빌드시에만 하위 경로 base를 사용한다. 로컬 dev 서버는 '/' 그대로.
const BASE = process.env.GH_PAGES === 'true' ? '/gunhak-yeongye-project/' : '/';

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: '호국실록 — GPS 지역탐험형 안보 팀빌딩',
        short_name: '호국실록',
        description: 'GPS + Web-AR + AI 기반 지역탐험형 안보 팀빌딩 미션 레이스',
        theme_color: '#f5f5f7',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/\{?s\}?\.?tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
    }),
  ],
});
