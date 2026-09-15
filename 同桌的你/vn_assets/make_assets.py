# -*- coding: utf-8 -*-
"""
make_assets.py - 视觉小说《同桌的你》批量图片生成 + 后处理流水线

用法:
    python make_assets.py                 # 生成所有缺失的图（可中断续跑）
    python make_assets.py --only bg_class # 只生成指定资产
    python make_assets.py --force bg_class --force ch_linwei_smile  # 强制重生成指定项
    python make_assets.py --list          # 列出任务状态
"""
import os, sys, base64, re, argparse, urllib.request
from pathlib import Path
from collections import deque

ROOT = Path(__file__).resolve().parent.parent          # 项目根目录
RAW = ROOT / "vn_assets" / "raw"                       # 原始生成图
BG_DIR = ROOT / "vn_assets" / "img" / "bg"             # 处理后的背景
CH_DIR = ROOT / "vn_assets" / "img" / "char"           # 处理后的立绘

# .env 加载
envp = ROOT / ".env"
if envp.exists():
    for line in envp.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

# ============================================================
#  提示词
# ============================================================
STYLE_BG = (
    "Masterpiece, best quality, delicate anime illustration, painterly background art, "
    "soft cel shading with subtle watercolor texture, fine clean details, warm nostalgic atmosphere, "
    "film-like soft lighting, Chinese small-town youth story mood. "
)
NO_PPL = " No people, no characters, no text, no watermark, no signature. Cinematic wide composition."

SPRITE_STYLE = (
    "Masterpiece, best quality, official Japanese anime visual novel character sprite, modern anime style, "
    "crisp clean lineart, vivid cel shading with soft gradient shadows, very large expressive glossy eyes "
    "with detailed highlights, delicate bishoujo/bishounen anime face, beautifully flowing detailed hair, "
    "slightly stylized anime proportions, "
)

# 立绘固定人设描述（保证多个表情之间尽量一致）
LINWEI = (
    "a 16-year-old Chinese high school girl, slim and delicate, neat dark-brown high ponytail with wispy "
    "bangs and a few loose strands framing her face, bright gentle brown eyes, fair skin, wearing a light "
    "sky-blue short-sleeved summer dress with a small white lily flower embroidered on the hem, white canvas "
    "sneakers, a thin red string bracelet with a tiny brass bell on her left wrist"
)
LIYANG = (
    "a 16-year-old Chinese high school boy, slightly tanned healthy skin, short neat black hair with soft "
    "fringe, honest warm dark-brown eyes, thick eyebrows, wearing a blue-and-white plaid button-up shirt "
    "with sleeves rolled to the elbows, dark blue school trousers, white sneakers"
)

SPRITE_BG = (
    " Plain flat solid uniform pale mint-green background (#e3f2e5), completely empty background, "
    "no shadow, no ground shadow, no gradient on background, no text, single full body character, "
    "head to feet visible, standing pose, centered, vertical composition."
)

