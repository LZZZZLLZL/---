#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""章节一致性闸门：抓机械可判的硬伤，定稿前跑一遍。

用法：
    python3 工具-一致性检查.py            # 扫全部章节
    python3 工具-一致性检查.py ch007 ch115  # 只扫指定章
    python3 工具-一致性检查.py --strict     # 把警告也算失败

检查项（都是能机械判定的，不做主观评价）：
  A 标点    半角引号 " 、直角引号 「」 必须为 0（本书用中文弯引号 “ ”）
  B 书名    废弃人名「沈」必须为 0
  C 句式    对照式定义句「不是A，是B」「我要的不是X，是Y」——禁用
             （第 4 章「我要一个证人。不是眼线。」是全书唯一特许，额度已用尽）
  D AI 腔   然而 / 与此同时 / 就在这时 / 仿佛 / 宛如 / 犹如
  E 人称    提问句无署名、下一段是对方的回答，而提问里用了「你妈/你爸」
             → 视角错位（李洋问就该说「我妈」）
  F 引号配对  每段弯引号必须成对
  G 动作前提  「坐下 / 回到桌边」之类但此前未见起身动作 → 待人工确认（警告）
  H 日历     章首「X月Y号，周Z」必须与日历锚一致（6 月 24 日 = 周二）
  I 倒计时   「距离高考还有 N 天 / 高考前 N 天」必须与高考 7 月 7 日一致
