/* 从构建产物中抽出所有 <script> 并逐个做语法检查 + 剧本图完整性校验 */
const fs = require("fs");
const path = require("path");
const dir = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(dir, "同桌的你（视觉小说）.html"), "utf8");

// 1) 抽 script 检查语法
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
console.log("script blocks:", scripts.length);
scripts.forEach((s, i) => fs.writeFileSync(path.join(__dirname, "chk" + i + ".js"), s));
const { execSync } = require("child_process");
for (let i = 0; i < scripts.length; i++) {
  execSync(`node --check "${path.join(__dirname, "chk" + i + ".js")}"`);
}
console.log("SYNTAX OK");

// 2) 剧本图校验（在 Node 里模拟 window 执行 story.js）
global.window = {};
eval(fs.readFileSync(path.join(dir, "vn_src", "story.js"), "utf8"));
const S = global.window.VNS;
const art = fs.readFileSync(path.join(dir, "vn_src", "art.js"), "utf8");
// 提取背景/CG键名做交叉校验
const bgKeys = [...art.matchAll(/window\.VNART\.bgs\s*=\s*\{([\s\S]*?)\};/g)].flatMap(m =>
  [...m[1].matchAll(/^\s*(\w+):/gm)].map(x => x[1]));
const cgKeys = [...art.matchAll(/window\.VNART\.cgs\s*=\s*\{([\s\S]*?)\};/g)].flatMap(m =>
  [...m[1].matchAll(/^\s*(\w+):/gm)].map(x => x[1]));
console.log("bg keys:", bgKeys.join(","), "| cg keys:", cgKeys.join(","));

const ids = Object.keys(S.nodes);
let errs = [];
for (const id of ids) {
  const n = S.nodes[id];
  const targets = [];
  if (n.next) targets.push(n.next);
  if (n.choices) n.choices.forEach(c => targets.push(c.next));
  for (const t of targets) if (!S.nodes[t]) errs.push(`节点 ${id} 指向不存在的 ${t}`);
  if (n.bg && !bgKeys.includes(n.bg)) errs.push(`节点 ${id} 使用未定义背景 ${n.bg}`);
  if (n.cg && !cgKeys.includes(n.cg)) errs.push(`节点 ${id} 使用未定义CG ${n.cg}`);
  if (!n.text) errs.push(`节点 ${id} 没有台词`);
  if (n.ending && !S.endings.includes(n.ending)) errs.push(`节点 ${id} 结局 ${n.ending} 未登记`);
}
// 可达性
const seen = new Set([S.start]);
const q = [S.start];
while (q.length) {
  const id = q.shift(); const n = S.nodes[id]; if (!n) continue;
  let ts = n.next ? [n.next] : [];
  if (n.choices) n.choices.forEach(c => ts.push(c.next));
  if (n.hub) ts = ts.concat(["end_true", "end_dawn", "final"]);  // 引擎按好感度路由
  ts.forEach(t => { if (!seen.has(t)) { seen.add(t); q.push(t); } });
}
const orphans = ids.filter(i => !seen.has(i));
if (orphans.length) errs.push("不可达节点: " + orphans.join(","));
const endReached = S.endings.filter(e => { /* ending 节点本身可达即可 */ return seen.has(e) || ids.some(i => S.nodes[i].ending === e && seen.has(i)); });
console.log("节点总数:", ids.length, "| 分支点:", ids.filter(i => S.nodes[i].choices).length, "| 可达:", seen.size);
console.log("结局可达:", endReached.length + "/" + S.endings.length);
if (errs.length) { console.log("ERRORS:\n" + errs.join("\n")); process.exit(1); }
console.log("STORY GRAPH OK");
