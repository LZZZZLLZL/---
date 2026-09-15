
/* ============================================================
   同桌的你 · 音频
   Web Audio 程序化生成：治愈系五声音阶 BGM + 交互音效
   无外部音频文件，浏览器原生合成
   ============================================================ */
window.VNAUDIO = (function(){
  let ctx = null, master = null, timer = null;
  let started = false, playing = false;
  let bgmEnabled = true, sfxEnabled = true;
  const stepDur = 0.42;                 // 每步秒数
  const F = { "A2":110.0, "D3":146.83, "E3":164.81, "F#3":185.0, "A3":220.0,
              "A4":440.0, "B4":493.88, "C#5":554.37, "E5":659.25, "F#5":739.99, "A5":880.0,
              "rest": 0 };
  const melody = ["E5","C#5","B4","A4","B4","C#5","A4","rest",
                  "C#5","E5","F#5","E5","C#5","B4","A4","rest"];
  const bassRoots = [F["A2"], F["D3"], F["F#3"], F["E3"]];   // 每四步换一个根音

  function ensure(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if(ctx.state === "suspended") ctx.resume();
    return true;
  }

  function tone(freq, at, dur, type, vol, dest){
    if(!freq) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(vol, at + Math.min(0.12, dur*0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(dest || master);
    o.start(at); o.stop(at + dur + 0.05);
  }

  function scheduleStep(step, t){
    const m = melody[step % 16];
    if(m && m !== "rest") tone(F[m], t, stepDur*2.2, "triangle", 0.16);
    const root = bassRoots[Math.floor((step % 16)/4)];
    if(step % 4 === 0) tone(root, t, stepDur*4.4, "sine", 0.13);
    if(step % 8 === 2) tone(root*2, t, stepDur*3, "sine", 0.05);
  }

  function loop(){
    if(!playing) return;
    const ahead = ctx.currentTime + 0.30;
    while((window.__vnNextNote||0) < ahead){
      scheduleStep(window.__vnStep||0, window.__vnNextNote || ctx.currentTime + 0.05);
      window.__vnNextNote = (window.__vnNextNote || ctx.currentTime + 0.05) + stepDur;
      window.__vnStep = (window.__vnStep||0) + 1;
    }
    timer = setTimeout(loop, 120);
  }

  return {
    start(){
      if(started || !bgmEnabled) return;
      if(!ensure()) return;
      started = true; playing = true;
      window.__vnNextNote = 0; window.__vnStep = 0;
      loop();
    },
    stop(){ playing = false; if(timer){ clearTimeout(timer); timer = null; } },
    resume(){ if(started && !playing && bgmEnabled){ playing = true; loop(); } },
    setVolume(v){ if(master) master.gain.value = v; },
    isPlaying(){ return playing; },
    /* BGM 独立开关：关闭即停循环，开启即恢复 */
    setBgm(on){
      bgmEnabled = on;
      if(on){ if(started) resume(); else start(); }
      else stop();
    },
    setSfx(on){ sfxEnabled = on; },
    isBgmOn(){ return bgmEnabled; },
    isSfxOn(){ return sfxEnabled; },

    /* ---- 音效 ---- */
    sfx(kind){
      if(!sfxEnabled) return;
      if(!ensure()) return;
      const t = ctx.currentTime;
      if(kind === "click"){
        tone(880, t, 0.07, "sine", 0.12);
      } else if(kind === "choice"){
        tone(660, t, 0.09, "triangle", 0.14);
        tone(990, t+0.09, 0.12, "triangle", 0.14);
      } else if(kind === "candy"){
        [1318,1568,2093].forEach((f,i)=>tone(f, t+i*0.07, 0.18, "sine", 0.10));
      } else if(kind === "heart"){
        tone(70, t, 0.12, "sine", 0.5);
        tone(70, t+0.20, 0.10, "sine", 0.35);
      } else if(kind === "end"){
        [523.25, 659.25, 783.99, 1046.5].forEach((f,i)=>tone(f, t+i*0.14, 0.5, "triangle", 0.12));
      }
    }
  };
})();

/* 首次交互解锁音频 */
(function(){
  const un = ()=>{ window.VNAUDIO.start(); };
  document.addEventListener("pointerdown", un, { once:true });
  document.addEventListener("keydown", un, { once:true });
})();

