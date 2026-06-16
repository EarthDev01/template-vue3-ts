#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const ROOT = process.cwd()
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage'])
const SCAN_EXTENSIONS = new Set(['.ts', '.js', '.vue', '.json', '.yaml', '.yml', '.env'])
const ROOT_FILES = ['package.json', 'vite.config.ts', 'eslint.config.js']

const SECRET_PATTERNS = [
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Personal Access Token', regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'GitHub OAuth Token', regex: /gho_[a-zA-Z0-9]{36}/ },
  { name: 'GitHub Fine-grained PAT', regex: /github_pat_[a-zA-Z0-9_]{82}/ },
  { name: 'Private Key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  {
    name: 'Hardcoded credential',
    regex: /(?:api[_-]?key|secret|token|password|credential)\s*[:=]\s*['"][^'"\s]{8,}['"]/i,
  },
]

function collectFiles(dir, files = []) {
  if (!statSync(dir).isDirectory()) return files

  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue

    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      collectFiles(fullPath, files)
      continue
    }

    const extension = extname(entry)
    if (SCAN_EXTENSIONS.has(extension) || entry.startsWith('.env')) {
      files.push(fullPath)
    }
  }

  return files
}

function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const findings = []

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.regex.test(content)) {
      findings.push({ filePath, rule: pattern.name })
    }
  }

  return findings
}

const filesToScan = [
  ...collectFiles(join(ROOT, 'src')),
  ...ROOT_FILES.map((file) => join(ROOT, file)).filter((file) => {
    try {
      return statSync(file).isFile()
    } catch {
      return false
    }
  }),
]

const findings = filesToScan.flatMap(scanFile)

if (findings.length > 0) {
  console.error('❌ พบ secret ที่อาจเป็นความเสี่ยง (API key, token, credential):\n')
  for (const finding of findings) {
    console.error(`   ${finding.filePath} — ${finding.rule}`)
  }
  console.error('\n   ลบหรือย้ายไป environment variable ก่อน push')
  process.exit(1)
}

console.log('✅ secret scan passed')
