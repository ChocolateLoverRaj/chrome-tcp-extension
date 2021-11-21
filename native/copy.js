const { copyFile } = require('fs/promises')
const { join } = require('path')
const { writeFile, readFile } = require('jsonfile')
const ensureDir = require('@appgeist/ensure-dir')

const destDir = join(__dirname, '../dist/native')

const files = [
  'native.bat',
  'setupNative.bat'
]

console.time('copy')
ensureDir(destDir).then(() => Promise.all([
  ...files.map(async file => await copyFile(join(__dirname, file), join(destDir, file))),
  // Uglify
  (async () => {
    const nativeJsonPath = 'native.json'
    await writeFile(join(destDir, nativeJsonPath), await readFile(join(__dirname, nativeJsonPath)))
  })()
]))
  .then(() => {
    console.timeEnd('copy')
  }, e => {
    console.error(e)
    process.exitCode = 1
  })
