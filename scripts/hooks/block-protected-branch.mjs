#!/usr/bin/env node
import { execSync } from 'node:child_process'

const PROTECTED_BRANCHES = ['main', 'master', 'git-hook-main']

const branch = execSync('git symbolic-ref --short HEAD', { encoding: 'utf8' }).trim()

if (PROTECTED_BRANCHES.includes(branch)) {
  console.error(`commit blocked: cannot commit directly on ${branch}`)
  console.error('create a feature branch first with git checkout -b feat/your-feature')
  process.exit(1)
}
