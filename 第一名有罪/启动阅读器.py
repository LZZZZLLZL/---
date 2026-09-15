#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""《第一名有罪》阅读器启动器（Windows / macOS / Linux 通用）。

做三件事：
1. 重建章节清单（chapters.json 有变化时）
2. 找一个空闲端口起本地 HTTP 服务（阅读器必须走 HTTP，浏览器不允许 file:// 读章节）
3. 打开默认浏览器

用法：
    python 启动阅读器.py            # 默认从 8765 起找端口
    python 启动阅读器.py 9000       # 指定起始端口
    python 启动阅读器.py --no-open  # 不自动开浏览器

Windows 直接双击 `启动阅读器.bat`；macOS 双击 `启动阅读器.command`。
"""
import http.server
import os
import socket
import socketserver
import subprocess
import sys
import threading
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
DEFAULT_PORT = 8765


def force_utf8_console():
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


def rebuild_manifest():
    """章节有更新时重建清单；失败不阻断启动（也能手跑生成器）。"""
    gen = ROOT / "工具-生成章节清单.py"
    if not gen.exists():
        return
    try:
        r = subprocess.run([sys.executable, str(gen)], cwd=str(ROOT),
                           capture_output=True, text=True,
                           encoding="utf-8", errors="replace")
        if r.returncode == 0:
            first = (r.stdout or "").strip().splitlines()
            if first:
                print("· 清单：" + first[0], flush=True)
        else:
            print("· 清单重建失败（用现有 chapters.json 继续）：" + (r.stderr or "").strip()[:160], flush=True)
    except Exception as e:
        print(f"· 清单重建跳过：{e}", flush=True)


def pick_port(start):
    """从 start 起找一个没被占用的端口。"""
    for port in range(start, start + 200):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind((HOST, port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"{start}—{start + 200} 之间没有可用端口")


class Handler(http.server.SimpleHTTPRequestHandler):
    # 加 no-store：改完章节刷新就能看到，不用清缓存
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):        # 安静一点，只留关键信息
        code = args[1] if len(args) > 1 else ""
        if str(code).startswith(("4", "5")):
            super().log_message(fmt, *args)


def main():
    force_utf8_console()
    argv = sys.argv[1:]
    no_open = "--no-open" in argv
    ports = [a for a in argv if a.isdigit()]
    start = int(ports[0]) if ports else DEFAULT_PORT

    print("《第一名有罪》阅读器", flush=True)
    rebuild_manifest()

    try:
        port = pick_port(start)
    except RuntimeError as e:
        print(f"启动失败：{e}")
        return 1

    url = f"http://{HOST}:{port}/reader.html"
    os.chdir(ROOT)                              # 服务的根目录就是项目目录

    socketserver.TCPServer.allow_reuse_address = True
    try:
        httpd = socketserver.TCPServer((HOST, port), Handler)
    except OSError as e:
        print(f"端口 {port} 起不来：{e}")
        return 1

    print(f"地址：{url}", flush=True)
    print("按 Control-C 关闭服务。", flush=True)
    print(flush=True)

    if not no_open:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已关闭。")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
