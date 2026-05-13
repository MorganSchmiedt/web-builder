// @ts-check

import { lstat, readdir } from 'node:fs/promises'
import { join, extname } from 'path'

/**
 * @param {string} path Directory path
 * @param {object} [opt] Optional options
 * @param {boolean} [opt.filesOnly] Excludes directory
 * @param {string} [opt.fileType] Only includes a given fileType
 * @return {Promise<Array<string>>} List of files
 */
export default async(path, opt) => {
  let fileStats

  try {
    fileStats = await lstat(path)
  } catch {
    throw `Can't read ${path}`
  }

  if (fileStats.isFile()) {
    return [path]
  }

  if (fileStats.isDirectory()) {
    const fileType = opt?.fileType
    const filesOnly = opt?.filesOnly
    let dirList

    try {
      dirList = await readdir(path)
    } catch {
      return Promise.reject(`Can't read ${path}`)
    }

    if (fileType != null
    && typeof fileType === 'string') {
      return dirList.map(filename => join(path, filename))
        .filter(filename => extname(filename) === `.${fileType}`)
    }

    if (filesOnly === true) {
      const fileList = await Promise.all(dirList.map(async item => {
        const fullPath = join(path, item)

        const stats = await lstat(fullPath)

        return (stats.isFile() ? fullPath : null)
      }))

      return fileList.filter(path => path !== null)
    }

    return dirList.map(file => join(path, file))
  }

  return Promise.reject('Source path must be a file or a directory.')
}
