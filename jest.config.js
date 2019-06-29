
const jestConfig = require('kcd-scripts/jest')

module.exports = Object.assign(jestConfig, {
  'coverageThreshold': {
    'global': {
      'branches': 70,
      'functions': 70,
      'lines': 70,
      'statements': 70
    }
  }
})