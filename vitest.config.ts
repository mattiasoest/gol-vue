import { defineConfig } from 'vitest/config'

/** Standalone config keeps tests decoupled from the main Vite Vue plugin graph. */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
})
