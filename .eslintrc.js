module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'eslint:recommended',
    'plugin:vue/essential',
    '@vue/standard'
  ],
  'plugins': [
    'standard',
  ],
    rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    indent: ['error', 4, { SwitchCase: 1 }],
    'vue/max-attributes-per-line': 'off',
    'vue/require-prop-types': 'off',
    'vue/html-indent':  ['error', 4, {}],
    'vue/html-self-closing': ['error', {
      html: {
       'void': 'never',
       normal: 'never',
       component: 'always'
      },
      svg: 'never',
      math: 'never'
    }],
    semi: ['error', 'always', { omitLastInOneLineBlock: true }]
  },
  parserOptions: {
    parser: 'babel-eslint',
    babelOptions: {
      configFile: './babel.config.js',
    },
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
