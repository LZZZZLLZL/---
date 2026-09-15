
/* Tabler Icons (MIT) 内嵌图标库 - https://github.com/tabler/tabler-icons */
window.VNICON = (function(){
  var I = {
    'clover': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <path d="M12 10l-3.397 -3.44a2.104 2.104 0 0 1 0 -2.95a2.04 2.04 0 0 1 2.912 0l.485 .39l.485 -.39a2.04 2.04 0 0 1 2.912 0a2.104 2.104 0 0 1 0 2.95l-3.397 3.44z" />   <path d="M12 14l-3.397 3.44a2.104 2.104 0 0 0 0 2.95a2.04 2.04 0 0 0 2.912 0l.485 -.39l.485 .39a2.04 2.04 0 0 0 2.912 0a2.104 2.104 0 0 0 0 -2.95l-3.397 -3.44z" />   <path d="M14 12l3.44 -3.397a2.104 2.104 0 0 1 2.95 0a2.04 2.04 0 0 1 0 2.912l-.39 .485l.39 .485a2.04 2.04 0 0 1 0 2.912a2.104 2.104 0 0 1 -2.95 0l-3.44 -3.397z" />   <path d="M10 12l-3.44 -3.397a2.104 2.104 0 0 0 -2.95 0a2.04 2.04 0 0 0 0 2.912l.39 .485l-.39 .485a2.04 2.04 0 0 0 0 2.912a2.104 2.104 0 0 0 2.95 0l3.44 -3.397z" />',
    'sunrise': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <path d="M3 17h1m16 0h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7m-9.7 5.7a4 4 0 0 1 8 0" />   <line x1="3" y1="21" x2="21" y2="21" />   <path d="M12 9v-6l3 3m-6 0l3 -3" />',
    'mail-heart': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <rect x="3" y="5" width="18" height="14" rx="2" />   <polyline points="3 7 12 13 21 7" />',
    'backpack': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <path d="M5 18v-6a6 6 0 0 1 6 -6h2a6 6 0 0 1 6 6v6a3 3 0 0 1 -3 3h-8a3 3 0 0 1 -3 -3z" />   <path d="M10 6v-1a2 2 0 1 1 4 0v1" />   <path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" />   <path d="M11 10h2" />',
    'feather': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <path d="M4 20l10 -10m0 -5v5h5m-9 -1v5h5m-9 -1v5h5m-5 -5l4 -4l4 -4" />   <path d="M19 10c.638 -.636 1 -1.515 1 -2.486a3.515 3.515 0 0 0 -3.517 -3.514c-.97 0 -1.847 .367 -2.483 1m-3 13l4 -4l4 -4" />',
    'heart': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />',
    'device-floppy': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />   <circle cx="12" cy="14" r="2" />   <polyline points="14 4 14 8 8 8 8 4" />',
    'lock': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <rect x="5" y="11" width="14" height="10" rx="2" />   <circle cx="12" cy="16" r="1" />   <path d="M8 11v-4a4 4 0 0 1 8 0v4" />',
    'caret-right': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <path d="M10 18l6 -6l-6 -6v12" />',
    'caret-down': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <path d="M6 10l6 6l6 -6h-12" />',
    'sparkles': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <polyline points="6 21 21 6 18 3 3 18 6 21" />   <line x1="15" y1="6" x2="18" y2="9" />   <path d="M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />   <path d="M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />',
    'history': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <polyline points="12 8 12 12 14 14" />   <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />',
    'door-exit': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <path d="M13 12v.01" />   <path d="M3 21h18" />   <path d="M5 21v-16a2 2 0 0 1 2 -2h7.5m2.5 10.5v7.5" />   <path d="M14 7h7m-3 -3l3 3l-3 3" />',
    'home': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>   <polyline points="5 12 3 12 12 3 21 12 19 12" />   <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />   <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />',
  };
  return {
    icon: function(name, style){
      var s = style ? ' style="'+style+'"' : '';
      return '<svg class="vn-ic"'+s+' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + I[name] + '</svg>';
    }
  };
})();

