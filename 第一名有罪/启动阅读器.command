#!/bin/bash
# 《第一名有罪》阅读器 —— macOS 双击即可打开
# 阅读器必须通过 HTTP 打开（浏览器不允许本地文件读取章节）。
cd "$(dirname "$0")" || exit 1

if ! command -v python3 >/dev/null 2>&1; then
  echo "需要 python3，请先安装（macOS 可用：brew install python3，或到 python.org 下载）。"
  read -r -p "按回车退出"
  exit 1
fi

exec python3 启动阅读器.py "$@"
