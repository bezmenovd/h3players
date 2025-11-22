import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['client/journalist.ts'],
  outDir: 'client/dist/journalist',
  format: ['esm'],
  dts: false,
  sourcemap: false,
  target: 'esnext',
});