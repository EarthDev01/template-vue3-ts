#!/usr/bin/env node
const upstream = process.argv[2] ?? ''

if (/(^|\/)(main|master)$/.test(upstream)) {
  console.error('rebase blocked: cannot rebase onto main or master')
  console.error(`   upstream: ${upstream}`)
  process.exit(1)
}
