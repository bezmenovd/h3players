import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['client/headhunter.ts'],
  outDir: 'client/dist/headhunter',
  format: ['esm'],
  dts: false,
  sourcemap: false,
  target: 'esnext',
});