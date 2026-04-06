/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  content: [
    "./index.html",
    "./**/*.{ts,tsx}"
  ],
  theme: {
    fontSize: {
      // 微小标签文字
      '4xs': ['10px', { lineHeight: '1rem', fontWeight: '700' }],
      '3xs': ['11px', { lineHeight: '1.1rem', fontWeight: '600' }],
      '2xs': ['12px', { lineHeight: '1.25rem', fontWeight: '600' }],
      // Tailwind 默认
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
    },
    extend: {
      // 全局字体粗细
      fontWeight: {
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
      },
      // 统一圆角 (与 CSS --radius-* 变量保持一致)
      borderRadius: {
        'sm': '0.5rem',    /* 8px - 按钮、输入框 */
        'md': '0.75rem',   /* 12px - 小卡片、徽章 */
        'DEFAULT': '1rem',  /* 16px - 主卡片 */
        'lg': '1rem',
        'xl': '1.5rem',    /* 24px - 大卡片、模态框 */
        '2xl': '2rem',     /* 32px - 特大卡片 */
        'full': '9999px',  /* 胶囊形状 */
      },
      // 统一阴影
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      // 统一间距
      spacing: {
        'xs': '0.5rem',    /* 8px */
        'sm': '0.75rem',   /* 12px */
        'md': '1rem',      /* 16px */
        'lg': '1.5rem',    /* 24px */
        'xl': '2rem',      /* 32px */
      },
      // 统一过渡动画
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
    }
  },
  plugins: [tailwindcssAnimate]
};
