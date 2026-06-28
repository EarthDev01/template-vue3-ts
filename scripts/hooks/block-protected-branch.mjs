#!/usr/bin/env node
import { execSync } from 'node:child_process'

const PROTECTED_BRANCHES = ['main', 'master', 'git-hook-main']

const branch = execSync('git symbolic-ref --short HEAD', { encoding: 'utf8' }).trim()

if (PROTECTED_BRANCHES.includes(branch)) {
  console.error(`❌ ห้าม commit ตรง ${branch}`)
  console.error('   สร้าง feature branch ก่อน: git checkout -b feat/your-feature')
  process.exit(1)
}
