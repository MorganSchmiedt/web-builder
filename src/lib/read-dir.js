'use strict'
/* eslint-env node */

const { lstat, readdir } = require('fs')
const { promisify } = require('util')
const { join, extname } = require('path')

const lstatAsync = promisify(lstat)

const encoding = { encoding: 'utf8' }

/**
 * @param {string} path
 * @param {boolean} filesOnly Excludes directory
 * @param {string} fileType Only includes a given fileType
 * @return {array} List of files
 */

module.exports = async opt => {
  const path = opt.path
  let fileStats

  try {
    fileStats = await lstatAsync(opt.path)
  } catch (err) {
    throw `Can't read ${path}`
  }

  if (fileStats.isFile()) {
    return [path]
  }

  if (fileStats.isDirectory()) {
    let dirList

    try {
      dirList = await promisify(readdir)(path, encoding)
    } catch (err) {
      return Promise.reject(`Can't read ${path}`)
    }

    if (typeof opt.fileType === 'string') {
      return dirList.map(filename => join(path, filename))
        .filter(filename => extname(filename, `.${opt.fileType}`))
    }

    if (opt.filesOnly === true) {
      const fileList = await Promise.all(dirList.map(async item => {
        const fullPath = join(path, item)

        const stats = await lstatAsync(fullPath)

        return (stats.isFile() ? fullPath : null)
      }))

      return fileList.filter(path => path !== null)
    }

    return dirList.map(file => join(path, file))
  }

  return Promise.reject('Source path must be a file or a directory.')
}
