/* ============================================================
   同桌的你 · 游戏引擎逻辑
   ============================================================ */
(function(){
"use strict";
var S = window.VNS;
var ENDINFO = {
  end_main:     { n:"同桌的你",     ico:"clover",   d:"三条路最后都通向同一颗糖。他们的故事开始于一句“同桌嘛”，也不会结束于一句“再见”。" },
  end_dawn:     { n:"晨光",        ico:"sunrise",  d:"红绳戴了三年，铃铛还在。你们考进了同一座城市——这是“好好对她”最好的成绩单。（需要很高的好感）" },
  end_confess:  { n:"说出口的夏天",  ico:"mail-heart", d:"把喜欢说出口的那个人，先得到了回答。（在银杏树下说出那句喜欢）" },
  end_hesitate: { n:"一步之约",     ico:"backpack", d:"先读完明天的早读，再读下一个月。一步一步来的人，也在被谁悄悄跟随着。（在银杏树下选择“明天”）" },
  end_true:     { n:"写诗的人",     ico:"feather",  hidden:true, d:"隐藏结局：那些写在草稿纸上、夹在课本里的诗，最后变成了一本诗集。铃铛系在扉页上，念诗的时候，它就响了。（需要满好感，并且愿意在灯下听她讲完那道题）" }
};
var $ = function(id){ return document.getElementById(id); };
var el = {
  bg:$("bg"), chara:$("chara"), ch1:$("ch1"), cg:$("cg"), dlg:$("dlg"), who:$("who"),
  txt:$("txt"), next:$("next"), bar:$("bar"), choices:$("choices"),
  title:$("title"), endcard:$("endcard"), endName:$("end-name"), endDesc:$("end-desc"),
  modal:$("modal"), mtitle:$("m-title"), mbody:$("m-body"), toast:$("toast"), tch:$("title-ch"),
  tbg:$("title-bg")
};
var state = { node:null, history:[], seen:{}, auto:false, autoTimer:null, speed:34, chapter:"序章",
              aff:0, affSeen:{}, flags:{}, pendingEnd:"end_main", bg:null };
var IMAGES = window.VNART.build();

/* ---------- 存档位与偏好设置 ---------- */
var SLOTS = ["auto", "1", "2", "3", "4", "5", "6"];
var prefs = (function(){
  try{
    var p = JSON.parse(localStorage.getItem("vn_prefs") || "{}");
    return { autoSave: p.autoSave !== false, typeEffect: p.typeEffect !== false,
             showHero: p.showHero === true,
             bgm: p.bgm !== false, sfx: p.sfx !== false };
  }catch(e){ return { autoSave: true, typeEffect: true, showHero: false, bgm: true, sfx: true }; }
})();
function savePrefs(){ try{ localStorage.setItem("vn_prefs", JSON.stringify(prefs)); }catch(e){} }
function readSaves(){ try{ return JSON.parse(localStorage.getItem("vn_saves") || "{}"); }catch(e){ return {}; } }
function writeSaves(s){ try{ localStorage.setItem("vn_saves", JSON.stringify(s)); }catch(e){} }
/* 旧版单存档迁移到存档位 1 */
try{
  if(!localStorage.getItem("vn_saves") && localStorage.getItem("vn_save")){
    var oldSave = JSON.parse(localStorage.getItem("vn_save"));
    if(oldSave && oldSave.node){
      oldSave.text = ""; oldSave.ts = Date.now();
      var mig = {}; mig["1"] = oldSave;
      localStorage.setItem("vn_saves", JSON.stringify(mig));
    }
  }
}catch(e){}

/* ---------- 工具 ---------- */
function toast(msg){
  el.toast.innerHTML = msg; el.toast.classList.add("on");
  clearTimeout(toast.t); toast.t = setTimeout(function(){ el.toast.classList.remove("on"); }, 1600);
}
function openModal(title, html){
  el.mtitle.textContent = title; el.mbody.innerHTML = html;
  el.modal.classList.add("on");
}
function closeModal(){ el.modal.classList.remove("on"); }
function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

/* ---------- 章节标题 ---------- */
function chapterOf(id){
  if(id.indexOf("s1_")===0) return "第一章 · 你好，我叫林微";
  if(id.indexOf("c2_")===0 || id==="ch2_start") return "第二章 · 第四排与第五排";
  if(id.indexOf("c3_")===0 || id==="ch3_card") return "第三章 · 八月十五的那封信";
  if(id.indexOf("c4_")===0 || id==="ch4_card") return "第四章 · 分科以后";
  if(id.indexOf("c5_")===0 || id.indexOf("end_")===0 || id.indexOf("e_")===0 || id==="final" || id==="endings") return "终章 · 银杏树下";
  return "序章";
}

/* ---------- 渲染 ---------- */
function setBg(key){
  var img = IMAGES["bg_"+key];
  if(img) el.bg.style.backgroundImage = "url(\""+img+"\")";
}
function showChara(spk, mood){
  if(!spk || (spk === "liyang" && !prefs.showHero)){
    el.ch1.classList.remove("on");
    return;
  }
  var key = "ch_"+spk+"_"+(mood||"smile");
  var img = IMAGES[key] || IMAGES["ch_"+spk+"_smile"];
  if(img) el.ch1.innerHTML = "<img src=\""+img+"\" alt=\"\">";
  var side = (spk==="linwei") ? "left" : "right";
  el.chara.className = side;
  el.ch1.classList.add("on");
}
function setCg(key){
  if(!key){ el.cg.classList.remove("on"); return; }
  var img = IMAGES[key];
  if(img){ el.cg.style.backgroundImage = "url(\""+img+"\")"; el.cg.classList.add("on"); }
}

/* ---------- 打字机 ---------- */
var tw = { timer:null, full:"", pos:0, done:false, cb:null };
function typeWrite(text, cb){
  clearInterval(tw.timer); tw.done = false;
  tw.full = text; tw.pos = 0; tw.cb = cb || null;
  el.next.style.visibility = "hidden";
  if(!prefs.typeEffect){   /* 打字效果关闭：整句即时显示 */
    el.txt.textContent = tw.full; tw.done = true;
    el.next.style.visibility = "visible";
    if(tw.cb){ var f0 = tw.cb; tw.cb = null; f0(); }
    return;
  }
  el.txt.innerHTML = "";
  tw.timer = setInterval(function(){
    tw.pos += 1;
    el.txt.textContent = tw.full.slice(0, tw.pos);
    if(tw.pos >= tw.full.length){
      clearInterval(tw.timer); tw.done = true;
      el.next.style.visibility = "visible";
      if(tw.cb){ var f = tw.cb; tw.cb = null; f(); }
    }
  }, state.speed);
}
function skipType(){
  if(!tw.done){
    clearInterval(tw.timer); el.txt.textContent = tw.full; tw.done = true;
    el.next.style.visibility = "visible";
    if(tw.cb){ var f = tw.cb; tw.cb = null; f(); }
    return false;
  }
  return true;
}

/* ---------- 进度条 ---------- */
function renderBar(){
  var path = state.path || [];
  var n = Math.min(path.length, 12);
  var html = "";
  for(var i=0;i<n;i++) html += "<i class=\"f\"></i>";
  for(var j=n;j<12;j++) html += "<i></i>";
  el.bar.innerHTML = html;
}

/* ---------- 历史记录 ---------- */
function pushHistory(node, id){
  var entry = null;
  if(node.name) entry = { w:node.name, t:node.text, cls: node.name==="林微的信" ? "sys" : (node.spk==="linwei"?"female":"") };
  else entry = { w:"——", t:node.text, cls:"sys" };
  if(node.choices) entry.choice = node.choices.map(function(c){ return c.text; });
  state.history.push(entry);
  if(state.history.length > 200) state.history.shift();
}

/* ---------- 核心流程 ---------- */
function goto(id, fromChoice){
  var node = S.nodes[id];
  if(!node){ toast("剧本错误：找不到节点 "+id); return; }

  /* ---- 结局分派枢纽：诺言线按好感度路由 ---- */
  if(node.hub){
    var a = state.aff;
    if(a >= 4){ id = "end_true"; }
    else if(a >= 3){ id = "end_dawn"; }
    else { id = "final"; }
    state.pendingEnd = (id === "final") ? "end_main" : id;
    node = S.nodes[id];
  }
  if(id === "endings" && state.pendingEnd){
    node = Object.assign({}, node, { ending: state.pendingEnd });
  }

  if(!fromChoice){
    if(node.choices){ state.path = []; }        // 分支点重置进度
    else if(!state.path) state.path = [];
    state.path.push(1);
    if(state.path.length > 12) state.path = [12];
  }
  state.node = id;
  var ch = chapterOf(id);
  if(ch !== state.chapter){ state.chapter = ch; }
  el.tch.textContent = state.chapter;
  renderBar();

  if(node.aff && !state.affSeen[id]){
    state.affSeen[id] = 1;
    state.aff += node.aff;
    window.VNAUDIO.sfx("candy");
    toast(window.VNICON.icon("heart", "color:#d4727f") + " 好感度 +1（当前 " + state.aff + "）");
  }
  if(node.tag){
    state.history.push({ w:"——", t:"【"+node.tag+"】", cls:"sys" });
    toast(node.tag);
  }
  pushHistory(node, id);
  if(prefs.autoSave && !node.ending) autoSave();

  /* 说话人名牌 */
  if(node.name){
    el.who.textContent = node.name;
    el.who.className = (node.spk === "linwei") ? "female" : "";
  } else {
    el.who.className = "none";
  }

  /* 背景跟随：节点未声明 bg 时沿用当前背景（不回退默认场景） */
  if(node.bg) state.bg = node.bg;
  setBg(state.bg || "courty");
  setCg(node.cg || null);
  showChara(node.spk, node.mood);

  if(node.ending){ showEnding(node); return; }

  if(node.choices){
    el.dlg.style.opacity = "0.72";
    typeWrite(node.text, function(){
      renderChoices(node);
    });
  } else {
    el.dlg.style.opacity = "1";
    el.choices.innerHTML = "";
    typeWrite(node.text);
    scheduleAuto();
  }
}

function renderChoices(node){
  el.choices.innerHTML = "";
  node.choices.forEach(function(c, i){
    var d = document.createElement("div");
    d.className = "c";
    d.innerHTML = '<span class="choice-ic">' + window.VNICON.icon("caret-right") + '</span>' + esc(c.text);
    d.onclick = function(ev){
      ev.stopPropagation();
      window.VNAUDIO.sfx("choice");
      state.history.push({ w:"选择", t:"「"+c.text+"」", cls:"sys" });
      if(c.end) state.pendingEnd = c.end;
      el.choices.innerHTML = "";
      el.dlg.style.opacity = "1";
      state.path = [];
      goto(c.next, true);
    };
    el.choices.appendChild(d);
    setTimeout(function(){ d.style.opacity="1"; d.style.transform="translateY(0)"; }, 40+i*90);
  });
}

function advance(){
  if(!state.node) return;
  var node = S.nodes[state.node];
  if(node.choices && el.choices.innerHTML !== "") return;  // 必须选择
  if(!skipType()){ window.VNAUDIO.sfx("click"); return; }
  window.VNAUDIO.sfx("click");
  if(node.next) goto(node.next);
}

/* ---------- 自动播放 ---------- */
function scheduleAuto(){
  if(!state.auto) return;
  clearTimeout(state.autoTimer);
  state.autoTimer = setTimeout(function(){
    if(state.auto && !S.nodes[state.node].choices) advance();
  }, 1800 + state.speed * (tw.full||"").length * 0.6);
}
function toggleAuto(){
  state.auto = !state.auto;
  toast(state.auto ? "自动播放：开" : "自动播放：关");
  if(state.auto) scheduleAuto(); else clearTimeout(state.autoTimer);
}

/* ---------- 结局 ---------- */
function showEnding(node){
  var info = ENDINFO[node.ending] || { n:"— 完 —", d:"" };
  try{
    var seen = JSON.parse(localStorage.getItem("vn_endings")||"{}");
    seen[node.ending] = true;
    localStorage.setItem("vn_endings", JSON.stringify(seen));
  }catch(e){}
  window.VNAUDIO.sfx("end");
  el.endName.textContent = info.n;
  el.endDesc.textContent = info.d;
  setTimeout(function(){
    el.endcard.classList.add("on");
  }, 1200);
}
function refreshContinue(){
  try{
    var saves = readSaves();
    var hasAny = false;
    for(var k in saves){ if(saves[k] && saves[k].node) hasAny = true; }
    $("m-cont").disabled = !hasAny;
  }catch(e){}
}

/* ---------- 存档/读档（多存档位：auto + 1~6） ---------- */
function fmtTime(ts){
  try{
    var d = new Date(ts);
    return (d.getMonth()+1) + "月" + d.getDate() + "日 " +
      ("0"+d.getHours()).slice(-2) + ":" + ("0"+d.getMinutes()).slice(-2);
  }catch(e){ return ""; }
}
function captureSnapshot(){
  return {
    node: state.node, chapter: state.chapter, bg: state.bg,
    history: state.history.slice(-40), path: state.path,
    aff: state.aff, pendingEnd: state.pendingEnd, affSeen: state.affSeen,
    text: (tw && tw.done && el.txt.textContent) ? el.txt.textContent.slice(0, 60) : "",
    ts: Date.now()
  };
}
function writeSave(slot, silent){
  if(!state.node){ toast("还没有开始故事"); return false; }
  try{
    var saves = readSaves();
    saves[slot] = captureSnapshot();
    writeSaves(saves);
    if(!silent) toast("已存档 ✓");
    refreshContinue();
    return true;
  }catch(e){ if(!silent) toast("存档失败：" + e.message); return false; }
}
function autoSave(){
  if(!state.node) return;
  try{
    var saves = readSaves();
    var snap = captureSnapshot();
    snap.text = (el.txt.textContent || "").slice(0, 60);
    saves["auto"] = snap;
    writeSaves(saves);
    refreshContinue();
  }catch(e){}
}
function loadSlot(slot){
  var saves = readSaves();
  var d = saves[slot];
  if(!d || !d.node){ toast("该存档位是空的"); return; }
  try{
    state.history = d.history || [];
    state.path = d.path || [];
    state.aff = d.aff || 0;
    state.pendingEnd = d.pendingEnd || "end_main";
    state.chapter = d.chapter || chapterOf(d.node);
    state.bg = d.bg || null;
    startGame(d.node, true);
    state.affSeen = d.affSeen || {};
    closeModal();
    toast("读档成功 ✓");
  }catch(e){ toast("读档失败：" + e.message); }
}
function deleteSave(slot){
  var saves = readSaves();
  if(!saves[slot]){ toast("该存档位是空的"); return; }
  delete saves[slot];
  writeSaves(saves);
  refreshContinue();
  toast("已删除存档");
  openSavePanel(lastPanelMode);
}
var lastPanelMode = "save";
var lastPanelPage = 0;
function openSavePanel(mode, page){
  lastPanelMode = mode;
  lastPanelPage = page || 0;
  var saves = readSaves();
  var names = { auto:"自动存档", "1":"存档位 一", "2":"存档位 二", "3":"存档位 三",
                "4":"存档位 四", "5":"存档位 五", "6":"存档位 六" };

  function slotRow(slot){
    var d = saves[slot];
    var isAuto = slot === "auto";
    var prev = d && d.node ? (esc((d.text || "（继续此处剧情）").slice(0, 48))) : "— 空存档位 —";
    var time = d && d.ts ? fmtTime(d.ts) : "";
    var ops = "";
    if(mode === "save" && !isAuto)
      ops += "<button class='slot-btn' data-act='save' data-slot='"+slot+"'>保存</button>";
    if(mode === "load")
      ops += "<button class='slot-btn' data-act='load' data-slot='"+slot+"'"+(d?"":" disabled")+">读取</button>";
    if(d)
      ops += "<button class='slot-btn del' data-act='del' data-slot='"+slot+"'>✕</button>";
    return "<div class='slot-it"+(isAuto?" auto":"")+"'>"
      + "<div class='slot-ico'>"+(isAuto?"<b style='font-size:18px'>A</b>":window.VNICON.icon("device-floppy"))+"</div>"
      + "<div class='slot-info'>"
      +   "<div class='slot-name'>"+names[slot]+(isAuto?" <span class='slot-hint'>剧情推进时自动覆盖</span>":"")+"</div>"
      +   "<div class='slot-prev'>"+prev+"</div>"
      +   "<div class='slot-time'>"+time+"</div>"
      + "</div>"
      + "<div class='slot-ops'>"+ops+"</div>"
      + "</div>";
  }

  /* 手动存档位分页：每页 3 个 */
  var manual = ["1","2","3","4","5","6"];
  var PER = 3;
  var pages = Math.ceil(manual.length / PER);
  var cur = Math.min(Math.max(lastPanelPage, 0), pages - 1);
  var html = slotRow("auto");
  html += "<div class='slot-divider'></div>";
  manual.slice(cur*PER, cur*PER+PER).forEach(function(slot){ html += slotRow(slot); });
  if(pages > 1){
    html += "<div class='slot-pager'>"
      +  "<button class='slot-page' data-page='"+(cur-1)+"'"+(cur===0?" disabled":"")+">‹</button>"
      +  "<span class='slot-pageinfo'>"+(cur+1)+" / "+pages+"</span>"
      +  "<button class='slot-page' data-page='"+(cur+1)+"'"+(cur===pages-1?" disabled":"")+">›</button>"
      +  "</div>";
  }
  html += "<div style='text-align:center;color:#b3a78f;font-size:12px;margin-top:6px'>"
    + (mode === "save" ? "选择一个存档位保存当前进度" : "选择要读取的存档")
    + "</div>";
  openModal(mode === "save" ? "保存进度" : "读取进度", html);
  var panel = document.getElementById("m-body");
  panel.querySelectorAll(".slot-btn").forEach(function(btn){
    btn.onclick = function(ev){
      ev.stopPropagation();
      var s = btn.getAttribute("data-slot"), act = btn.getAttribute("data-act");
      if(act === "save"){ if(writeSave(s)){ openSavePanel("save", cur); } }
      else if(act === "load"){ loadSlot(s); }
      else if(act === "del"){ deleteSave(s); }
    };
  });
  panel.querySelectorAll(".slot-page").forEach(function(btn){
    btn.onclick = function(ev){
      ev.stopPropagation();
      openSavePanel(mode, parseInt(btn.getAttribute("data-page"), 10));
    };
  });
}

/* ---------- 面板 ---------- */
function showLog(){
  var html = state.history.map(function(h){
    var w = esc(h.w);
    if(h.cls === "sys" && h.w.indexOf("选择") >= 0)
      w = '<span class="log-sel">' + window.VNICON.icon("sparkles") + ' 选择</span>';
    return "<div class=\"log-it "+(h.cls||"")+"\"><div class=\"w "+(h.cls||"")+"\">"+w+"</div><div class=\"t\">"+esc(h.t)+"</div></div>";
  }).join("");
  if(!html) html = "<div style='color:#b3a78f;text-align:center;padding:30px'>还没有故事记录</div>";
  openModal("历史记录", html);
}
function showEndings(){
  var seen = {};
  try{ seen = JSON.parse(localStorage.getItem("vn_endings")||"{}"); }catch(e){}
  var html = Object.keys(ENDINFO).map(function(k){
    var got = seen[k];
    var info = ENDINFO[k];
    var isHidden = info.hidden && !got;
    var title = got ? esc(info.n) : (isHidden ? "隐藏结局" : "？？？");
    var desc = got ? info.d : (isHidden ? "唯有把每一步都走对的人，才能抵达的结局。" : "尚未抵达的结局。多周目尝试不同选择吧。");
    var icoHtml = got ? window.VNICON.icon(info.ico) : window.VNICON.icon("lock");
    return "<div class=\"end-it "+(got?"":"locked")+"\"><div class=\"ico\">"+icoHtml+"</div><div><div class=\"ti\">"+title+"</div><div class=\"de\">"+desc+"</div></div></div>";
  }).join("");
  var gotCount = Object.keys(ENDINFO).filter(function(k){ return seen[k]; }).length;
  openModal("结局图鉴（"+gotCount+"/"+Object.keys(ENDINFO).length+"）", html + "<div style='text-align:center;color:#b3a78f;font-size:12px;margin-top:6px'>好感度由每一个心动瞬间的选择累积而成——留意那些" + window.VNICON.icon("heart", "color:#d4727f") + "提示</div>");
}
function showSettings(){
  var html = "<div class='set-grid'>"
       +  "<div class='set-col'><div class='set-h'>声音</div>"
       +    "<div class='setrow'><div class='set-top'><label>背景音乐</label><button class='toggle' id='set-bgm'>"+(prefs.bgm?"开":"关")+"</button></div>"
       +    "<span class='hint'>治愈系五声音阶循环 BGM</span></div>"
       +    "<div class='setrow'><div class='set-top'><label>音效</label><button class='toggle' id='set-sfx'>"+(prefs.sfx?"开":"关")+"</button></div>"
       +    "<span class='hint'>点击、选项、好感度提示等交互音</span></div>"
       +    "<div class='setrow'><label>音量</label><input type='range' id='set-vol' min='0' max='100' value='50'><span class='val' id='vol-v'>50</span></div>"
       +  "</div>"
       +  "<div class='set-col'><div class='set-h'>显示</div>"
       +    "<div class='setrow'><label>文字速度</label><input type='range' id='set-speed' min='10' max='80' value='"+state.speed+"'><span class='val' id='spd-v'>"+state.speed+"</span></div>"
       +    "<div class='setrow'><div class='set-top'><label>打字效果</label><button class='toggle' id='set-typefx'>"+(prefs.typeEffect?"开":"关")+"</button></div>"
       +    "<span class='hint'>关闭后台词整句即时显示</span></div>"
       +    "<div class='setrow'><div class='set-top'><label>男主立绘</label><button class='toggle' id='set-hero'>"+(prefs.showHero?"开":"关")+"</button></div>"
       +    "<span class='hint'>开启后对话时显示李洋的立绘</span></div>"
       +    "<div class='setrow'><div class='set-top'><label>自动保存</label><button class='toggle' id='set-autosave'>"+(prefs.autoSave?"开":"关")+"</button></div>"
       +    "<span class='hint'>剧情推进时自动写入「自动存档」位</span></div>"
       +  "</div>"
       + "</div>";
  html += "<div class='set-actions'>"
       +  "<button id='set-backtitle'>返回标题</button>"
       +  "<button id='set-quit'>退出游戏</button></div>";
  html += "<div style='color:#6b5e4a;font-size:13px;line-height:2;margin-top:12px'>操作说明：点击画面或按空格 → 下一句 · 数字键 1-3 → 快速选择 · Esc → 关闭弹窗</div>";
  openModal("设置", html);
  setTimeout(function(){
    var sp = $("set-speed"), vol = $("set-vol");
    if(sp) sp.oninput = function(){ state.speed = +sp.value; $("spd-v").textContent = sp.value; };
    if(vol) vol.oninput = function(){ window.VNAUDIO.setVolume(vol.value/100); $("vol-v").textContent = vol.value; };
    var as = $("set-autosave"), tf = $("set-typefx"), hero = $("set-hero");
    var bg = $("set-bgm"), sf = $("set-sfx");
    if(as) as.onclick = function(){
      prefs.autoSave = !prefs.autoSave; savePrefs();
      as.textContent = prefs.autoSave ? "开" : "关";
      toast(prefs.autoSave ? "自动保存：开" : "自动保存：关");
    };
    if(tf) tf.onclick = function(){
      prefs.typeEffect = !prefs.typeEffect; savePrefs();
      tf.textContent = prefs.typeEffect ? "开" : "关";
    };
    if(hero) hero.onclick = function(){
      prefs.showHero = !prefs.showHero; savePrefs();
      hero.textContent = prefs.showHero ? "开" : "关";
      /* 实时刷新当前画面上的立绘 */
      if(state.node){
        var n = S.nodes[state.node];
        if(n) showChara(n.spk, n.mood);
      }
    };
    if(bg) bg.onclick = function(){
      prefs.bgm = !prefs.bgm; savePrefs();
      bg.textContent = prefs.bgm ? "开" : "关";
      window.VNAUDIO.setBgm(prefs.bgm);
    };
    if(sf) sf.onclick = function(){
      prefs.sfx = !prefs.sfx; savePrefs();
      sf.textContent = prefs.sfx ? "开" : "关";
      window.VNAUDIO.setSfx(prefs.sfx);
      if(prefs.sfx) window.VNAUDIO.sfx("choice");  /* 开启时给个反馈音 */
    };
    var bt = $("set-backtitle"), q = $("set-quit");
    if(bt) bt.onclick = function(){ closeModal(); toTitle(); };
    if(q) q.onclick = function(){
      if(prefs.autoSave && state.node) autoSave();
      window.close();
      setTimeout(function(){
        try{ window.open("", "_self"); window.close(); }catch(e){}
      }, 60);
      toTitle();
      toast("已尝试关闭窗口；若浏览器阻止，可手动关闭标签页");
    };
  }, 0);
}

/* ---------- 开始/回到标题 ---------- */
function startGame(nodeId, keepState){
  el.title.style.display = "none";
  el.endcard.classList.remove("on");
  state.node = null; state.path = [];
  if(!keepState){
    state.aff = 0; state.pendingEnd = "end_main"; state.affSeen = {};
    state.bg = null;
  }
  goto(nodeId || S.start);
}
function toTitle(){
  el.title.style.display = "flex";
  el.endcard.classList.remove("on");
  el.choices.innerHTML = "";
  el.txt.textContent = ""; el.dlg.style.opacity = "1";
  el.ch1.classList.remove("on"); el.cg.classList.remove("on");
  state.node = null;
  refreshContinue();
}

/* ---------- 事件绑定 ---------- */
document.getElementById("app").addEventListener("click", function(e){
  if(!state.node) return;
  if(e.target.closest("#topbar") || e.target.closest("#choices") ||
     e.target.closest(".modal") || e.target.closest("#endcard")) return;
  advance();
});
document.addEventListener("keydown", function(e){
  if(e.code === "Space" || e.code === "Enter"){ e.preventDefault(); advance(); }
  if(e.key === "Escape") closeModal();
  if(["1","2","3"].indexOf(e.key)>=0){
    var opts = el.choices.querySelectorAll(".c");
    if(opts[+e.key-1]) opts[+e.key-1].click();
  }
});
$("m-new").onclick = function(){ window.VNAUDIO.sfx("click"); state.history=[]; state.path=[]; startGame(S.start); };
$("m-cont").onclick = function(){ window.VNAUDIO.sfx("click"); openSavePanel("load"); };
$("m-endings").onclick = showEndings;
$("m-set").onclick = showSettings;
$("btn-log").onclick = showLog;
$("btn-auto").onclick = toggleAuto;
$("btn-save").onclick = function(){ window.VNAUDIO.sfx("click"); openSavePanel("save"); };
$("btn-load").onclick = function(){ window.VNAUDIO.sfx("click"); openSavePanel("load"); };
$("btn-endings").onclick = showEndings;
$("btn-set").onclick = showSettings;
$("m-close").onclick = closeModal;
$("end-retry").onclick = function(){ startGame(S.start); };
$("end-title").onclick = toTitle;
el.modal.addEventListener("click", function(e){ if(e.target === el.modal) closeModal(); });

/* ---------- 标题屏背景 ---------- */
function setTitleBg(){
  var img = IMAGES["bg_ginko_autumn"] || IMAGES["bg_sunset"] || IMAGES["bg_ginko"];
  if(img && el.tbg){
    el.tbg.style.backgroundImage = "url(\""+img+"\")";
    el.tbg.classList.add("on");
  }
}

/* 静态文本符号替换为矢量图标 */
$("next").innerHTML = window.VNICON.icon("caret-down");
document.querySelector("#cg .cglabel").innerHTML = window.VNICON.icon("caret-right") + " 已存入图鉴";

refreshContinue();
setTitleBg();
/* 应用音频偏好 */
window.VNAUDIO.setSfx(prefs.sfx);
if(!prefs.bgm) window.VNAUDIO.setBgm(false);
})();
