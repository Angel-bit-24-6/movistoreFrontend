// eslint.config.cjs
module.exports = [
    {
      files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
      languageOptions: {
        parser: require('@typescript-eslint/parser'),
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
          // project: './tsconfig.json', // descomenta si quieres reglas que usan type-checking
        },
      },
  
      plugins: {
        '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
        react: require('eslint-plugin-react'),
        'react-hooks': require('eslint-plugin-react-hooks'),
        'react-native': require('eslint-plugin-react-native'),
      },
  
      rules: {
        // reglas principales
        'react-native/no-raw-text': 'error',
        'react/prop-types': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      },
  
      settings: {
        react: { version: 'detect' },
      },
    },
];
  