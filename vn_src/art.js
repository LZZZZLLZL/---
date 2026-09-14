/* ============================================================
   同桌的你 · 美术库
   v2：AI 生成的位图资产（见 vn_assets/）通过 window.VNASSETS
   内嵌进单文件 HTML；本文件保留原 SVG 矢量插画作为兜底，
   资产缺失时自动回退，保证任何情况下都能显示。
   ============================================================ */
window.VNART = {};

/* ---------------- 立绘 ---------------- */
function ponytail(){return `
  <path d="M148,96 Q196,120 186,178 Q182,210 160,224 Q178,196 172,168 Q168,146 150,132 Z" fill="#5a4234"/>
  <path d="M150,120 Q188,138 182,190" stroke="#4a3529" stroke-width="3" fill="none" opacity=".55"/>`;}

function linweiBody(){
  return `
  <path d="M84,468 Q88,392 132,356 Q150,340 174,346 Q216,358 226,414 L230,468 Z" fill="#bfe0ef"/>
  <path d="M174,346 L174,468" stroke="#9fc6da" stroke-width="2" opacity=".6"/>
  <path d="M158,352 L174,386 L192,352" fill="none" stroke="#e9d8c4" stroke-width="5" stroke-linecap="round"/>
  <circle cx="150" cy="366" r="4" fill="#e9d8c4"/>
  <circle cx="198" cy="366" r="4" fill="#e9d8c4"/>
  <path d="M132,356 Q112,368 108,392" stroke="#e9d8c4" stroke-width="3" fill="none" opacity=".7"/>
  <path d="M118,452 l14,-8 2,10 10,-4" stroke="#8a5a44" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M108,392 L96,448" stroke="#e9d8c4" stroke-width="5" stroke-linecap="round"/>`;
}

/* mood: smile | shy | sad */
window.VNART.linwei = function(mood){
  mood = mood || "smile";
  let face;
  if(mood==="smile"){
    face = `
    <path d="M110,96 Q112,52 150,48 Q190,44 194,92 Q196,128 176,148 Q150,168 126,150 Q108,134 110,96 Z" fill="#fffbf4"/>
    <path d="M110,96 Q106,50 150,44 Q196,42 194,92" fill="none" stroke="#5a4234" stroke-width="3"/>
    <path d="M108,88 Q104,44 150,42 Q198,40 196,90 Q198,58 170,52 Q136,46 118,62 Q108,72 108,88 Z" fill="#5a4234"/>
    ${ponytail()}
    <path d="M124,104 q10,-8 20,0" stroke="#5a4234" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M164,104 q10,-8 20,0" stroke="#5a4234" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M136,128 q14,12 28,0" stroke="#d97a6a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="120" cy="118" r="7" fill="#ffc9c2" opacity=".55"/>
    <circle cx="188" cy="118" r="7" fill="#ffc9c2" opacity=".55"/>`;
  } else if(mood==="shy"){
    face = `
    <path d="M110,96 Q112,52 150,48 Q190,44 194,92 Q196,128 176,148 Q150,168 126,150 Q108,134 110,96 Z" fill="#fffbf4"/>
    <path d="M110,96 Q106,50 150,44 Q196,42 194,92" fill="none" stroke="#5a4234" stroke-width="3"/>
    <path d="M108,88 Q104,44 150,42 Q198,40 196,90 Q198,58 170,52 Q136,46 118,62 Q108,72 108,88 Z" fill="#5a4234"/>
    ${ponytail()}
    <path d="M124,106 q10,-4 20,2" stroke="#5a4234" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M164,108 q10,-6 20,0" stroke="#5a4234" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M140,132 q10,6 20,0" stroke="#d97a6a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="118" cy="120" rx="10" ry="6" fill="#ff9d94" opacity=".6"/>
    <ellipse cx="190" cy="120" rx="10" ry="6" fill="#ff9d94" opacity=".6"/>
    <path d="M96,96 l-10,-4 M96,104 l-10,4 M212,96 l10,-4 M212,104 l10,4" stroke="#ffb3ac" stroke-width="3" stroke-linecap="round"/>`;
  } else {
    face = `
    <path d="M110,96 Q112,52 150,48 Q190,44 194,92 Q196,128 176,148 Q150,168 126,150 Q108,134 110,96 Z" fill="#fffbf4"/>
    <path d="M110,96 Q106,50 150,44 Q196,42 194,92" fill="none" stroke="#5a4234" stroke-width="3"/>
    <path d="M108,88 Q104,44 150,42 Q198,40 196,90 Q198,58 170,52 Q136,46 118,62 Q108,72 108,88 Z" fill="#5a4234"/>
    ${ponytail()}
    <path d="M124,108 l20,0" stroke="#5a4234" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M164,108 l20,0" stroke="#5a4234" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M140,134 q10,-6 20,0" stroke="#d97a6a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="120" cy="120" r="7" fill="#ffc9c2" opacity=".5"/>
    <circle cx="188" cy="120" r="7" fill="#ffc9c2" opacity=".5"/>`;
  }
  return `<svg viewBox="0 0 300 470" xmlns="http://www.w3.org/2000/svg">
  <g>${linweiBody()}${face}</g></svg>`;
};