TASKS = [
    # ---------------- 背景 ----------------
    {"name": "bg_courty", "kind": "bg",
     "prompt": STYLE_BG +
     "A small old Chinese town courtyard home in May, a lush pomegranate tree full of vivid red blossoms in "
     "the center, grey-brick old house with dark tiled roof and wooden window frames, wooden bench, an old "
     "bicycle leaning against the whitewashed wall, potted plants, warm morning sunlight, stone-paved ground "
     "with moss, nostalgic and peaceful." + NO_PPL},
    {"name": "bg_pomegranate", "kind": "bg",
     "prompt": STYLE_BG +
     "The same small old Chinese town courtyard home in late summer, the old pomegranate tree now heavy with "
     "small green-red pomegranate fruits hanging in clusters among dense dark-green leaves, grey-brick old "
     "house with dark tiled roof and wooden window frames, wooden bench, an old bicycle leaning against the "
     "whitewashed wall, potted plants, warm golden late-afternoon sunlight, stone-paved ground, nostalgic "
     "and serene." + NO_PPL},
    {"name": "bg_ginko", "kind": "bg",
     "prompt": STYLE_BG +
     "A tree-lined path in a Chinese high school campus in late spring, fresh green ginkgo trees on both sides, "
     "dappled golden sunlight falling on the paved path, low old campus wall with climbing plants, brick "
     "teaching building in the distance, clear blue sky with soft white clouds, fresh and hopeful mood." + NO_PPL},
    {"name": "bg_class", "kind": "bg",
     "prompt": STYLE_BG +
     "An empty Chinese high school classroom bathed in warm afternoon sunlight, rows of worn wooden desks and "
     "chairs, a large green blackboard with faint illegible chalk smudges, big windows on the left with green "
     "tree view outside, sheer curtains swaying gently, dust motes floating in the sunbeams, stack of "
     "notebooks and a metal pencil case on a desk, nostalgic quiet mood." + NO_PPL},
    {"name": "bg_sunset", "kind": "bg",
     "prompt": STYLE_BG +
     "A quiet Chinese school campus just after evening self-study, deep dusk with orange-pink-to-purple "
     "gradient sky, a huge old ginkgo tree with golden leaves in the foreground, the teaching building with "
     "warmly lit windows behind, fallen ginkgo leaves scattered on the ground, a basketball hoop silhouette "
     "far away, melancholic warm atmosphere." + NO_PPL},
    {"name": "bg_ginko_autumn", "kind": "bg",
     "prompt": STYLE_BG +
     "A golden autumn ginkgo tree avenue in an old Chinese high school, the empty path completely covered "
     "with fallen golden ginkgo leaves, brilliant golden tree canopies meeting overhead, warm late-afternoon "
     "light rays streaming through the leaves, a solitary wooden bench beside the path, nostalgic and "
     "melancholic mood." + NO_PPL},
    # ---------------- CG ----------------
    {"name": "cg_candy", "kind": "bg",
     "prompt": STYLE_BG +
     "Close-up still life: one classic White Rabbit creamy milk candy with its iconic red-white wrapper "
     "featuring a cute white rabbit picture, partially unwrapped showing the milky candy inside, the twisted "
     "wrapper beside it, lying on a worn wooden school desk, soft warm afternoon sunlight from a classroom "
     "window, blurred green blackboard in the background bokeh, a corner of a notebook nearby, tender "
     "sentimental mood."},
    {"name": "cg_confess", "kind": "bg",
     "prompt": STYLE_BG +
     "Still life on a wooden desk at warm dusk: an opened pale-blue envelope with a small white lily flower "
     "printed on it, sheets of letter paper with soft illegible pencil handwriting strokes (absolutely no "
     "readable text), a delicate thin red string bracelet with a tiny brass bell resting on the letter, one "
     "golden ginkgo leaf as bookmark, warm golden window light with soft shadows, sentimental romantic mood."},
    {"name": "cg_tree", "kind": "bg",
     "prompt": STYLE_BG +
     "Dusk scene viewed from behind: a high school boy in a blue plaid shirt and a high school girl in a "
     "light blue dress with ponytail standing side by side under a huge old golden ginkgo tree in the school "
     "yard, both seen from the back, golden ginkgo leaves drifting in the air, deep orange and purple sunset "
     "sky, the school building with warm lit windows in the distance, tender bittersweet atmosphere. "
     "No text, no watermark."},
    # ---------------- 立绘 ----------------
    {"name": "ch_linwei_smile", "kind": "sprite",
     "prompt": SPRITE_STYLE + "Full character sprite of " + LINWEI +
     ", warm bright gentle smile, eyes curved like crescent moons, one hand slightly raised near her chest, "
     "lively and kind." + SPRITE_BG},
    {"name": "ch_linwei_shy", "kind": "sprite",
     "prompt": SPRITE_STYLE + "Full character sprite of " + LINWEI +
     ", shy blushing expression with flushed cheeks, looking down and away to the side, both hands gently "
     "clasped in front of her, soft embarrassed smile." + SPRITE_BG},
    {"name": "ch_linwei_sad", "kind": "sprite",
     "prompt": SPRITE_STYLE + "Full character sprite of " + LINWEI +
     ", downcast melancholic expression, slightly lowered gaze, faint sorrow, holding one elbow with the "
     "other hand." + SPRITE_BG},
    {"name": "ch_liyang_smile", "kind": "sprite",
     "prompt": SPRITE_STYLE + "Full character sprite of " + LIYANG +
     ", friendly easy grin, rubbing the back of his head with one hand, boyish and earnest." + SPRITE_BG},
    {"name": "ch_liyang_shy", "kind": "sprite",
     "prompt": SPRITE_STYLE + "Full character sprite of " + LIYANG +
     ", shy embarrassed expression, blushing, looking away and scratching his cheek, awkward warm smile."
     + SPRITE_BG},
]

