'use strict'
/* eslint-env node, es6 */

const tagPrefix = '{{'

const tagDelimiter = ':'

const tagSuffix = '}}'

const {
  createHash,
} = require('crypto')

const {
  readFile,
} = require('fs')

const {
  promisify,
} = require('util')

const readFileAsync = promisify(readFile)

const readDir = require('./lib/read-dir.js')

const writeFile = require('./lib/write-file.js')

const findAsset = require('./lib/find-asset.js')

const encoding = { encoding: 'utf8' }

const build = async opt => {
  if (opt == null) {
    throw 'Option parameter is null.'
  }

  const showLog = opt.log === true
  const log = msg => {
    if (showLog) {
      /* eslint-disable-next-line no-console */
      console.log(msg)
    }
  }

  const fileList = new Map()
  const fileHashList = new Map()

  if (opt.source != null) {
    await Promise.all(opt.source.map(path =>
      readDir({
        path,
        filesOnly: true,
      }).then(files => {
        if (files == null) {
          throw `Invalid source ${path}`
        }

        return Promise.all(files.map(file =>
          readFileAsync(file, encoding).then(fileContent => {
            fileList.set(file, fileContent)
            fileHashList.set(file, getMD5Hash(fileContent))
          })))
      })))
  }

  for (const entry of opt.modules) {
    let moduleName = 'Unnamed'
    let moduleOpt
    let moduleFct

    if (typeof entry === 'string') {
      moduleFct = require(entry)
      moduleName = entry
    } else if (typeof entry === 'function') {
      moduleFct = entry
    } else {
      const param1 = entry[0]

      if (typeof param1 === 'string') {
        moduleFct = require(param1)
        moduleName = entry
      } else {
        moduleFct = param1
      }

      moduleOpt = entry[1]
    }

    log(`Executing module: ${moduleName}`)

    await moduleFct(fileList, moduleOpt || {}, {
      findAsset,
      getTagList,
      getTag,
      log,
    })
  }

  await Promise.all(
    Array.from(fileList.entries()).map(async([path, content]) => {
      const initialHash = fileHashList.get(path)

      // File were creating during building process
      if (initialHash == null) {
        log(`Creating ${path}`)

        await writeFile(path, content)
      }

      const hash = getMD5Hash(content)

      if (initialHash !== hash) {
        log(`Updating ${path}`)

        await writeFile(path, content)
      }
    }))
}

const getTagList = (tagName, text) => {
  const tag = tagPrefix + tagName + tagDelimiter

  const tagList = []

  let cursor = 0
  let indexOfTag = text.indexOf(tag, cursor)

  while (indexOfTag >= 0) {
    const tagStartIndex = indexOfTag + tag.length
    const tagEndIndex = text.indexOf(tagSuffix, tagStartIndex)

    if (tagEndIndex < 0) {
      throw 'no end tag'
    }

    const tagValue = text.substr(
      tagStartIndex,
      tagEndIndex - tagStartIndex)

    if (tagList.includes(tagValue) === false) {
      tagList.push(tagValue)
    }

    cursor = (tagEndIndex + tagSuffix.length)
    indexOfTag = text.indexOf(tag, cursor)
  }

  return tagList
}

const getTag = (tagName, tagValue) =>
  tagPrefix + tagName + tagDelimiter + tagValue + tagSuffix

const getMD5Hash = data =>
  createHash('MD5')
    .update(data)
    .digest('hex')

module.exports.build = build
module.exports.writeFile = writeFile
