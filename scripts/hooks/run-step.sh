#!/usr/bin/env sh
# Husky hook helper — รัน step ทีละตัว, ส่ง error ไป stderr ให้ Git UI ใน IDE แสดงได้
# Usage: HOOK_NAME=pre-push . scripts/hooks/run-step.sh
#        run_step "type-check" npm run type-check

HOOK_LOG="${GIT_DIR:-.git}/hook-last-error.log"

run_step() {
  step_name="$1"
  shift
  hook_name="${HOOK_NAME:-hook}"
  log_file=$(mktemp "${TMPDIR:-/tmp}/hook-step.XXXXXX")

  printf 'Running %s %s\n' "$hook_name" "$step_name" >&2

  set +e
  "$@" >"$log_file" 2>&1
  exit_code=$?
  set -e

  cp "$log_file" "$HOOK_LOG"

  if [ "$exit_code" -ne 0 ]; then
    {
      printf 'error: %s failed at step "%s"\n' "$hook_name" "$step_name"
      cat "$log_file"
      printf 'see also: %s\n' "$HOOK_LOG"
    } >&2
    rm -f "$log_file"
    exit "$exit_code"
  fi

  if [ -s "$log_file" ]; then
    cat "$log_file" >&2
  fi

  rm -f "$log_file"
}
