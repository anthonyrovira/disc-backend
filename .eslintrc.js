module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@darraghor/nestjs-typed', '@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@darraghor/nestjs-typed/recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:prettier/recommended',
  ],
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
    ecmaVersion: 'es2019',
  },
  parser: '@typescript-eslint/parser',
  root: true,
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
