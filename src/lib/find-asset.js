
'use strict'
/* eslint-env node */

const {
  access,
} = require('fs')

const {
  promisify,
} = require('util')

const {
  join,
} = require('path')

const accessAsync = promisify(access)

module.exports = async(file, assets) => {
  for (const assetPath of assets) {
    const filepath = join(assetPath, file)

    try {
      await accessAsync(filepath)

      return filepath
    } catch (err) {
      // Not in this directory
    }
  }

  throw `File not found ${file}`
}
