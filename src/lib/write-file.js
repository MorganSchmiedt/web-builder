'use strict'
/* eslint-env node */

const options = {
  encoding: 'utf8',
}

const {
  writeFile,
} = require('fs')

const {
  dirname,
} = require('path')

const createDirectory = require('./create-dir.js')

/**
 * Write date to local file.
 * @param {string} filename File name
 * @param {boolean} data File content
 */
module.exports = async(filename, data) => {
  // Create directory in case it does not exist
  await createDirectory(dirname(filename))

  await new Promise((resolve, reject) =>
    writeFile(filename, data, options, err => {
      if (err != null) {
        reject(err)
        return
      }

      resolve()
    }))
}
