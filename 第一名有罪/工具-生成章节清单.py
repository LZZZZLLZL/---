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
CPM = 400  # 汉字/分钟


# 附录 C（扩写章）：| 章 | 标题 | 锚定 | 支线 |
EXROW = re.compile(r"^\|\s*(\d{1,3})\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|")


# ### 第四幕 高三（31—40）· 每一张卷子都在称重
ACT = re.compile(
    r"^###\s*(第[一二三四五六七八九十]+幕)\s*(.*?)"
    r"(?:（\s*(\d{1,3})\s*[—\-~－]\s*(\d{1,3})\s*）)?"
    r"(?:\s*[·・]\s*(.+?))?\s*$"
)


def parse_appendix():
    """解析附录 C 的扩写章表，返回 {章号: (标题, 锚定, 支线)}。"""
    out, in_app = {}, False
    for raw in OUTLINE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("#"):
            in_app = "附录 C" in line
            continue
        if not in_app:
            continue
        m = EXROW.match(line)
        if not m:
            continue
        title = m.group(2).strip().strip("*` ")
        if not title or set(title) <= set("-: "):
            continue
        out[int(m.group(1))] = (title, m.group(3).strip(), m.group(4).strip())
    return out


def parse_outline():
    """返回 {章号: 标题}。标题列在总大纲表格的第 2 列。"""
    titles = {}
    row = re.compile(r"^\|\s*(\d{1,3})\s*\|\s*([^|]+?)\s*\|")
    acts, cur = [], None
    for raw in OUTLINE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        m = ACT.match(line)
        if m:
            if cur:
                acts.append(cur)
            cur = {
                "name": m.group(1),
                "title": (m.group(2) or "").strip(),
                "sub": (m.group(5) or "").strip(),
                "lo": int(m.group(3)) if m.group(3) else None,
                "hi": int(m.group(4)) if m.group(4) else None,
            }
            continue
        if line.startswith("#") and not line.startswith("### "):
            if cur:
                acts.append(cur)
                cur = None
            continue
        m = row.match(line)
        if not m:
            continue
        no = int(m.group(1))
        title = m.group(2).strip().strip("*` ")
        # 跳过表头/分隔行误判
        if not title or set(title) <= set("-: "):
            continue
        titles.setdefault(no, title)
        if cur:
            if cur["lo"] is None:
                cur["lo"] = no
            cur["hi"] = no
    if cur:
        acts.append(cur)
    return titles, [a for a in acts if a["lo"]]


def group_of(no, acts):
    """章号落在哪一幕里。"""
    for a in acts:
        if a["lo"] <= no <= a["hi"]:
            return a
    return None


BRANCH_ORDER = ["家访线", "同学线", "竞赛线", "艺考线", "复读线", "大学线"]


def build():
    titles, acts = parse_outline()
    appendix = parse_appendix()
    for no, (t, _a, _b) in appendix.items():
        titles.setdefault(no, t)

    # 扩写章按支线归组（支线组排在正传十章群之后）
    branches = {}
    for no in sorted(appendix):
        br = appendix[no][2]
        if not br:
            continue
        g = branches.setdefault(br, {"lo": no, "hi": no})
        g["lo"] = min(g["lo"], no)
        g["hi"] = max(g["hi"], no)
    order = [b for b in BRANCH_ORDER if b in branches] + \
            [b for b in branches if b not in BRANCH_ORDER]

    missing_title, chapters, seen_groups, act_order = [], [], {}, []
    for path in sorted(CHDIR.glob("ch*.md")):
        m = re.fullmatch(r"ch(\d{3})", path.stem)
        if not m:
            continue
        no = int(m.group(1))
        if no not in titles:
            missing_title.append(no)
            continue
        words = len(HAN.findall(path.read_text(encoding="utf-8")))
        a = group_of(no, acts)
        gid = None
        if a:
            gid = f"{a['lo']}-{a['hi']}"
            if gid not in seen_groups:
                act_order.append(gid)
                seen_groups[gid] = {
                    "id": gid, "name": a["name"], "title": a["title"],
                    "sub": a["sub"], "lo": a["lo"], "hi": a["hi"], "kind": "act",
                }
        elif no in appendix and appendix[no][2]:
            br = appendix[no][2]
            gid = "外传·" + br
            if gid not in seen_groups:
                g = branches[br]
                seen_groups[gid] = {
                    "id": gid, "name": "外传", "title": br,
                    "sub": "锚定骨架的补章，不推进主线",
                    "lo": g["lo"], "hi": g["hi"], "kind": "branch",
                }
        chapters.append({
            "no": no,
            "title": titles[no],
            "file": f"chapters/{path.name}",
            "words": words,
            "min": max(1, round(words / CPM)),
            "group": gid,
            "anchor": appendix[no][1] if no in appendix else "",
        })

    rank = {gid: i for i, gid in enumerate(act_order + ["外传·" + b for b in order])}
    groups = sorted(seen_groups.values(), key=lambda g: rank.get(g["id"], 999))
    for g in groups:
        g["count"] = sum(1 for c in chapters if c["group"] == g["id"])
    return {
        "book": "第一名有罪",
        "generated_from": ["02-总大纲.md", "chapters/"],
        "total": len(chapters),
        "groups": groups,
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
    total_min = sum(c["min"] for c in data["chapters"])
    print(f"已生成 {OUT.name}：{data['total']} 章，合计 {total_words} 字"
          f"（约 {total_min // 60} 小时 {total_min % 60} 分读完），{len(data['groups'])} 个分部")
    for g in data["groups"]:
        print(f"  · [{g['kind']}] {g['name']} {g['title']}（{g['lo']}—{g['hi']}，{g['count']} 章）"
              + (f"  {g['sub']}" if g.get("sub") else ""))
    if "-v" in sys.argv:
        for c in data["chapters"]:
            print(f"  第 {c['no']:>3} 章 · {c['title']}（{c['words']} 字 / {c['min']} 分钟）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
