#!/usr/bin/env node
/**
 * Secret Scanner — ใช้กับ Git hooks (.husky/pre-push, post-checkout)
 *
 * สแกนไฟล์ใน src/ และ config หลักของโปรเจกต์
 * หา API key, token, private key ที่ hardcode ไว้ในโค้ด
 * ถ้าพบ → exit(1) บล็อก push / checkout
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const ROOT = process.cwd()

// โฟลเดอร์ที่ไม่ต้องสแกน (dependency, build output, git metadata)
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage'])

// นามสกุลไฟล์ที่มักมี config / credential
const SCAN_EXTENSIONS = new Set(['.ts', '.js', '.vue', '.json', '.yaml', '.yml', '.env'])

// ไฟล์ root ที่อาจมี secret ปน (เช่น hardcode ใน vite config)
const ROOT_FILES = ['package.json', 'vite.config.ts', 'eslint.config.js']

// รูปแบบ secret ที่ตรวจ — heuristic ไม่ครอบคลุมทุก case
const SECRET_PATTERNS = [
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Personal Access Token', regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'GitHub OAuth Token', regex: /gho_[a-zA-Z0-9]{36}/ },
  { name: 'GitHub Fine-grained PAT', regex: /github_pat_[a-zA-Z0-9_]{82}/ },
  { name: 'Private Key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  {
    name: 'Hardcoded credential',
    // จับคู่ key=value เช่น api_key = "xxx", password: "xxx" (ค่ายาว ≥ 8 ตัว)
    regex: /(?:api[_-]?key|secret|token|password|credential)\s*[:=]\s*['"][^'"\s]{8,}['"]/i,
  },
]

/** รวบรวมไฟล์ที่ต้องสแกนจาก directory แบบ recursive */
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
    // รวมไฟล์ .env* ด้วย (เช่น .env.local) แม้ extname จะเป็น .local
    if (SCAN_EXTENSIONS.has(extension) || entry.startsWith('.env')) {
      files.push(fullPath)
    }
  }

  return files
}

/** อ่านไฟล์แล้วจับคู่กับ SECRET_PATTERNS ทุก rule */
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

// รายการไฟล์ที่จะสแกน = src/** + ไฟล์ root ที่มีอยู่จริง
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
  console.error('secret scan failed: possible API key, token, or credential found')
  for (const finding of findings) {
    console.error(`  ${finding.filePath} ${finding.rule}`)
  }
  console.error('remove or move secrets to environment variables before push')
  process.exit(1)
}
