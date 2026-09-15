#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 02-总大纲.md 与 chapters/ 自动生成阅读器需要的 chapters.json。

用法：
    python3 工具-生成章节清单.py          # 生成 chapters.json
    python3 工具-生成章节清单.py --check  # 只检查，不写文件（有差异时退出码 1）

规则：
- 章号与标题以 02-总大纲.md 为准（它是唯一事实来源）。
- 只有 chapters/chNNN.md 存在的章才会进入清单（没写的不显示）。
- 字数 = 正文汉字数（统计 \\u4e00-\\u9fff）。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTLINE = ROOT / "02-总大纲.md"
CHDIR = ROOT / "chapters"
OUT = ROOT / "chapters.json"
HAN = re.compile(r"[\u4e00-\u9fff]")


def parse_outline():
    """返回 {章号: 标题}。标题列在总大纲表格的第 2 列。"""
    titles = {}
    row = re.compile(r"^\|\s*(\d{1,3})\s*\|\s*([^|]+?)\s*\|")
    for line in OUTLINE.read_text(encoding="utf-8").splitlines():
        m = row.match(line.strip())
        if not m:
            continue
        no = int(m.group(1))
        title = m.group(2).strip().strip("*` ")
        # 跳过表头/分隔行误判
        if not title or set(title) <= set("-: "):
            continue
        titles.setdefault(no, title)
    return titles


def build():
    titles = parse_outline()
    missing_title, chapters = [], []
    for path in sorted(CHDIR.glob("ch*.md")):
        m = re.fullmatch(r"ch(\d{3})", path.stem)
        if not m:
            continue
        no = int(m.group(1))
        if no not in titles:
            missing_title.append(no)
            continue
        text = path.read_text(encoding="utf-8")
        chapters.append({
            "no": no,
            "title": titles[no],
            "file": f"chapters/{path.name}",
            "words": len(HAN.findall(text)),
        })
    return {
        "book": "第一名有罪",
        "generated_from": ["02-总大纲.md", "chapters/"],
        "total": len(chapters),
        "chapters": chapters,
    }, missing_title


def main():
    data, missing = build()
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if missing:
        print(f"警告：以下章号在 chapters/ 里存在，但 02-总大纲.md 查不到标题：{missing}", file=sys.stderr)
    if "--check" in sys.argv:
        old = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if old != text:
            print("chapters.json 与当前章节不一致，请重新生成。", file=sys.stderr)
            return 1
        print(f"chapters.json 已是最新（{data['total']} 章）。")
        return 0
    OUT.write_text(text, encoding="utf-8")
    total_words = sum(c["words"] for c in data["chapters"])
    print(f"已生成 {OUT.name}：{data['total']} 章，合计 {total_words} 字")
    for c in data["chapters"]:
        print(f"  第 {c['no']:>3} 章 · {c['title']}（{c['words']} 字）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
