#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""里程碑：每写满 5 万字，开一个分支并提交上传点。

用法：
    python3 工具-里程碑.py            # 检查当前进度，需要时自动建分支
    python3 工具-里程碑.py --check    # 只看进度，不做任何写操作
    python3 工具-里程碑.py --status   # 列出已建的分支与各自字数

规则（与用户约定一致）：
- 每累计 5 万字正文（以 chapters/ 定稿汉字数为准）算一个里程碑；
- 达到里程碑且该里程碑分支尚不存在时，创建分支 `milestone/5w-<序号>`（从当前 HEAD 起），
  在该分支上提交一个标记提交，然后回到原分支继续写；
- 提交信息里写明：里程碑序号、累计字数、章号范围、日期。
"""
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
CHDIR = ROOT / "chapters"
MANIFEST = ROOT / "chapters.json"
MILESTONE = 50_000
HAN = re.compile(r"[\u4e00-\u9fff]")


def git(*args, check=True):
    r = subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} 失败: {r.stderr.strip()}")
    return r.stdout.strip()


def progress():
    files = sorted(CHDIR.glob("ch*.md"))
    total = sum(len(HAN.findall(p.read_text(encoding="utf-8"))) for p in files)
    chs = [int(re.fullmatch(r"ch(\d{3})", p.stem).group(1)) for p in files]
    return total, (min(chs) if chs else 0), (max(chs) if chs else 0), len(files)


def existing_branches():
    out = git("branch", "--list", "milestone/*")
    return sorted(b.strip().lstrip("* ").strip() for b in out.splitlines() if b.strip())


def main():
    total, first, last, n = progress()
    reached = total // MILESTONE                    # 已达成几个 5 万字
    branches = existing_branches()
    have = len(branches)

    print(f"当前定稿：{n} 章（ch{first:03d}—ch{last:03d}），累计 {total} 字")
    print(f"里程碑进度：{total}/{MILESTONE * max(reached + 1, 1)}（已达成 {reached} 个 5 万字档，已建分支 {have} 个）")

    if "--status" in sys.argv:
        for b in branches:
            print(f"  {b}")
        return 0
    if "--check" in sys.argv:
        if reached > have:
            print(f"⚠️ 还差 {reached - have} 个里程碑分支未建")
            return 1
        print("✅ 无需新建分支")
        return 0

    if reached <= have:
        print("未达到新里程碑，无需建分支。")
        return 0

    for i in range(have + 1, reached + 1):
        name = f"milestone/5w-{i}"
        current = git("rev-parse", "--abbrev-ref", "HEAD")
        git("branch", name)
        print(f"已创建分支 {name}（自 {current} 的 HEAD）")
        # 在里程碑分支上留一个标记提交
        git("checkout", "-q", name)
        marker = ROOT / f"里程碑-{i}.md"
        marker.write_text(
            f"# 里程碑 {i} · 累计 {i * MILESTONE // 10000} 万字\n\n"
            f"- 日期：{date.today().isoformat()}\n"
            f"- 累计定稿字数：{total}\n"
            f"- 章号范围：ch{first:03d}—ch{last:03d}（共 {n} 章）\n"
            f"- 分支：{name}\n",
            encoding="utf-8",
        )
        git("add", "-A")
        git("commit", "-q", "-m",
            f"里程碑 {i}：累计 {total} 字（ch{first:03d}—ch{last:03d}）\n\n"
            f"每 5 万字开一次分支的约定，这是第 {i} 个上传点。")
        git("checkout", "-q", current)
        print(f"已在 {name} 上提交里程碑标记，并切回 {current}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
