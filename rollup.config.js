const commonjs = require('rollup-plugin-commonjs')
const config = require('kcd-scripts/dist/config/rollup.config.js')

const cjsPluginIndex = config.plugins.findIndex(
  plugin => plugin.name === 'commonjs',
)
config.plugins[cjsPluginIndex] = commonjs({
  include: 'node_modules/**',
  namedExports: {
    'node_modules/react/index.js': [
      'useReducer',
      'useEffect',
      'useRef',
      'useState',
    ],
    'node_modules/keyboard-key/src/keyboardKey.js': ['getKey'],
    'node_modules/prop-types/index.js': [
      'func',
      'string',
      'any',
      'bool',
      'number',
      'array',
      'checkPropTypes',
    ],
  },
})

module.exports = config
