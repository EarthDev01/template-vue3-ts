#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { basename, extname } from 'node:path'

// ดึงไฟล์ที่ staged ออกมา
const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACMR', {
  encoding: 'utf8',
})
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean)

const errors = []

for (const file of stagedFiles) {
  // ตรวจสอบว่าไฟล์อยู่ใน src/ หรือไม่
  if (!file.startsWith('src/')) continue

  const extension = extname(file)
  const name = basename(file, extension)

  // Vue component ต้องเป็น PascalCase
  if (extension === '.vue' && !/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    errors.push(`${file}: Vue component ต้องเป็น PascalCase (เช่น UserCard.vue)`)
    continue
  }

  // TypeScript/JavaScript ต้องเป็น camelCase หรือ index.ts
  if (
    (extension === '.ts' || extension === '.js') &&
    name !== 'index' &&
    !/^[a-z][a-zA-Z0-9]*$/.test(name)
  ) {
    errors.push(`${file}: ไฟล์ .ts/.js ต้องเป็น camelCase หรือ index.ts`)
  }
}

// ถ้ามี error ให้แสดงข้อความที่ผิดพลาด
if (errors.length > 0) {
  console.error('❌ filename convention failed:\n')
  for (const error of errors) {
    console.error(`   ${error}`)
  }
  process.exit(1)
}
