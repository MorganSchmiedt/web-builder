// @ts-check

const tagPrefix = '{{'
const tagDelimiter = ':'
const tagSuffix = '}}'

import { createHash } from 'crypto'
import { readFile } from 'node:fs/promises'

import readDir from './lib/read-dir.js'
import writeFile from './lib/write-file.js'
import findAsset from './lib/find-asset.js'

/** @typedef {{findAsset: function, getTagList: function, getTag: function, log: function }} BuildModuleDefaultFunctions */
/** @typedef {function(Map<string, string>, object, BuildModuleDefaultFunctions): Promise<void>} ModuleFonction */
/** @typedef {string|ModuleFonction|[string|ModuleFonction, Object]} BuildModuleParam */

/**
 * Build with given options.
 * 
 * @param {object} opt
 * @param {Array<string>} [opt.source] List of directories or files to process
 * @param {Array<BuildModuleParam>} [opt.modules] List of modules to use
 * @param {boolean} [opt.log] Show logs
 */
const build = async opt => {
  if (opt == null) {
    throw 'Option parameter is null.'
  }

  const showLog = opt.log === true

  /**
   * @param {string} msg
   */
  const log = msg => {
    if (showLog) {
      console.log(msg)
    }
  }

  const fileList = new Map()
  const fileHashList = new Map()

  if (opt.source != null) {
    await Promise.all(opt.source.map(async path => {
      const files = await readDir(path, { filesOnly: true })

      if (files == null) {
        throw `Invalid source ${path}`
      }

      await Promise.all(files.map(async file => {
        const fileContent = await readFile(file)
          .then(buffer => buffer.toString())
        fileList.set(file, fileContent)
        fileHashList.set(file, getMD5Hash(fileContent))
      }))
    }))
  }

  if (opt.modules != null) {
    for (const entry of opt.modules) {
      /** @type {string} */
      let moduleName = 'Unnamed'
      /** @type {object} */
      let moduleOpt = {}
      /** @type {null|ModuleFonction} */
      let moduleFct = null

      if (typeof entry === 'string') {
        moduleFct = await import(entry)
          .then(mod => mod.default)
        moduleName = entry
      } else if (typeof entry === 'function') {
        moduleFct = entry
      } else if (Array.isArray(entry)) {
        const param1 = entry[0]

        if (typeof param1 === 'string') {
          moduleFct = await import(param1)
            .then(mod => mod.default)
          moduleName = param1
        } else if (typeof param1 === 'function') {
          moduleFct = param1
        }

        moduleOpt = entry[1]
      } 

      if (moduleFct != null) {
        log(`Executing module: ${moduleName}`)

        await moduleFct(fileList, moduleOpt ?? {}, {
          findAsset,
          getTagList,
          getTag,
          log,
        })
      }
    } 
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

/**
 * Finds a list of tags in a text.
 * 
 * @param {string} tagName
 * @param {string} text
 */
const getTagList = (tagName, text) => {
  const tag = tagPrefix + tagName + tagDelimiter

  /** @type {Array<string>} */
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

/**
 * Generate a specific tag.
 * 
 * @param {string} tagName
 * @param {string} tagValue
 */
const getTag = (tagName, tagValue) =>
  tagPrefix + tagName + tagDelimiter + tagValue + tagSuffix

/**
 * Generate MD5 Hash of a text
 * 
 * @param {string} data
 */
const getMD5Hash = data =>
  createHash('MD5')
    .update(data)
    .digest('hex')

export default { build, writeFile }
