#!/usr/bin/env bash
# PreToolUse hook —— 编辑 src/styles/global.css 前，弹确认（ask，不是硬拦截）。
# 项目约定：工具页样式写在各页面内的 <style> 里，不动全站 global.css（CLAUDE.md §6/§7）。
# 只有做全站级改动（如 HANDOFF §6 的 PC 布局修复）时才应改它，所以这里用 ask 让你确认，而非 deny 拦死。
set -uo pipefail

payload="$(cat)"
file="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"

case "$file" in
  */src/styles/global.css)
    jq -nc '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: "⚠️ 正在修改全站样式 src/styles/global.css。项目约定：工具页样式应写在页面内 <style>，不动 global.css（CLAUDE.md §6/§7）。仅在做全站级改动（如 HANDOFF §6 的 PC 布局修复）时才改它。确认要继续吗？"
      }
    }'
    ;;
  *) exit 0 ;;
esac
