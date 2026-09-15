@echo off
rem 《第一名有罪》阅读器 —— Windows 双击即可打开
rem 阅读器必须通过 HTTP 打开（浏览器禁止 file:// 读取章节），所以这里起一个本地服务。
chcp 65001 >nul 2>&1
setlocal
cd /d "%~dp0"

echo 《第一名有罪》阅读器
echo.

rem ── 找一个能用的 Python 3 ──
rem py 启动器（Windows 官方安装包自带）优先，其次是 python，最后 python3
set "PY="
py -3 -c "import sys" >nul 2>&1 && set "PY=py -3"
if not defined PY (
  python -c "import sys" >nul 2>&1 && set "PY=python"
)
if not defined PY (
  python3 -c "import sys" >nul 2>&1 && set "PY=python3"
)

if not defined PY (
  echo 没有找到 Python 3。
  echo.
  echo 请先安装 Python 3^（安装时务必勾选 "Add Python to PATH"^）：
  echo     https://www.python.org/downloads/windows/
  echo.
  echo 装好后重新双击本文件即可。
  echo.
  pause
  exit /b 1
)

rem 交给我们自己的跨平台启动器：重建清单 + 找空闲端口 + 起服务 + 开浏览器
%PY% "启动阅读器.py" %*
set "CODE=%ERRORLEVEL%"

if not "%CODE%"=="0" (
  echo.
  echo 启动失败（退出码 %CODE%^）。
  pause
)
endlocal
