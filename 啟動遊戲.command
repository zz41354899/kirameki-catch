#!/bin/zsh
cd -- "${0:A:h}"
if ! command -v npm >/dev/null 2>&1; then
  print '請先安裝 Node.js 22.18+ 或 24.12+'
  read '?按 Enter 關閉'
  exit 1
fi
if [ ! -d node_modules ]; then
  npm install || exit 1
fi
npm run dev -- --open
