/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'coverage', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: '18.3' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // The project still writes `import React from 'react'` defensively in
    // some files; the new JSX transform doesn't need it, so don't flag it.
    'react/react-in-jsx-scope': 'off',
    // App.jsx and several screens accept props without prop-types; the
    // repo isn't using prop-types as a system, so disable rather than
    // half-adopt it.
    'react/prop-types': 'off',
    // Raw apostrophes in JSX text are fine in modern React; the rule is
    // largely a holdover from older HTML-injection concerns.
    'react/no-unescaped-entities': 'off',
    // Cross-origin postMessage / iframe checks in iframeBridge.js swallow
    // errors intentionally; permit empty catch blocks specifically.
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
};
