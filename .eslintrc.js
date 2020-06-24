module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
  },
  extends: ['standard', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'prettier/prettier': 'error',
  },
  globals: {
    describe: 'readonly',
    suite: 'readonly',
    test: 'readonly',
    it: 'readonly',
  },
}
