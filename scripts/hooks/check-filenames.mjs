#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { basename, extname } from 'node:path'

const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACMR', {
  encoding: 'utf8',
})
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean)

const errors = []

for (const file of stagedFiles) {
  if (!file.startsWith('src/')) continue

  const extension = extname(file)
  const name = basename(file, extension)

  if (extension === '.vue' && !/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    errors.push(`${file}: Vue component ต้องเป็น PascalCase (เช่น UserCard.vue)`)
    continue
  }

  if (
    (extension === '.ts' || extension === '.js') &&
    name !== 'index' &&
    !/^[a-z][a-zA-Z0-9]*$/.test(name)
  ) {
    errors.push(`${file}: ไฟล์ .ts/.js ต้องเป็น camelCase หรือ index.ts`)
  }
}

if (errors.length > 0) {
  console.error('❌ filename convention failed:\n')
  for (const error of errors) {
    console.error(`   ${error}`)
  }
  process.exit(1)
}
