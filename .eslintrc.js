module.exports = {
  root: true,
  env: {
    node: true
  },
  settings: {
    'import/resolver': {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      },
      '@':  './',
    }
  },
  'extends': [
    'plugin:vue/recommended',
    'eslint:recommended',
    'eslint-config-airbnb-base'
  ],
  'plugins': [
    'standard',
    'import',
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
    semi: ["error", "always", { "omitLastInOneLineBlock": true }]
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
