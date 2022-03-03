module.exports = {
  extends: [
    'plugin:node/recommended-module',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['prettier', '@typescript-eslint'],
  env: {
    jest: true,
    browser: true,
    node: true,
  },
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
  },
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      node: {
        paths: ['./src'],
      },
    },
  },
  globals: {
    window: 'readonly',
  },
  rules: {
    'prettier/prettier': 'error',
    'import/named': 'off',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    'import/no-cycle': 'off',
    'import/no-unresolved': 'off',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling'], 'index'],
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
      },
    ],
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
      },
    ],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/type-annotation-spacing': [
      'error',
      {
        before: false,
        after: true,
        overrides: { arrow: { before: true, after: true } },
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        allowSingleExtends: true,
      },
    ],
    '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'enum',
        format: ['UPPER_CASE'],
      },
    ],
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'lines-between-class-members': 'off',
    'no-undef': 'off',
    'consistent-return': 'off',
    'default-case': 'off',
    'node/file-extension-in-import': 'off',
    'node/no-missing-import': 'off',
  },
};
