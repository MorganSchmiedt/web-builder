// @ts-check

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'path'

/**
 * Write data to a local file.
 * @param {string} filepath File path
 * @param {string} data File content
 */
export default async(filepath, data) => {
  await mkdir(dirname(filepath), { recursive: true })
  await writeFile(filepath, data)
}
