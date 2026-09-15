#!/bin/bash
# 《第一名有罪》阅读器 —— 双击即可打开
# 阅读器必须通过 HTTP 打开（浏览器不允许本地文件读取章节），所以这里起一个临时服务。
cd "$(dirname "$0")" || exit 1

# 章节有更新时自动重建清单
if command -v python3 >/dev/null 2>&1; then
  python3 工具-生成章节清单.py >/dev/null 2>&1
else
  echo "需要 python3，请先安装。"; read -r -p "按回车退出"; exit 1
fi

PORT=8765
while lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT+1))
done

URL="http://127.0.0.1:$PORT/reader.html"
echo "《第一名有罪》阅读器"
echo "地址：$URL"
echo "按 Control-C 关闭服务。"
echo

( sleep 1; command -v open >/dev/null 2>&1 && open "$URL" ) &
exec python3 -m http.server "$PORT" --bind 127.0.0.1