# ============================================================
#  生成
# ============================================================
def gen_one(task):
    from openai import OpenAI
    client = OpenAI(base_url="https://jmrai.net/v1",
                    api_key=os.getenv("JMRAI_API_KEY"), timeout=300)
    raw_path = RAW / (task["name"] + ".png")
    # 背景请求原生横版，立绘请求原生竖版；接口若忽略 size 则自动回退方形
    size = "1536x1024" if task["kind"] == "bg" else "1024x1536"
    print(f"  [gen] {task['name']} (size={size}) ...", flush=True)
    resp = client.images.generate(model="gpt-image-2-cheap",
                                  prompt=task["prompt"], n=1,
                                  size=size)
    d = resp.data[0]
    b64 = getattr(d, "b64_json", None)
    if b64:
        raw_path.write_bytes(base64.b64decode(re.sub(r"\s+", "", b64)))
    else:
        url = getattr(d, "url", None)
        if not url:
            raise RuntimeError("响应中既无 b64 也无 url: " + str(d)[:200])
        if url.startswith("data:"):
            raw_path.write_bytes(base64.b64decode(url.split(",", 1)[1]))
        else:
            urllib.request.urlretrieve(url, str(raw_path))
    print(f"  [raw] {raw_path} ({raw_path.stat().st_size//1024} KB)", flush=True)
    return raw_path


