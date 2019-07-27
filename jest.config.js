const jestConfig = require('kcd-scripts/jest')

module.exports = Object.assign(jestConfig, {
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
})
