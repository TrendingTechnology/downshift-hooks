
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
    ],
    'node_modules/lodash/lodash.js': [
      'findIndex',
    ],
    'node_modules/keyboard-key/src/keyboardKey.js': [
      'getKey',
    ],
  },
})

module.exports = config