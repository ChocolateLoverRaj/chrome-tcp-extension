import { readFileSync, writeFileSync } from 'jsonfile'
import { join } from 'path'
import { createInterface } from 'readline'

const lineReader = createInterface(process.stdin, process.stdout)
lineReader.question('Chrome extension id: ', id => {
  lineReader.close()
  const nativeJsonPath = join(__dirname, 'native.json')

  const nativeJson = readFileSync(nativeJsonPath)
  nativeJson.allowed_origins = [`chrome-extension://${id}/`]
  writeFileSync(nativeJsonPath, nativeJson)
})
