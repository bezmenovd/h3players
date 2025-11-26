import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['client/background.ts'],
  outDir: 'client/dist/background',
  format: ['esm'],
  dts: false,
  sourcemap: false,
  target: 'esnext',
});