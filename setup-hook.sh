#!/usr/bin/env bash

set -euo pipefail

echo "▶ Installing dev dependencies..."
npm install -D \
  husky \
  lint-staged \
  @commitlint/cli \
  @commitlint/config-conventional \
  eslint \
  prettier \
  eslint-plugin-simple-import-sort \
  eslint-plugin-vue \
  @vue/eslint-config-typescript \
  vue-tsc

echo "▶ Initializing husky..."
npx husky init

echo "▶ Creating commitlint.config.js..."
cat << 'EOF' > commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'docs', 'refactor', 'test', 'ci']],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],
  },
}
EOF

echo "▶ Creating eslint.config.js..."
cat << 'EOF' > eslint.config.js
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'

export default defineConfigWithVueTs(
  { ignores: ['dist/', 'node_modules/', 'coverage/'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
)
EOF

echo "▶ Updating package.json scripts & lint-staged..."
node << 'EOF'
import { readFileSync, writeFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

if (pkg.dependencies?.prettier) {
  pkg.devDependencies = pkg.devDependencies ?? {}
  pkg.devDependencies.prettier = pkg.dependencies.prettier
  delete pkg.dependencies.prettier
}

delete pkg.devDependencies?.undefined

pkg.scripts = {
  ...pkg.scripts,
  prepare: 'husky',
  lint: 'eslint . --fix',
  'lint:check': 'eslint .',
  'type-check': 'vue-tsc --build',
  'lint-staged': 'lint-staged',
  validate: 'npm run lint:check && npm run type-check',
}

pkg['lint-staged'] = {
  '*.{vue,ts,js,mjs,cjs}': ['prettier --write', 'eslint --fix'],
  '*.{json,css,md,html}': 'prettier --write',
}

writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
EOF

echo "✅ Setup completed!"
