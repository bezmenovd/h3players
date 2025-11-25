import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['client/processor.ts'],
  outDir: 'client/dist/processor',
  format: ['esm'],
  dts: false,
  sourcemap: false,
  target: 'esnext',
});