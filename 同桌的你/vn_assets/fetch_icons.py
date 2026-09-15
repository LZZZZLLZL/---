# -*- coding: utf-8 -*-
"""从 Tabler Icons 官方仓库下载所需图标并生成 vn_src/icons.js"""
import urllib.request, re, sys
from pathlib import Path

ICONS = {
    "clover":        ["clover", "leaf"],
    "sunrise":       ["sunrise"],
    "mail-heart":    ["mail-heart", "mail"],
    "backpack":      ["backpack"],
    "feather":       ["feather"],
    "heart":         ["heart"],
    "device-floppy": ["device-floppy"],
    "lock":          ["lock"],
    "caret-right":   ["caret-right"],
    "caret-down":    ["caret-down"],
    "sparkles":      ["sparkles-2", "sparkles", "wand"],
    "history":       ["history"],
    "door-exit":     ["door-exit"],
    "home":          ["home"],
}
BASES = [
    "https://raw.githubusercontent.com/tabler/tabler-icons/main/icons/outline/{name}.svg",
    "https://cdn.jsdelivr.net/npm/@tabler/icons@1.119.0/icons/{name}.svg",
]

def fetch(name):
    for base in BASES:
        url = base.format(name=name)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                return r.read().decode("utf-8")
        except Exception:
            continue
    return None

out = {}
missing = []
for key, candidates in ICONS.items():
    got = None
    for c in candidates:
        svg = fetch(c)
        if svg and "<svg" in svg:
            m = re.search(r"<svg[^>]*>([\s\S]*?)</svg>", svg)
            inner = m.group(1).strip()
            # 去掉注释
            inner = re.sub(r"<!--[\s\S]*?-->", "", inner).strip()
            got = inner
            print(f"{key:14s} <- {c}.svg  ({len(inner)} bytes)")
            break
    if got:
        out[key] = got
    else:
        missing.append(key)
        print(f"{key:14s} MISSING")

if missing:
    print("缺失:", missing); sys.exit(1)

js = ["/* Tabler Icons (MIT) 内嵌图标库 - https://github.com/tabler/tabler-icons */",
      "window.VNICON = (function(){",
      "  var I = {"]
for k, v in out.items():
    v2 = v.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ")
    js.append(f"    '{k}': '{v2}',")
js += ["  };",
       "  return {",
       "    icon: function(name, style){",
       "      var s = style ? ' style=\"'+style+'\"' : '';",
       "      return '<svg class=\"vn-ic\"'+s+' viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">' + I[name] + '</svg>';",
       "    }",
       "  };",
       "})();", ""]
Path("E:/Projects/同桌的你/vn_src/icons.js").write_text("\n".join(js), encoding="utf-8")
print("icons.js written")
