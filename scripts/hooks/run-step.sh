#!/usr/bin/env sh
# Husky hook helper — สรุป error เป็นข้อความธรรมดา 1 บรรทัด
# Cursor/VS Code Git dialog render stderr เป็น Markdown
# ห้ามใช้: บรรทัดขึ้นต้นด้วย - > # * [ ] (จะกลายเป็นเส้น/placeholder)
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

  if [ "$exit_code" -eq 0 ]; then
    rm -f "$log_file"
    return 0
  fi

  summary=$(
    grep -E 'error TS|error |✖|Property |Cannot find|Expected |FAILED|secret scan:' "$log_file" 2>/dev/null \
      | sed 's/^[[:space:]]*//' \
      | tail -1
  )

  rm -f "$log_file"

  if [ -z "$summary" ]; then
    summary="step ${step_name} failed with exit code ${exit_code}"
  fi

  # บรรทัดสุดท้าย: plain text ไม่มี markdown trigger — Cursor Git dialog อ่านบรรทัดนี้
  printf '%s blocked at %s: %s\n' "$hook_name" "$step_name" "$summary" >&2
  exit "$exit_code"
}
