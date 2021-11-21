import typescript from '@rollup/plugin-typescript'
import { join } from 'path'

const distDir = join(__dirname, '../dist/extension')

const tsPlugin = typescript({ rootDir: '../' })

export default [{
  input: 'background.ts',
  output: {
    file: join(distDir, 'background.js'),
    format: 'iife'
  },
  plugins: [tsPlugin]
}, {
  input: 'contentScript.ts',
  output: {
    file: join(distDir, 'contentScript.js'),
    format: 'iife'
  },
  plugins: [tsPlugin]
}, {
  input: 'popup.ts',
  output: {
    file: join(distDir, 'popup.js'),
    format: 'iife'
  },
  plugins: [tsPlugin]
}]