# ============================================================
#  后处理
# ============================================================
def process_bg(raw_path, out_path):
    """背景/CG：智能裁切 16:9 -> 缩放到 1280 宽 -> WebP 压缩

    1024x1024 方图中，信息主体通常在垂直方向 128~896 的中央带。
    以"行方差"（细节密度）为权重在允许窗口内寻找最优裁切起点。
    """
    from PIL import Image, ImageStat
    import math
    im = Image.open(raw_path).convert("RGB")
    w, h = im.size
    target_ratio = 16 / 9
    if w / h >= target_ratio - 0.01:
        # 已经够宽：居中裁
        nh = round(w / target_ratio)
        top = max(0, (h - nh) // 2)
        im = im.crop((0, top, w, top + nh))
    else:
        nw = round(h * target_ratio)
        if nw <= w:
            left = (w - nw) // 2
            im = im.crop((left, 0, left + nw, h))
        else:
            # 需要从高度上裁：用行方差找细节最丰富的窗口
            win = round(w / target_ratio)
            if win >= h:
                win = h - 1
            g = im.convert("L")
            row_var = []
            px = g.load()
            for y in range(h):
                s = 0
                for x in range(0, w, 4):
                    v = px[x, y]
                    s += v * v
                row_var.append(s)
            # 滑动窗口求和，找方差最大的窗口（细节最密集）
            best_top, best_sum = 0, -1
            cur = sum(row_var[:win])
            best_sum = cur
            for top in range(1, h - win + 1):
                cur += row_var[top + win - 1] - row_var[top - 1]
                if cur > best_sum:
                    best_sum, best_top = cur, top
            im = im.crop((0, best_top, w, best_top + win))
    w, h = im.size
    tw = 1280
    im = im.resize((tw, round(h * tw / w)), Image.LANCZOS)
    im.save(out_path, "WEBP", quality=80, method=6)
    print(f"  [bg ] -> {out_path.name} {im.size} ({out_path.stat().st_size//1024} KB)")


def _floodfill_bg(im):
    """色度键抠图 v3：
    1) BFS 连通清除边缘主背景（绿幕系 + 浅白地面系）
    2) 全局绿键清除封闭死角（腿间等连通不到的区域）
    返回 RGBA 图。"""
    from PIL import Image
    from collections import deque
    w, h = im.size
    px = im.load()

    def is_bg_green(r, g, b):
        return g > r + 10 and g > b + 10 and g > 200

    def is_bg_pale(r, g, b):
        return min(r, g, b) > 230 and abs(r - g) < 14 and abs(g - b) < 14

    key = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            r, g, b = px[x, y]
            if is_bg_green(r, g, b) or is_bg_pale(r, g, b):
                i = y * w + x
                if not key[i]: key[i] = 1; q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            r, g, b = px[x, y]
            if is_bg_green(r, g, b) or is_bg_pale(r, g, b):
                i = y * w + x
                if not key[i]: key[i] = 1; q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                i = ny * w + nx
                if not key[i]:
                    r, g, b = px[nx, ny]
                    if is_bg_green(r, g, b) or is_bg_pale(r, g, b):
                        key[i] = 1; q.append((nx, ny))
    # 封闭死角
    for i in range(w * h):
        if not key[i]:
            r, g, b = px[i % w, i // w]
            if is_bg_green(r, g, b):
                key[i] = 1
    alpha = Image.new("L", (w, h), 255)
    ap = alpha.load()
    for i in range(w * h):
        if key[i]:
            ap[i % w, i // w] = 0
    rgba = im.convert("RGBA")
    rgba.putalpha(alpha)
    return rgba


def _despill(rgba):
    """压掉透明邻域内的绿色溢出（发丝绿边）"""
    from PIL import ImageFilter
    w, h = rgba.size
    a = rgba.getchannel("A")
    near = a.point(lambda v: 255 if v < 250 else 0).filter(ImageFilter.MaxFilter(7))
    npx = near.load()
    px = rgba.load()
    for y in range(h):
        for x in range(w):
            if npx[x, y]:
                r, g, b, al = px[x, y]
                if al > 0 and g > (r + b) / 2 + 8:
                    px[x, y] = (r, int((r + b) / 2 + 8), b, al)


def process_sprite(raw_path, out_path):
    """立绘：色度键抠图 -> despill -> 白色描边 -> 固定画布底部居中 -> WebP(带alpha)

    白描边同时掩盖抠图残留的浅色杂边；固定画布保证同角色表情切换基线一致。
    """
    from PIL import Image, ImageFilter
    im = Image.open(raw_path).convert("RGB")
    rgba = _floodfill_bg(im)
    _despill(rgba)
    # 轻羽化 alpha 边缘
    a = rgba.getchannel("A").filter(ImageFilter.GaussianBlur(1.1))
    rgba.putalpha(a)
    bbox = rgba.getbbox()
    if bbox:
        pad = 12
        bbox = (max(0, bbox[0]-pad), max(0, bbox[1]-pad),
                min(rgba.width, bbox[2]+pad), min(rgba.height, bbox[3]+pad))
        rgba = rgba.crop(bbox)
    # ---- 白色描边：膨胀 alpha 的白色剪影垫在人物下方 ----
    dilated = rgba.getchannel("A").filter(ImageFilter.MaxFilter(9))
    white = Image.new("RGBA", rgba.size, (255, 255, 255, 0))
    white.putalpha(dilated)
    sheet = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    sheet.alpha_composite(white)
    sheet.alpha_composite(rgba)
    rgba = sheet
    # ---- 固定画布：底部居中（大画布保留原生细节，避免游戏内放大发糊）----
    CANVAS_W, CANVAS_H = 1100, 1300
    if rgba.height > CANVAS_H - 24:
        tw = round(rgba.width * (CANVAS_H - 24) / rgba.height)
        rgba = rgba.resize((tw, CANVAS_H - 24), Image.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.paste(rgba, ((CANVAS_W - rgba.width) // 2, CANVAS_H - rgba.height))
    canvas.save(out_path, "WEBP", quality=82, method=6)
    print(f"  [spr] -> {out_path.name} {canvas.size} ({out_path.stat().st_size//1024} KB)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", default=None)
    ap.add_argument("--force", nargs="*", default=[])
    ap.add_argument("--reprocess", action="store_true",
                    help="不调用 API，仅用 raw 原图重新后处理")
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()

    if args.list:
        for t in TASKS:
            out = (BG_DIR if t["kind"] == "bg" else CH_DIR) / (t["name"] + ".webp")
            mark = "OK " if out.exists() else " -- "
            print(mark, t["name"])
        return

    tasks = [t for t in TASKS if args.only is None or t["name"] in args.only]
    if not tasks:
        print("没有匹配的任务"); return

    RAW.mkdir(parents=True, exist_ok=True)
    BG_DIR.mkdir(parents=True, exist_ok=True)
    CH_DIR.mkdir(parents=True, exist_ok=True)

    from PIL import Image  # noqa 提前探测 webp 支持
    import PIL.features
    if not PIL.features.check("webp"):
        print("当前 Pillow 不支持 WebP!"); sys.exit(1)

    ok, fail = [], []
    for i, t in enumerate(tasks, 1):
        kind = t["kind"]
        out_dir = BG_DIR if kind == "bg" else CH_DIR
        out_path = out_dir / (t["name"] + ".webp")
        raw_path = RAW / (t["name"] + ".png")
        if out_path.exists() and t["name"] not in args.force and not args.reprocess:
            print(f"[{i}/{len(tasks)}] 跳过（已存在）: {t['name']}")
            ok.append(t["name"]); continue
        print(f"[{i}/{len(tasks)}] {t['name']}")
        try:
            if args.reprocess:
                if not raw_path.exists():
                    print(f"  FAIL {t['name']}: raw 不存在"); fail.append(t["name"]); continue
            elif not raw_path.exists() or t["name"] in args.force:
                gen_one(t)
            if kind == "bg":
                process_bg(raw_path, out_path)
            else:
                process_sprite(raw_path, out_path)
            ok.append(t["name"])
        except Exception as e:
            print(f"  FAIL {t['name']}: {type(e).__name__}: {e}")
            fail.append(t["name"])

    print(f"\n完成 {len(ok)} / 失败 {len(fail)}")
    if fail:
        print("失败项:", ", ".join(fail)); sys.exit(1)


if __name__ == "__main__":
    main()
