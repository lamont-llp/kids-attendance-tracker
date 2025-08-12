/**
 * ESLint configuration for Next.js 15 + React 19 + TypeScript.
 * Aligned with project guidelines: TypeScript strict, Jest support, and Prettier compatibility.
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
  ],
  env: {
    browser: true,
    node: true,
    es2022: true,
    'jest/globals': true,
  },
  settings: {
    jest: {
      version: 29,
    },
  },
  ignorePatterns: ['.next/', 'node_modules/', 'drizzle/'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
