import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'ts/ban-types': 'off',
    'no-console': 'off',
    'node/prefer-global/process': 'off',
    'no-void': 'off',
    'no-case-declarations': 'off',
    'antfu/if-newline': 'off',
  },
})
