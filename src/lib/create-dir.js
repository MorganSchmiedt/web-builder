'use strict'

const {
  mkdir,
} = require('fs')

/**
 * Create directory
 * @param {string} directory Directory path
 */
module.exports = directory =>
  new Promise((resolve, reject) =>
    mkdir(directory, { recursive: true }, err => {
      if (err != null) {
        reject(err)
        return
      }

      resolve()
    }))
