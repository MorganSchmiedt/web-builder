// @ts-check

import { access } from 'node:fs/promises'
import { join } from 'path'

/**
 * Tries to find a specific local file.
 * 
 * @param {string} filename
 * @param {Array<string>} directoryList
 * @returns {Promise<string>} File path
 */
export default async(filename, directoryList) => {
  for (const assetPath of directoryList) {
    const filepath = join(assetPath, filename)

    try {
      await access(filepath)

      return filepath
    } catch {
      // Not in this directory
    }
  }

  throw `File not found ${filename}`
}
