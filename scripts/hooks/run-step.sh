#!/usr/bin/env sh
# Husky hook helper — รัน step ทีละตัว แสดง output เต็มใน git-error log
# Usage: HOOK_NAME=pre-push . scripts/hooks/run-step.sh
#        run_step "type-check" npm run type-check

HOOK_LOG="${GIT_DIR:-.git}/hook-last-error.log"

run_step() {
  step_name="$1"
  shift
  hook_name="${HOOK_NAME:-hook}"
  log_file=$(mktemp)

  printf 'Running %s %s\n' "$hook_name" "$step_name"

  set +e
  "$@" >"$log_file" 2>&1
  exit_code=$?
  set -e

  cat "$log_file"
  cp "$log_file" "$HOOK_LOG"
  rm -f "$log_file"

  [ "$exit_code" -eq 0 ] || exit "$exit_code"
}
