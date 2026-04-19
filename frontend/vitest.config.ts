/**
 * Vitest 配置文件
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: [
      'src/tests/**/*.test.{ts,tsx}',
      'src/pages/**/*.{test,spec}.{ts,tsx}',
      'src/components/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['node_modules', 'dist', '.git', 'src/components/budget/BudgetManager.interaction.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        '.git',
        '**/*.d.ts',
        '**/*.config.*',
        '**/setup.ts',
      ],
    },
    // 测试超时设置
    testTimeout: 10000,
    hookTimeout: 10000,
    // 串行执行避免 ESM 问题
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // 失败时重试次数
    retries: 0,
    // 环境变量
    env: {
      VITE_API_BASE_URL: 'http://localhost:8001/api',
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './src/tests'),
    },
  },
});
