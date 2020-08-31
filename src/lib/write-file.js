'use strict'
/* eslint-env node */

const options = {
  encoding: 'utf8',
}

const { writeFile } = require('fs')

module.exports = (filename, data) =>
  new Promise((resolve, reject) => {
    writeFile(filename, data, options, err => {
      if (err != null) {
        return reject(`Can't write file ${filename}.`)
      }

      return resolve()
    })
  })
