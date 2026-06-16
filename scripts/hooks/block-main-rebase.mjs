#!/usr/bin/env node
const upstream = process.argv[2] ?? ''

if (/(^|\/)(main|master)$/.test(upstream)) {
  console.error('❌ ห้าม rebase main/master')
  console.error(`   upstream: ${upstream}`)
  process.exit(1)
}
