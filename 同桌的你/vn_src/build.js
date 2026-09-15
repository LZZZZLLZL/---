/* 构建脚本：把 story/art/audio/main 内联进 engine.html 模板
   v2: 新增——把 vn_assets/img 下的图片以 base64 data-URI 内嵌为 window.VNASSETS，
       art.js（assets.js）运行时直接引用，保持单文件离线可玩。 */
const fs = require("fs");
const path = require("path");
const dir = __dirname;

/* ---- 收集图片资产 ---- */
const imgRoot = path.join(dir, "..", "vn_assets", "img");
const assets = {};
function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full);
    else if (/\.(webp|png|jpe?g)$/i.test(f)) {
      const key = f.replace(/\.(webp|png|jpe?g)$/i, "");
      const mime = f.endsWith(".png") ? "image/png"
                 : f.endsWith(".jpg") || f.endsWith(".jpeg") ? "image/jpeg"
                 : "image/webp";
      assets[key] = `data:${mime};base64,` + fs.readFileSync(full).toString("base64");
    }
  }
}
walk(imgRoot);
const assetScript =
  "/* 由 build.js 自动生成：内嵌图片资产 */\nwindow.VNASSETS = " +
  JSON.stringify(assets) + ";\n";

/* ---- 内联脚本 ---- */
const tpl = fs.readFileSync(path.join(dir, "engine.html"), "utf8");
const files = ["icons.js", "story.js", "art.js", "audio.js", "main.js"];
const scripts =
  "<script>\n" + assetScript + "\n</script>\n" +
  files.map(f => "<script>\n" + fs.readFileSync(path.join(dir, f), "utf8") + "\n</script>").join("\n");
const out = tpl.replace("<!--VN_SCRIPTS-->", scripts);
const dest = path.join(dir, "..", "同桌的你（视觉小说）.html");
fs.writeFileSync(dest, out, "utf8");
const kb = (out.length / 1024).toFixed(1);
console.log(`OK -> ${path.resolve(dest)} (${kb} KB, ${Object.keys(assets).length} images)`);
