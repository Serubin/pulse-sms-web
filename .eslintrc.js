module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/recommended',
    'eslint:recommended'
  ],
    rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'indent': ["error", 4, { "SwitchCase": 1 }],
    'vue/max-attributes-per-line': "off",
    'vue/require-prop-types': "off",
    "vue/html-indent":  ["error", 4, {}],
    "vue/html-self-closing": ["error", {
      "html": {
       "void": "never",
       "normal": "never",
       "component": "always"
      },
      "svg": "never",
      "math": "never"
    }],
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
