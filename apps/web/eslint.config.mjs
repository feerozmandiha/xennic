import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx}'],
  },
  {
    ignores: ['.next/**', 'next-env.d.ts'],
  },
];