/* 李洋：全身，蓝格子衬衫 */
window.VNART.liyang = function(mood){
  mood = mood || "smile";
  let face;
  if(mood==="smile"){
    face = `<path d="M120,98 q12,-8 22,0" stroke="#3d2f24" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M162,98 q12,-8 22,0" stroke="#3d2f24" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M134,126 q16,12 32,0" stroke="#3d2f24" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  } else {
    face = `<path d="M120,100 q12,-6 22,-2" stroke="#3d2f24" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M162,98 q12,-4 22,0" stroke="#3d2f24" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M136,128 q14,-6 28,0" stroke="#3d2f24" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 300 470" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path d="M146,88 Q150,80 154,88 L154,104 L146,104 Z" fill="#2c2420"/>
    <path d="M140,100 L160,100 L160,114 L140,114 Z" fill="#2c2420"/>
    <rect x="96" y="112" width="108" height="14" rx="7" fill="#2c2420"/>
    <path d="M100,470 Q96,400 112,358 L188,358 Q204,400 200,470 Z" fill="#4a5b6a"/>
    <path d="M150,358 L150,470" stroke="#3a4a58" stroke-width="3"/>
    <path d="M150,358 L150,392 M150,404 L150,436 M150,448 L150,470" stroke="#3a4a58" stroke-width="3"/>
    <path d="M112,358 Q96,368 92,392 L86,452 M188,358 Q204,368 208,392 L214,452" stroke="#4a5b6a" stroke-width="14" stroke-linecap="round" fill="none"/>
    <rect x="80" y="444" width="26" height="18" rx="8" fill="#2c2420"/>
    <rect x="194" y="444" width="26" height="18" rx="8" fill="#2c2420"/>
    <path d="M84,462 L106,462" stroke="#8a7d68" stroke-width="3"/>
    <path d="M194,462 L216,462" stroke="#8a7d68" stroke-width="3"/>
    <path d="M150,358 L138,392 Q150,402 162,392 Z" fill="#e8e2d4"/>
    <path d="M138,392 q12,8 24,0" stroke="#c9c2b2" stroke-width="2" fill="none"/>
    <path d="M96,196 Q98,146 150,142 Q202,146 204,196 L204,360 Q150,382 96,360 Z" fill="#7d9bb5"/>
    <path d="M96,208 h108 M92,236 h116 M96,264 h108 M92,292 h116 M96,320 h108 M92,348 h116" stroke="#5d7astro" stroke-width="0" />
    <path d="M96,208 h108 M92,236 h116 M96,264 h108 M92,292 h116 M96,320 h108 M92,348 h116" stroke="#6c8aa3" stroke-width="4" opacity=".5"/>
    <path d="M148,142 L138,360 M162,142 L172,360" stroke="#6c8aa3" stroke-width="4" opacity=".4"/>
    <path d="M150,142 L150,360" stroke="#5d7astro" stroke-width="0"/>
    <path d="M144,142 q6,10 12,0 l-6,26 Z" fill="#e8e2d4"/>
    <path d="M84,196 Q80,150 116,136 M216,196 Q220,150 184,136" stroke="#3d2f24" stroke-width="2" fill="none" opacity="0"/>
    <path d="M116,150 Q96,158 92,190 Q88,214 96,232" stroke="#3d2f24" stroke-width="2" fill="none" opacity="0"/>
    <path d="M110,96 Q112,54 150,50 Q188,46 190,94 Q192,128 174,146 Q150,162 128,146 Q108,132 110,96 Z" fill="#fffbf4"/>
    <path d="M110,96 Q106,52 150,46 Q194,44 190,94" fill="none" stroke="#3d2f24" stroke-width="3"/>
    <path d="M108,90 Q106,48 150,44 Q194,42 192,90 Q194,62 168,54 Q138,48 120,64 Q110,74 108,90 Z" fill="#2f241c"/>
    ${face}
  </g></svg>`;
};

/* ---------------- 背景与 CG ---------------- */
function frame(inner, extras){
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fb8cf"/><stop offset=".55" stop-color="#f5e3c8"/><stop offset="1" stop-color="#f3cf9e"/>
    </linearGradient>
    <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7d9a0"/><stop offset="1" stop-color="#eab971"/>
    </linearGradient>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5f6f9e"/><stop offset=".6" stop-color="#d9906e"/><stop offset="1" stop-color="#f3c07e"/>
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbf6ea"/><stop offset="1" stop-color="#efdfc4"/>
    </linearGradient>
    <radialGradient id="sun" cx=".5" cy=".42" r=".55">
      <stop offset="0" stop-color="#fff3cf" stop-opacity=".9"/><stop offset="1" stop-color="#fff3cf" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${inner}${extras||""}</svg>`;
}

function ginkoTree(x,y,s,autumn){
  const leaf = autumn ? "#e9b34a" : "#6fa06a";
  const leaf2 = autumn ? "#d99a38" : "#5c8f5a";
  let leaves="";
  for(let i=0;i<26;i++){
    const a=(i*137.5)%360, r=(i*13)%50+18;
    const lx=x+Math.cos(a*Math.PI/180)*r*s, ly=y+Math.sin(a*Math.PI/180)*r*s*0.85;
    leaves+=`<path d="M${lx},${ly} q${6*s},-${8*s} ${12*s},0 q${6*s},${8*s} 0,${12*s} q-${10*s},${4*s} -${12*s},-${12*s}Z" fill="${i%2?leaf:leaf2}" opacity=".92" transform="rotate(${(i*47)%360} ${lx} ${ly})"/>`;
  }
  return `<g>
    <path d="M${x},${y+70*s} L${x-4*s},${y+10*s} M${x},${y+10*s} L${x-22*s},${y-24*s} M${x},${y+10*s} L${x+20*s},${y-30*s} M${x-10*s},${y-8*s} L${x-30*s},${y-6*s} M${x+10*s},${y-10*s} L${x+30*s},${y-14*s}"
      stroke="#7a5b40" stroke-width="${9*s}" fill="none" stroke-linecap="round"/>
    ${leaves}</g>`;
}

function ginkoBg(autumn){
  return frame(`
    <rect width="1600" height="900" fill="url(#sky)"/>
    <circle cx="1180" cy="300" r="360" fill="url(#sun)"/>
    <path d="M0,640 Q400,600 800,640 T1600,640 L1600,900 L0,900 Z" fill="#b8cf9f"/>
    <path d="M0,700 L1600,690 L1600,900 L0,900 Z" fill="#c9b98f"/>
    <path d="M0,700 L1600,690" stroke="#a08f6a" stroke-width="4" opacity=".4"/>
    ${ginkoTree(240,470,4.2,autumn)}${ginkoTree(1350,480,3.6,autumn)}
    <g opacity=".85">${ginkoTree(760,520,1.6,autumn)}</g>`,
    autumn?`<g opacity=".8">${Array.from({length:14},(_,i)=>{const x=(i*97+60)%1560,y=690+((i*53)%190);return `<path d='M${x},${y} q5,-7 10,0 q5,7 0,10 q-9,3 -10,-10Z' fill='#e9b34a' transform='rotate(${(i*61)%360} ${x} ${y})'/>`}).join("")}</g>`:"");
}

window.VNART.bgs = {
  ginko: ginkoBg(false),
  ginko_autumn: ginkoBg(true),
  courty: frame(`
    <rect width="1600" height="900" fill="url(#warm)"/>
    <circle cx="520" cy="330" r="330" fill="url(#sun)"/>
    <rect y="600" width="1600" height="300" fill="#cbb896"/>
    <path d="M0,600 L1600,600 L1600,610 L0,610 Z" fill="#b3a17e"/>
    <rect x="980" y="180" width="620" height="420" fill="url(#wall)"/>
    <path d="M950,180 L1290,60 L1630,180 Z" fill="#a4593f"/>
    <path d="M990,190 L1290,90 L1590,190 Z" fill="#c46a4c"/>
    <rect x="1180" y="330" width="120" height="270" fill="#7a5b40"/>
    <rect x="1192" y="342" width="96" height="246" fill="#fdf1d7" opacity=".85"/>
    <path d="M1240,342 L1240,588 M1192,465 L1288,465" stroke="#7a5b40" stroke-width="8"/>
    <g>
      <path d="M180,640 L172,470 M180,470 L150,400 M180,470 L212,396 M166,430 L138,412 M196,428 L226,406" stroke="#6b4d38" stroke-width="14" fill="none" stroke-linecap="round"/>
      <g fill="#e5543f">
        <circle cx="150" cy="398" r="15"/><circle cx="212" cy="392" r="15"/><circle cx="132" cy="446" r="12"/>
        <circle cx="228" cy="440" r="12"/><circle cx="180" cy="376" r="14"/><circle cx="196" cy="452" r="11"/><circle cx="158" cy="452" r="11"/>
      </g>
      <g fill="#f0876f"><circle cx="150" cy="394" r="6"/><circle cx="212" cy="388" r="6"/><circle cx="180" cy="372" r="6"/></g>
    </g>
    <rect x="60" y="640" width="240" height="14" rx="7" fill="#8a6a4c"/>
    <rect x="84" y="654" width="10" height="60" fill="#8a6a4c"/><rect x="266" y="654" width="10" height="60" fill="#8a6a4c"/>
    <circle cx="90" cy="700" r="9" fill="#8a6a4c"/><circle cx="270" cy="700" r="9" fill="#8a6a4c"/>`),
  pomegranate: frame(`
    <rect width="1600" height="900" fill="url(#warm)"/>
    <circle cx="800" cy="280" r="300" fill="url(#sun)"/>
    <rect y="620" width="1600" height="280" fill="#c4b18b"/>
    <rect x="120" y="240" width="520" height="380" fill="url(#wall)"/>
    <path d="M90,240 L380,110 L670,240 Z" fill="#a4593f"/>
    <path d="M130,250 L380,140 L630,250 Z" fill="#c46a4c"/>
    <rect x="180" y="360" width="110" height="260" fill="#7a5b40"/>
    <rect x="192" y="372" width="86" height="236" fill="#fdf1d7" opacity=".8"/>
    <rect x="380" y="360" width="110" height="260" fill="#7a5b40"/>
    <rect x="392" y="372" width="86" height="236" fill="#fdf1d7" opacity=".8"/>
    <g>
      <path d="M1080,660 L1088,430 M1088,430 L1020,330 M1088,430 L1160,320 M1088,430 L1010,470 M1088,430 L1180,450" stroke="#6b4d38" stroke-width="16" fill="none" stroke-linecap="round"/>
      <g fill="#d8a84e">
        <circle cx="1020" cy="330" r="15"/><circle cx="1160" cy="320" r="15"/><circle cx="1010" cy="470" r="13"/>
        <circle cx="1180" cy="450" r="13"/><circle cx="1088" cy="360" r="14"/><circle cx="1050" cy="500" r="11"/><circle cx="1130" cy="505" r="11"/>
      </g>
      <g fill="#e5543f" opacity=".85">
        <circle cx="1020" cy="330" r="7"/><circle cx="1160" cy="320" r="7"/><circle cx="1010" cy="470" r="6"/>
        <circle cx="1180" cy="450" r="6"/><circle cx="1088" cy="360" r="7"/>
      </g>
    </g>
    <rect x="1000" y="656" width="200" height="12" rx="6" fill="#8a6a4c"/>`),
  class: frame(`
    <rect width="1600" height="900" fill="url(#wall)"/>
    <rect y="700" width="1600" height="200" fill="#c9a96e"/>
    <path d="M0,700 L1600,700 L1600,706 L0,706 Z" fill="#b3935c"/>
    <rect x="90" y="120" width="1420" height="430" fill="#2e4e3e"/>
    <rect x="110" y="140" width="1380" height="390" fill="#39614f"/>
    <g stroke="#fdf6e3" stroke-width="6" opacity=".9">
      <path d="M160,200 q10,-40 30,0 q-10,40 -30,0" fill="none"/>
      <path d="M240,200 q10,-40 30,0 q-10,40 -30,0" fill="none"/>
      <path d="M320,200 q10,-40 30,0 q-10,40 -30,0" fill="none"/>
    </g>
    <path d="M180,340 q60,-30 120,0 q40,20 80,0 q60,-30 120,0" stroke="#fdf6e3" stroke-width="5" fill="none" opacity=".8"/>
    <path d="M700,180 l40,40 M740,180 l-40,40" stroke="#fdf6e3" stroke-width="4" opacity=".35"/>
    <g font-family="serif" font-size="44" fill="#fdf6e3" opacity=".92">
      <text x="880" y="260">七夕</text><text x="980" y="260">：</text><text x="1030" y="260">农历</text>
      <text x="880" y="380">七月</text><text x="980" y="380">，</text><text x="1030" y="380">初七。</text>
    </g>
    <rect x="90" y="550" width="1420" height="26" fill="#e8d9b8"/>
    <g>
      <rect x="140" y="620" width="420" height="26" rx="6" fill="#a67c52"/>
      <rect x="170" y="646" width="16" height="110" fill="#8a6a4c"/><rect x="414" y="646" width="16" height="110" fill="#8a6a4c"/>
      <rect x="1120" y="620" width="420" height="26" rx="6" fill="#a67c52"/>
      <rect x="1150" y="646" width="16" height="110" fill="#8a6a4c"/><rect x="1394" y="646" width="16" height="110" fill="#8a6a4c"/>
    </g>
    <rect x="1460" y="80" width="140" height="480" fill="#fdf1d7" opacity=".55"/>
    <path d="M1460,80 L1600,80 L1600,560 L1460,560 Z" fill="none" stroke="#d8c9a8" stroke-width="8"/>`),
  sunset: frame(`
    <rect width="1600" height="900" fill="url(#dusk)"/>
    <circle cx="820" cy="430" r="150" fill="#ffedb8" opacity=".9"/>
    <circle cx="820" cy="430" r="260" fill="url(#sun)"/>
    <path d="M0,700 Q500,660 1000,700 T1600,690 L1600,900 L0,900 Z" fill="#5d7a5c"/>
    ${ginkoTree(300,520,3.4,true)}
    ${ginkoTree(1310,540,2.8,true)}
    <rect x="700" y="480" width="360" height="300" fill="#6b4d38" opacity=".85"/>
    <path d="M660,480 L880,360 L1100,480 Z" fill="#5a3f2e" opacity=".85"/>
    <rect x="760" y="560" width="90" height="220" fill="#fdf1d7" opacity=".85"/>
    <rect x="920" y="560" width="90" height="220" fill="#ffdf9e" opacity=".9"/>
    <g opacity=".75">${Array.from({length:10},(_,i)=>{const x=200+((i*127)%1200),y=720+((i*43)%150);return `<path d='M${x},${y} q5,-7 10,0 q5,7 0,10 q-9,3 -10,-10Z' fill='#e9b34a' transform='rotate(${(i*61)%360} ${x} ${y})'/>`}).join("")}</g>`)
};

/* ---------------- CG ---------------- */
window.VNART.cgs = {
  cg_desk: frame(`
    <rect width="1600" height="900" fill="url(#wall)"/>
    <rect x="0" y="0" width="1600" height="900" fill="#f7ecd8" opacity=".6"/>
    <rect x="140" y="300" width="1320" height="420" rx="10" fill="#d8b98a"/>
    <rect x="140" y="300" width="1320" height="30" fill="#c4a271"/>
    <rect x="360" y="220" width="360" height="120" rx="6" fill="#bfe0ef"/>
    <rect x="380" y="240" width="320" height="80" fill="#fdfb f4" opacity=".9"/>
    <rect x="380" y="240" width="320" height="80" fill="#fdfbf4" opacity=".9"/>
    <g stroke="#8a7d68" stroke-width="3" opacity=".7">
      <path d="M400,270 h240 M400,292 h200 M400,300 h260"/>
    </g>
    <rect x="900" y="200" width="240" height="180" rx="8" fill="#e8e2d4"/>
    <g stroke="#b3a78f" stroke-width="4" fill="none">
      <path d="M920,340 l60,-70 50,50 40,-40 60,60"/>
    </g>
    <circle cx="1040" cy="250" r="18" fill="#f3cf9e"/>
    <rect x="1240" y="330" width="120" height="90" rx="45" fill="#e5543f"/>
    <text x="1300" y="385" font-size="30" fill="#fff" text-anchor="middle" font-family="serif">大白兔</text>
    <g transform="rotate(-8 560 520)">
      <rect x="420" y="480" width="300" height="200" rx="8" fill="#fdfbf4"/>
      <g stroke="#8a7d68" stroke-width="3" opacity=".65">
        <path d="M450,520 h220 M450,548 h260 M450,576 h240 M450,604 h200"/>
      </g>
    </g>
    <g transform="rotate(6 1000 560)">
      <rect x="860" y="470" width="280" height="190" rx="8" fill="#fdfbf4"/>
      <g stroke="#5d7a9e" stroke-width="3" opacity=".8">
        <path d="M890,510 l40,-40 30,30 M890,560 h180 M890,588 h140"/>
      </g>
      <path d="M1050,520 l60,60 M1110,520 l-60,60" stroke="#d97a6a" stroke-width="5"/>
    </g>`),
  cg_candy: frame(`
    <rect width="1600" height="900" fill="url(#warm)"/>
    <circle cx="800" cy="420" r="380" fill="url(#sun)"/>
    <g transform="translate(800,430)">
      <g transform="rotate(-18)"><path d="M-260,0 q60,-70 130,0 q-70,70 -130,0Z" fill="#e5543f"/></g>
      <g transform="rotate(18)"><path d="M260,0 q-60,-70 -130,0 q70,70 130,0Z" fill="#e5543f"/></g>
      <rect x="-190" y="-110" width="380" height="220" rx="30" fill="#e5543f"/>
      <rect x="-190" y="-110" width="380" height="220" rx="30" fill="none" stroke="#c93f2c" stroke-width="6"/>
      <g transform="translate(0,-14)">
        <circle cx="-64" cy="0" r="34" fill="#fff" opacity=".95"/>
        <path d="M-30,-6 a36,36 0 1,1 0,14 q30,10 30,-14Z" fill="#fff" opacity=".95"/>
        <circle cx="-64" cy="0" r="34" fill="none" stroke="#c93f2c" stroke-width="4"/>
        <path d="M-30,-6 a36,36 0 1,1 0,14" fill="none" stroke="#c93f2c" stroke-width="4"/>
        <circle cx="-76" cy="-10" r="5" fill="#3a332a"/>
        <path d="M-84,6 q8,6 16,0" stroke="#3a332a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M-98,-2 q-14,-8 -12,-26 M-98,-2 q-16,4 -26,-6" stroke="#3a332a" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>
      <text x="0" y="82" font-size="52" fill="#fff" text-anchor="middle" font-family="serif" letter-spacing="10">大 白 兔</text>
      <text x="0" y="-58" font-size="26" fill="#ffe9d8" text-anchor="middle" font-family="serif" letter-spacing="6">奶糖</text>
    </g>
    <g fill="#e5543f" opacity=".9">
      <circle cx="240" cy="180" r="26"/><circle cx="1360" cy="200" r="22"/><circle cx="320" cy="720" r="20"/><circle cx="1300" cy="700" r="26"/>
    </g>`),
  cg_confess: frame(`
    <rect width="1600" height="900" fill="url(#wall)"/>
    <rect x="380" y="120" width="840" height="620" rx="14" fill="#bfe0ef"/>
    <rect x="410" y="150" width="780" height="560" rx="8" fill="#fdfbf4"/>
    <rect x="410" y="150" width="780" height="560" rx="8" fill="none" stroke="#e6dcc9" stroke-width="3"/>
    <g fill="#8a7d68" opacity=".8" font-family="serif">
      <text x="470" y="250" font-size="40">李洋：</text>
      <text x="470" y="330" font-size="34">你写的诗，我看了很多遍。李洋，</text>
      <text x="470" y="400" font-size="34">我也很喜欢你。从你第一次朗诵</text>
      <text x="470" y="470" font-size="34">《再别康桥》的时候，我就开始</text>
      <text x="470" y="540" font-size="34">喜欢你了。</text>
      <text x="880" y="640" font-size="34">—— 林微  八月十五</text>
    </g>
    <g transform="translate(1080,220) rotate(12)">
      <circle cx="0" cy="0" r="34" fill="#e9b34a"/>
      <path d="M0,-34 q10,-24 34,-18 q6,24 -18,34 q-16,6 -16,-16Z" fill="#a8c48a"/>
      <path d="M0,-34 q-10,-24 -34,-18 q-6,24 18,34 q16,6 16,-16Z" fill="#8fb871"/>
    </g>
    <circle cx="470" cy="660" r="26" fill="#e5543f"/>
    <path d="M470,634 q4,-14 18,-12" stroke="#8fb871" stroke-width="6" fill="none"/>
    <g opacity=".55">
      <circle cx="1150" cy="620" r="4" fill="#ff9d94"/><circle cx="1120" cy="640" r="3" fill="#ff9d94"/><circle cx="1170" cy="650" r="3" fill="#ff9d94"/>
    </g>`),
  cg_tree: frame(`
    <rect width="1600" height="900" fill="url(#dusk)"/>
    <circle cx="800" cy="300" r="240" fill="#ffedb8" opacity=".85"/>
    <path d="M0,720 Q500,680 1000,720 T1600,710 L1600,900 L0,900 Z" fill="#5d7a5c"/>
    ${ginkoTree(220,540,3, true)}
    ${ginkoTree(1400,560,2.6,true)}
    <g transform="translate(800,520)">
      <path d="M-14,-86 Q0,-96 14,-86 L14,-30 L-14,-30 Z" fill="#6b4d38"/>
      <path d="M-70,-30 L70,-30 L54,240 L-54,240 Z" fill="#3f5464"/>
      <path d="M0,-30 L0,240" stroke="#324453" stroke-width="4"/>
      <path d="M-70,-30 L-84,60 L-70,64 L-56,-6 M70,-30 L84,60 L70,64 L56,-6" fill="#3f5464"/>
      <circle cx="-96" cy="150" r="12" fill="#e8e2d4"/>
      <circle cx="96" cy="150" r="12" fill="#e8e2d4"/>
      <rect x="-58" y="-170" width="116" height="150" rx="58" fill="#fffbf4"/>
      <circle cx="-20" cy="-100" r="6" fill="#3a332a"/>
      <circle cx="20" cy="-100" r="6" fill="#3a332a"/>
      <path d="M-10,-78 q10,8 20,0" stroke="#3a332a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M-58,-60 q-24,10 -20,40 M58,-60 q24,10 20,40" stroke="#fffbf4" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M0,-120 l0,-16 M-10,-112 l-6,-12 M10,-112 l6,-12" stroke="#e5543f" stroke-width="4" stroke-linecap="round"/>
      <path d="M-96,150 L-70,-40 M96,150 L70,-40" stroke="#e8e2d4" stroke-width="10" opacity=".4"/>
    </g>
    <g opacity=".85">${Array.from({length:12},(_,i)=>{const x=300+((i*151)%1000),y=760+((i*37)%110);return `<path d='M${x},${y} q5,-7 10,0 q5,7 0,10 q-9,3 -10,-10Z' fill='#e9b34a' transform='rotate(${(i*61)%360} ${x} ${y})'/>`}).join("")}</g>
    <rect x="640" y="780" width="320" height="18" rx="9" fill="#4a3a2c" opacity=".8"/>`)
};

/* 预渲染进内存：位图资产优先，SVG 兜底 */
window.VNART.build = function(){
  var A = window.VNASSETS || {};
  var svg = function(svgStr){ return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgStr); };
  var b = {};
  /* 背景：故事用到 courty/ginko/class/sunset/pomegranate，另加 ginko_autumn 作标题屏 */
  for(var k in window.VNART.bgs){
    b["bg_"+k] = A["bg_"+k] || svg(window.VNART.bgs[k]);
  }
  /* CG：cg_candy / cg_confess / cg_tree 有位图；cg_desk 仅 SVG */
  for(var c in window.VNART.cgs){
    b[c] = A[c] || svg(window.VNART.cgs[c]);
  }
  /* 立绘 */
  var chars = { linwei:["smile","shy","sad"], liyang:["smile","shy"] };
  for(var who in chars){
    chars[who].forEach(function(mood){
      var key = "ch_"+who+"_"+mood;
      b[key] = A[key] || svg(window.VNART[who](mood));
    });
  }
  return b;
};