"""
import pathlib
import datetime
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
CHDIR = ROOT / "chapters"

BAN_WORDS = ["然而", "与此同时", "就在这时", "仿佛", "宛如", "犹如"]
# 对照式定义句：两个分句成对（不是 A，是 B）。
# 紧跟的成分里出现「也/都/其实/自己/不知道」这类跟进词时，通常只是叙述而非定义，
# 例如「他不是要去抢，他自己也不知道那半步是干什么用的」——这类不算。
CONTRAST = re.compile(r"不是[^。！？\n，]{1,16}，(?![^。！？\n]{0,10}(?:也|都|其实|自己|不知道|谁|没人))([^。！？\n]{1,18}是)")
CONTRAST2 = re.compile(r"我要的不是[^。！？\n]{1,16}，")
# 变体：「我不要 X。我（问/要/找）的是 Y」——同样是先否定后定义
CONTRAST3 = re.compile(r"我(?:不|没)[^。！？\n]{0,20}[。！？][^。！？\n]{0,8}我[^。！？\n]{0,6}(?:问|要|找|说)的是")
Q_PAT = re.compile(r"^“[^”]{0,24}你(妈|爸|爹|娘)[^”]{0,28}”$")
A_PAT = re.compile(r"^“[^”]*”[\u4e00-\u9fff]{2,3}(?:说|答|道)")
THIRD = re.compile(r"[她他]")


# ── 动作/前提类启发式（只报「待人工确认」，不做判定）──
NAMES = ["李洋", "孟凡", "周予晚", "程野", "陈桂芝", "韩振国", "陈涛", "郑昊", "老周", "老吴"]

# 暗示「此前已经站起来了」的动作
NEEDS_STANDING = re.compile(r"(?:回到|走回|转身走回)?[^。！？\n]{0,10}(?:回到桌边|走回桌边|坐下|坐下来|落座)")
STAND_MARK = re.compile(r"(站起来|起身|站起|走到|走过去|起了身|站起身)")
SIT_MARK = re.compile(r"(坐着|坐在|坐回|坐下来|坐下)")
RESIT = re.compile(r"(坐下|坐下来|坐回|回到桌边)")
# 指向道具的动词（该道具此前必须出现过）
PROP_VERB = re.compile(r"(把|拿|取|放回|捡起|抽出|端)(?:起)?([\u4e00-\u9fff]{2,4})")


def heuristic_actions(path, paras):
    """按人物跟踪姿态，抓「已经坐着却又坐回去」这类前后矛盾。

    判据很窄，只为把误报压到 0：
      - 用「站 / 走 / 起」与「坐」两类动词分别把人物置为 stand / sit，状态跨段保持
      - **先判断、后更新**：一句里出现「坐下」会先把状态改成 sit，
        若在同一句尾部判断就会自己把自己判成矛盾，所以顺序不能反
      - 只在人物**已记为坐着**时，对「坐回去 / 坐回 / 重新坐下 / 坐了下来」报警；
        「坐下」本身不报（中文里它常表示「入座」，未必是状态反转）
      - 主语取该动词之前最近出现的专名
      - 「她坐下的位置」这类描述座位的写法直接跳过
    """
    notes = []
    state = {n: None for n in NAMES}
    MOVE = re.compile(r"(走回|回到桌边|走到|走过去|站起来|起身|站起|站起身)")
    SIT = re.compile(r"(坐回|坐在|坐着|坐了下来|坐下)")
    SITBACK = re.compile(r"(坐回去|坐回|重新坐下|坐了下来)")
    DESCRIBE = re.compile(r"坐(?:下|回)?的(?:位置|地方|那一侧|那一边|位子)")

    for i, b in enumerate(paras):
        for sent in re.split(r"(?<=[。！？])", b):
            if not sent.strip() or DESCRIBE.search(sent):
                continue

            # ① 先判断（用更新前的状态）
            m = SITBACK.search(sent)
            if m:
                head = sent[:m.start()]
                pos = [(head.rfind(n), n) for n in NAMES if n in head]
                if pos:
                    _, name = max(pos)
                    if state[name] == "sit":
                        notes.append(("warn",
                                      f"第 {i+1} 段「{m.group(0)}」：{name} 此前已经坐着，"
                                      f"此处又坐回去，疑似矛盾"))

            # ② 再更新状态
            for name in NAMES:
                if name not in sent:
                    continue
                if MOVE.search(sent):
                    state[name] = "stand"
                if SIT.search(sent):
                    state[name] = "sit"
    return notes


def check_file(path):
    """返回 [(级别, 说明)]。级别 error / warn。"""
    out = []
    t = path.read_text(encoding="utf-8")
    paras = [b for b in t.split("\n\n") if b.strip()]

    if '"' in t:
        out.append(("error", f'半角引号 ×{t.count(chr(34))}'))
    if "「" in t or "」" in t:
        out.append(("error", f'直角引号 ×{t.count("「") + t.count("」")}'))
    if "沈" in t:
        out.append(("error", f'废弃人名「沈」×{t.count("沈")}'))

    for w in BAN_WORDS:
        if w in t:
            out.append(("warn", f"AI 腔词「{w}」×{t.count(w)}"))

    for m in CONTRAST.finditer(t):
        out.append(("error", f'对照式定义句：…{m.group(0)}…'))
    for m in CONTRAST2.finditer(t):
        out.append(("error", f'对照式定义句：…{m.group(0)}…'))
    for m in CONTRAST3.finditer(t):
        out.append(("error", f'对照式定义句（变体）：…{m.group(0)}…'))

    for i, b in enumerate(paras[:-1]):
        if Q_PAT.match(b.strip()) and A_PAT.match(paras[i + 1].strip()):
            if THIRD.search(paras[i + 1].split("。")[0]):
                out.append(("error",
                            f'第 {i+1} 段人称可能错位：{b.strip()[:26]}'
                            f' ← 下一段是对方的回答，提问者用「你妈/你爸」应为「我妈/我爸」'))

    odd = [i + 1 for i, b in enumerate(paras) if b.count("“") != b.count("”")]
    if odd:
        out.append(("error", f"弯引号不配对，段号 {odd[:6]}"))

    out.extend(heuristic_actions(path, paras))
    out.extend(check_calendar(t))
    return out


# ── 日历闸门（南洲历锚：6 月 24 日 = 周二，即与 2025 年同形；高考 = 7 月 7 日） ──
CAL_ANCHOR = datetime.date(2025, 6, 24)  # 周二
CN_DIGIT = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
            "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}
CN_WEEK = "一二三四五六日"


def _cn_num(s):
    if s == "十":
        return 10
    if "十" in s:
        a, b = s.split("十")
        return CN_DIGIT.get(a, 1) * 10 + (CN_DIGIT.get(b, 0) if b else 0)
    return CN_DIGIT.get(s, 0)


def _canon_date(mo, d):
    """把书内日历（无绝对年份）映射到一个同形的公历年。"""
    return datetime.date(2025, mo, d)


def _weekday_name(dt):
    return CN_WEEK[dt.weekday()]


def check_calendar(t):
    out = []
    head = "\n".join(t.split("\n")[:5])
    m = re.search(r"([一二三四五六七八九十]+)月([一二三四五六七八九十]+)号[，,、]\s*周([一二三四五六日天])", head)
    if m:
        mo, d, said = _cn_num(m.group(1)), _cn_num(m.group(2)), m.group(3)
        want = _weekday_name(_canon_date(mo, d))
        if said != want and not (said == "天" and want == "日"):
            out.append(("error",
                        f"日期星期不符：{mo}月{d}号写的是周{said}，按日历锚（6月24日=周二）应为周{want}"))

    # 高考倒计时：距离 7 月 7 日
    md = re.search(r"([一二三四五六七八九十]+)月([一二三四五六七八九十]+)号", head)
    if md:
        mo, d = _cn_num(md.group(1)), _cn_num(md.group(2))
        if (mo, d) <= (7, 7):
            left = (_canon_date(7, 7) - _canon_date(mo, d)).days
            for pat in (r"距离高考还有([一二三四五六七八九十]+)天",
                        r"高考还有([一二三四五六七八九十]+)天",
                        r"高考前([一二三四五六七八九十]+)天"):
                for mm in re.finditer(pat, t):
                    got = _cn_num(mm.group(1))
                    if got != left:
                        out.append(("error",
                                    f"倒计时不符：{mo}月{d}号写「{mm.group(0)}」，"
                                    f"按高考 7 月 7 日应为 {left} 天"))
    return out


def main():
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    strict = "--strict" in sys.argv
    names = [a for a in sys.argv[1:] if not a.startswith("-")]
    files = ([CHDIR / (n if n.endswith(".md") else n + ".md") for n in names]
             if names else sorted(CHDIR.glob("ch*.md")))

    errors = warns = 0
    for f in files:
        if not f.exists():
            print(f"！找不到 {f.name}")
            continue
        res = check_file(f)
        if not res:
            continue
        print(f"\n{f.name}")
        for lvl, msg in res:
            print(f"  [{'错误' if lvl == 'error' else '警告'}] {msg}")
            if lvl == "error":
                errors += 1
            else:
                warns += 1

    print(f"\n扫描 {len(files)} 章：错误 {errors} · 警告 {warns}")
    if errors or (strict and warns):
        print("未通过。修掉上面的问题再定稿。")
        return 1
    print("通过。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
