#!/usr/bin/env bash
# PostToolUse hook —— 编辑 src/lib/<tool>.js 后，自动跑它对应的 vitest 测试。
# 项目铁律：Owner 无法校对计算，测试是唯一正确性保证。所以一改计算逻辑就立刻验红绿。
#
# 输入：Claude Code 通过 stdin 传入 hook payload JSON（含 .tool_input.file_path）。
# 退出码约定（PostToolUse）：
#   0 = 正常（stdout 显示在转录里）
#   2 = 阻断/反馈，stderr 内容会回灌给 Claude（测试失败 / 缺测试时用，促使其修复）
set -uo pipefail

payload="$(cat)"

# 取出被编辑的文件路径（Edit/Write/MultiEdit 都是 tool_input.file_path）
file="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"

# 只对 src/lib/*.js 生效；其它文件直接放行
case "$file" in
  */src/lib/*.js) ;;
  *) exit 0 ;;
esac

root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
base="$(basename "$file" .js)"

# lib 名 → 测试名映射。24 个里 23 个同名，唯独 koteiShisan 是例外（测试叫 kotei-shisan）。
case "$base" in
  koteiShisan) test_file="tests/kotei-shisan.test.js" ;;
  *)           test_file="tests/${base}.test.js" ;;
esac

if [ ! -f "$root/$test_file" ]; then
  echo "⚠️ 改动了 src/lib/${base}.js，但找不到对应测试 ${test_file}。项目铁律：计算逻辑必须有测试覆盖（测试是唯一正确性保证）。请补上测试。" >&2
  exit 2
fi

cd "$root" || exit 0
out="$(npx vitest run "$test_file" 2>&1)"
status=$?
if [ "$status" -ne 0 ]; then
  printf '❌ %s 未通过（编辑 src/lib/%s.js 后自动运行）：\n%s\n' "$test_file" "$base" "$out" >&2
  exit 2
fi
echo "✓ ${test_file} 全部通过（编辑 src/lib/${base}.js 后自动运行）"
exit 0
