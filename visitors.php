<?php
declare(strict_types=1);
require __DIR__ . '/visitors/config.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name(VIS_SESSION_NAME);
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
}

$unlocked = !empty($_SESSION['visitors_unlocked']);

// server-issued CSRF token for the login form (or reuse existing)
if (empty($_SESSION['_csrf'])) $_SESSION['_csrf'] = bin2hex(random_bytes(32));
$csrf = $_SESSION['_csrf'];

// logout via direct POST (form submit, non-JS fallback)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'logout') {
    $_SESSION = [];
    session_destroy();
    header('Location: visitors.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Visitors · argabiyusyrf</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@1,9..144,300;1,9..144,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
<style>
/* ── reset & tokens ──────────────────────────────────────── */
:root {
  --paper:#0b0f19; --paper-2:#141b2d; --ink:#f1f5f9; --ink-2:#cbd5e1;
  --muted:#64748b; --line:rgba(241,245,249,.12);
  --accent:#38bdf8; --accent-2:#a855f7; --accent-dim:rgba(56,189,248,.12);
  --green:#22c55e; --red:#ef4444; --yellow:#eab308;
  --font-d:'Space Grotesk',system-ui,sans-serif;
  --font-s:'Fraunces',Georgia,serif;
  --font-m:'JetBrains Mono',monospace;
  --radius:12px; --radius-sm:8px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:var(--paper);color:var(--ink);font-family:var(--font-d);-webkit-font-smoothing:antialiased;line-height:1.5}

/* ── gate ────────────────────────────────────────────────── */
.gate{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}
.gate-card{width:min(92vw,380px);text-align:center;padding:2.5rem 2rem;background:var(--paper-2);border:1px solid var(--line);border-radius:var(--radius)}
.gate-card h1{font-family:var(--font-s);font-weight:300;font-size:1.6rem;letter-spacing:.02em;margin-bottom:.25rem}
.gate-card p{color:var(--muted);font-size:.85rem;margin-bottom:1.6rem}
.gate-card input{width:100%;padding:.75rem 1rem;font-size:.95rem;font-family:var(--font-d);background:var(--paper);border:1px solid var(--line);border-radius:var(--radius-sm);color:var(--ink);outline:none}
.gate-card input:focus{border-color:var(--accent)}
.gate-card button{margin-top:.75rem;width:100%;padding:.75rem;font-size:.9rem;font-weight:600;font-family:var(--font-d);letter-spacing:.04em;cursor:pointer;background:var(--accent);color:var(--paper);border:0;border-radius:var(--radius-sm);transition:opacity .2s}
.gate-card button:hover{opacity:.85}
.gate-err{color:var(--red);font-size:.8rem;margin-top:.6rem;min-height:1.1em}

/* ── shell ───────────────────────────────────────────────── */
.shell{display:none;min-height:100vh;padding:0 0 4rem}
.shell.visible{display:block}
.topbar{position:sticky;top:0;z-index:100;background:rgba(11,15,25,.85);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line);padding:.6rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
.topbar h1{font-family:var(--font-s);font-weight:300;font-size:1.1rem;letter-spacing:.02em;white-space:nowrap}
.topbar-right{display:flex;align-items:center;gap:.75rem}
.topbar-right button{background:none;border:1px solid var(--line);color:var(--muted);font:inherit;font-size:.72rem;font-family:var(--font-m);letter-spacing:.06em;text-transform:uppercase;padding:.3rem .65rem;border-radius:var(--radius-sm);cursor:pointer;transition:border-color .2s,color .2s}
.topbar-right button:hover{border-color:var(--accent);color:var(--ink)}
.wrap{max-width:960px;margin:0 auto;padding:1.5rem 1.25rem 0}

/* ── kpi cards ───────────────────────────────────────────── */
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.75rem;margin-bottom:1.5rem}
.kpi{background:var(--paper-2);border:1px solid var(--line);border-radius:var(--radius);padding:1rem 1.1rem;position:relative;overflow:hidden}
.kpi::after{content:'';position:absolute;top:0;left:0;width:100%;height:2px}
.kpi:nth-child(1)::after{background:var(--accent)}
.kpi:nth-child(2)::after{background:var(--accent-2)}
.kpi:nth-child(3)::after{background:var(--green)}
.kpi:nth-child(4)::after{background:var(--yellow)}
.kpi .n{font-size:1.65rem;font-weight:600;line-height:1.1;font-variant-numeric:tabular-nums}
.kpi .l{color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;margin-top:.15rem;font-family:var(--font-m)}
.kpi .sub{font-size:.72rem;margin-top:.3rem}
.kpi .sub .pos{color:var(--green)}
.kpi .sub .neg{color:var(--red)}
.kpi .sub .dim{color:var(--muted)}

/* ── sections ────────────────────────────────────────────── */
.section{margin-bottom:1.5rem}
.section-head{display:flex;align-items:baseline;justify-content:space-between;gap:.5rem;margin-bottom:.6rem}
.section-head h2{font-family:var(--font-s);font-weight:300;font-size:1rem;letter-spacing:.015em}
.section-head .meta{color:var(--muted);font-size:.7rem;font-family:var(--font-m)}
.card{background:var(--paper-2);border:1px solid var(--line);border-radius:var(--radius);padding:1rem 1.2rem}

/* ── chart ───────────────────────────────────────────────── */
.chart-wrap{position:relative;height:180px;width:100%}
.chart-wrap canvas{width:100%!important;height:100%!important}
.chart-legend{display:flex;gap:1rem;margin-top:.5rem;font-size:.7rem;color:var(--muted);font-family:var(--font-m)}
.chart-legend span::before{content:'';display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px;vertical-align:middle}
.chart-legend .lv::before{background:var(--accent)}
.chart-legend .lu::before{background:var(--accent-2)}

/* ── hours grid ──────────────────────────────────────────── */
.hours-grid{display:grid;grid-template-columns:repeat(24,1fr);gap:3px}
.hours-grid .hcell{aspect-ratio:1;border-radius:3px;position:relative;transition:transform .15s}
.hours-grid .hcell:hover{transform:scale(1.25);z-index:1}
.hours-grid .hcell .tip{display:none;position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);background:var(--paper);border:1px solid var(--line);color:var(--ink);font-size:.6rem;font-family:var(--font-m);padding:2px 6px;border-radius:4px;white-space:nowrap;z-index:10;pointer-events:none}
.hours-grid .hcell:hover .tip{display:block}
.hours-labels{display:grid;grid-template-columns:repeat(24,1fr);gap:3px;margin-top:3px}
.hours-labels span{text-align:center;font-size:.55rem;color:var(--muted);font-family:var(--font-m)}

/* ── tables ──────────────────────────────────────────────── */
table{width:100%;border-collapse:collapse;font-size:.82rem}
th{text-align:left;font-family:var(--font-m);font-size:.65rem;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);padding:.4rem .5rem;border-bottom:1px solid var(--line)}
td{padding:.4rem .5rem;border-bottom:1px solid var(--line);vertical-align:middle}
td.mono{font-family:var(--font-m);color:var(--ink-2);font-size:.78rem}
td.dim{color:var(--muted)}
.pbar{height:4px;background:var(--line);border-radius:2px;overflow:hidden;min-width:50px}
.pbar-fill{height:100%;background:var(--accent);border-radius:2px;transition:width .3s}

/* ── two-col ─────────────────────────────────────────────── */
.two{display:grid;gap:1rem}
@media(min-width:700px){.two{grid-template-columns:1fr 1fr}}

/* ── loading / empty ─────────────────────────────────────── */
.loading{text-align:center;padding:3rem;color:var(--muted);font-size:.85rem}
.empty{text-align:center;padding:2rem;color:var(--muted);font-size:.8rem}
.spinner{display:inline-block;width:20px;height:20px;border:2px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;margin-bottom:.5rem}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── responsive ──────────────────────────────────────────── */
@media(max-width:640px){
  .kpis{grid-template-columns:1fr 1fr}
  .chart-wrap{height:140px}
  .hours-grid{gap:2px}
  .wrap{padding:1rem .75rem 0}
  .topbar h1{font-size:.95rem}
}
</style>
</head>
<body>

<?php if (!$unlocked): ?>
<div class="gate">
  <div class="gate-card">
    <h1 data-i18n="g-title">Visitors</h1>
    <p data-i18n="g-sub">masukkan kunci panel</p>
    <input id="code" type="password" placeholder="kode panel" autocomplete="off" />
    <button id="loginBtn" type="button" data-i18n="g-btn">Buka</button>
    <p class="gate-err" id="gateErr"></p>
  </div>
</div>
<script>
var CSRF=<?= json_encode($csrf) ?>;
(function(){
  var input=document.getElementById('code'),btn=document.getElementById('loginBtn'),err=document.getElementById('gateErr');
  input.focus();
  input.addEventListener('keydown',function(e){if(e.key==='Enter')login()});
  btn.addEventListener('click',login);
  function login(){
    err.textContent='';
    var code=input.value;if(!code){err.textContent='Masukkan kode.';return;}
    btn.disabled=true;
    fetch('visitors/api.php?action=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code,_csrf:CSRF})})
    .then(function(r){return r.json()})
    .then(function(d){
      if(d.ok){window.location.reload();}else{err.textContent='Kode salah.';}
    })
    .catch(function(){err.textContent='Terjadi kesalahan.';})
    .finally(function(){btn.disabled=false;});
  }
})();
</script>
<?php else: ?>
<div class="shell" id="app">
  <div class="topbar">
    <h1 data-i18n="t-title">Visitors</h1>
    <div class="topbar-right">
      <span id="lastUpdated" style="font-size:.65rem;color:var(--muted);font-family:var(--font-m)"></span>
      <button id="langBtn">EN</button>
      <button id="refreshBtn" data-i18n="t-refresh">refresh</button>
      <form method="post" action="visitors.php" style="display:inline"><input type="hidden" name="action" value="logout" />
        <button type="submit" class="logout-btn" data-i18n="t-logout">keluar</button>
      </form>
    </div>
  </div>

  <div class="wrap">
    <div class="kpis" id="kpis"><div class="loading"><div class="spinner"></div><br/>loading...</div></div>

    <div class="section">
      <div class="section-head">
        <h2 data-i18n="s-trend">trend · 30 hari</h2>
        <span class="meta" id="trendMeta"></span>
      </div>
      <div class="card">
        <div class="chart-wrap"><canvas id="trendChart"></canvas></div>
        <div class="chart-legend"><span class="lv">visits</span><span class="lu">uniques</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h2 data-i18n="s-hours">jam aktif</h2></div>
      <div class="card">
        <div class="hours-grid" id="hoursGrid"><div class="loading"><div class="spinner"></div></div></div>
        <div class="hours-labels" id="hoursLabels"></div>
      </div>
    </div>

    <div class="two">
      <div class="section">
        <div class="section-head"><h2 data-i18n="s-pages">halaman teratas</h2></div>
        <div class="card"><div id="pagesTable"><div class="loading"><div class="spinner"></div></div></div></div>
      </div>
      <div class="section">
        <div class="section-head"><h2 data-i18n="s-refs">referrer utama</h2></div>
        <div class="card"><div id="refsTable"><div class="loading"><div class="spinner"></div></div></div></div>
      </div>
    </div>

    <div class="two">
      <div class="section">
        <div class="section-head"><h2 data-i18n="s-devices">perangkat</h2></div>
        <div class="card"><div id="devicesTable"><div class="loading"><div class="spinner"></div></div></div></div>
      </div>
      <div class="section">
        <div class="section-head"><h2 data-i18n="s-langs">bahasa</h2></div>
        <div class="card"><div id="langsTable"><div class="loading"><div class="spinner"></div></div></div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h2 data-i18n="s-recent">kunjungan terakhir</h2></div>
      <div class="card" style="overflow-x:auto"><div id="recentTable"><div class="loading"><div class="spinner"></div></div></div></div>
    </div>
  </div>
</div>
<script>
(function(){
/* ── i18n ──────────────────────────────────────────────── */
var D={
  en:{
    'g-title':'Visitors','g-sub':'enter panel passcode','g-btn':'Unlock',
    't-title':'Visitors','t-refresh':'refresh','t-logout':'sign out',
    's-trend':'trend · 30 days','s-hours':'active hours','s-pages':'top pages',
    's-refs':'top referrers','s-devices':'devices','s-langs':'languages',
    's-recent':'recent visits',
    'k-today':'today','k-7d':'7 days','k-30d':'30 days','k-all':'all time',
    'h-page':'page','h-visits':'visits','h-uniq':'uniques','h-ref':'referrer','h-src':'source',
    'h-screen':'screen','h-lang':'lang','h-time':'time','h-device':'device','h-browser':'browser',
    'h-name':'name','h-count':'count','h-pct':'%'
  },
  id:{
    'g-title':'Pengunjung','g-sub':'masukkan kunci panel','g-btn':'Buka',
    't-title':'Pengunjung','t-refresh':'refresh','t-logout':'keluar',
    's-trend':'tren · 30 hari','s-hours':'jam aktif','s-pages':'halaman teratas',
    's-refs':'referrer utama','s-devices':'perangkat','s-langs':'bahasa',
    's-recent':'kunjungan terakhir',
    'k-today':'hari ini','k-7d':'7 hari','k-30d':'30 hari','k-all':'semua',
    'h-page':'halaman','h-visits':'kunjungan','h-uniq':'unik','h-ref':'asal','h-src':'sumber',
    'h-screen':'layar','h-lang':'bahasa','h-time':'waktu','h-device':'perangkat','h-browser':'browser',
    'h-name':'nama','h-count':'jumlah','h-pct':'%'
  }
};
var lang=localStorage.getItem('vis.lang')||'id';
function t(k){return(D[lang]&&D[lang][k])||(D.en[k])||k;}
function applyLang(){document.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t(el.getAttribute('data-i18n'));});}
applyLang();
document.getElementById('langBtn').textContent=lang==='id'?'EN':'ID';
document.getElementById('langBtn').addEventListener('click',function(){
  lang=lang==='id'?'en':'id';localStorage.setItem('vis.lang',lang);
  document.getElementById('langBtn').textContent=lang==='id'?'EN':'ID';
  applyLang();if(lastData)render(lastData);
});
document.getElementById('refreshBtn').addEventListener('click',function(){loadStats()});

/* ── API helpers ────────────────────────────────────────── */
function fmt(n){return n==null?'0':n.toLocaleString();}

/* ── chart renderer (pure canvas, DPR-aware) ─────────────── */
function drawTrend(canvas,visits,uniques,labels){
  var dpr=window.devicePixelRatio||1;
  var rect=canvas.parentElement.getBoundingClientRect();
  var W=rect.width,H=rect.height;
  canvas.width=W*dpr;canvas.height=H*dpr;
  var ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);

  var pad={t:12,r:8,b:22,l:36};
  var cW=W-pad.l-pad.r,cH=H-pad.t-pad.b;
  var maxV=Math.max.apply(null,visits.concat([1]));

  // grid lines
  ctx.strokeStyle='rgba(241,245,249,0.06)';ctx.lineWidth=1;
  for(var i=0;i<=4;i++){
    var y=pad.t+cH*(1-i/4);
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+cW,y);ctx.stroke();
    ctx.fillStyle='rgba(100,116,139,0.6)';ctx.font='9px JetBrains Mono,monospace';
    ctx.textAlign='right';ctx.fillText(fmt(Math.round(maxV*i/4)),pad.l-6,y+3);
  }

  // x labels
  var n=labels.length;
  ctx.fillStyle='rgba(100,116,139,0.5)';ctx.font='8px JetBrains Mono,monospace';ctx.textAlign='center';
  for(var i=0;i<n;i+=Math.max(1,Math.floor(n/7))){
    var x=pad.l+cW*(i/(n-1));
    ctx.fillText(labels[i].slice(5),x,H-4);
  }

  function line(data,color,filled){
    ctx.beginPath();
    for(var i=0;i<data.length;i++){
      var x=pad.l+cW*(i/(n-1));
      var y=pad.t+cH*(1-data[i]/maxV);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    if(filled){
      var lastX=pad.l+cW*((data.length-1)/(n-1));
      ctx.lineTo(lastX,pad.t+cH);ctx.lineTo(pad.l,pad.t+cH);ctx.closePath();
      ctx.fillStyle=color.replace('1)','0.08)');ctx.fill();
    }
  }
  line(visits,'rgba(56,189,248,1)',true);
  line(uniques,'rgba(168,85,247,0.25)');

  // lines
  line(visits,'rgba(56,189,248,1)');
  line(uniques,'rgba(168,85,247,1)');

  // points on last index
  [ [visits,'rgba(56,189,248,1)'], [uniques,'rgba(168,85,247,1)'] ].forEach(function(pair){
    var d=pair[0],color=pair[1];
    var x=pad.l+cW*((d.length-1)/(n-1));
    var y=pad.t+cH*(1-d[d.length-1]/maxV);
    ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  });
}
function trendData(data){
  var vis=[],uni=[],labels=[];
  var map={};
  data.trend.forEach(function(r){map[r.d]=r;});
  var cursor=new Date();cursor.setHours(0,0,0,0);
  for(var i=29;i>=0;i--){
    var d=new Date(cursor.getTime()-i*86400000);
    var key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    var r=map[key];
    labels.push(key);vis.push(r?r.v:0);uni.push(r?r.u:0);
  }
  return {visits:vis,uniques:uni,labels:labels};
}

/* ── table helpers ──────────────────────────────────────── */
function pctRow(name,count,walk,span){
  var pct=walk?Math.round(100*count/walk):0;
  var html='<tr>'+
    '<td>'+escapeHtml(name)+'</td>'+
    '<td style="width:42%"><div class="pbar"><div class="pbar-fill" style="width:'+pct+'%"></div></div></td>'+
    '<td class="dim">'+fmt(count)+'</td>'+
    '<td class="dim">'+pct+'%</td>'+
    '</tr>';
  return html;
}
function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function table(headers,rowsHtml){
  return '<table><thead><tr>'+headers.map(function(h){return'<th>'+h+'</th>';}).join('')+'</tr></thead><tbody>'+rowsHtml+'</tbody></table>';
}

/* ── render ─────────────────────────────────────────────── */
var lastData=null;
function render(data){
  lastData=data;
  var ov=data.overview;

  // KPIs
  var kpiCards=[
    {n:ov.visitsToday,l:t('k-today'),sub:fmt(ov.uniquesToday)+' uniques'},
    {n:ov.visitsW7,l:t('k-7d'),sub:fmt(ov.uniquesW7)+' uniques'},
    {n:ov.visitsM30,l:t('k-30d'),sub:fmt(ov.uniquesM30)+' uniques'},
    {n:ov.visitsAll,l:t('k-all'),sub:fmt(ov.uniquesAll)+' uniques'}
  ];
  document.getElementById('kpis').innerHTML=kpiCards.map(function(k){
    return '<div class="kpi"><div class="n">'+fmt(k.n)+'</div><div class="l">'+k.l+'</div><div class="sub dim">'+k.sub+'</div></div>';
  }).join('');

  // trend chart
  var td=trendData(data);
  var reportW=O('reportWindow');reportW=Math.max(14,Math.min(30,reportW));
  var slice=Math.min(reportW,td.labels.length);
  drawTrend(document.getElementById('trendChart'),
    td.visits.slice(-slice),td.uniques.slice(-slice),td.labels.slice(-slice));
  document.getElementById('trendMeta').textContent=td.labels[td.labels.length-slice]+' → '+td.labels[td.labels.length-1];

  // hours grid
  var hours=data.hours,maxH=Math.max.apply(null,hours.concat([1]));
  var cell=document.getElementById('hoursGrid');
  cell.innerHTML=hours.map(function(n,h){
    var a=n/maxH;
    var color=a===0?'rgba(241,245,249,0.04)':
      a<0.25?'rgba(56,189,248,0.22)':
      a<0.5?'rgba(56,189,248,0.45)':
      a<0.75?'rgba(56,189,248,0.7)':'rgba(56,189,248,1)';
    return '<div class="hcell" style="background:'+color+'" title="'+h+':00 — '+n+'"><span class="tip">'+h+':00 — '+n+'</span></div>';
  }).join('');
  document.getElementById('hoursLabels').innerHTML=hours.map(function(_,h){
    return '<span>'+h+'</span>';
  }).join('');

  // pages
  var walk=data.pages.reduce(function(a,p){return a+p.v;},0);
  document.getElementById('pagesTable').innerHTML=table(
    [t('h-page'),'','',t('h-visits'),t('h-pct')],
    data.pages.map(function(p){return pctRow(p.path,parseInt(p.v),walk);}).join('')
  ) || '<p class="empty">—</p>';

  // referrers
  var rwalk=data.referrers.reduce(function(a,r){return a+r.n;},0);
  document.getElementById('refsTable').innerHTML=data.referrers.length
    ? table([t('h-ref'),'','',t('h-count'),t('h-pct')],
      data.referrers.map(function(r){return pctRow(r.host,r.n,rwalk);}).join(''))
    : '<p class="empty">—</p>';

  // devices
  var dwalk=data.devices.reduce(function(a,d){return a+d.n;},0);
  document.getElementById('devicesTable').innerHTML=data.devices.length
    ? table([t('h-device'),'','',t('h-count'),t('h-pct')],
      data.devices.map(function(d){return pctRow(d.name||'unknown',d.n,dwalk);}).join(''))
    : '<p class="empty">—</p>';

  // langs
  var lwalk=data.langs.reduce(function(a,l){return a+l.n;},0);
  document.getElementById('langsTable').innerHTML=data.langs.length
    ? table([t('h-name'),'','',t('h-count'),t('h-pct')],
      data.langs.map(function(l){return pctRow(l.name,l.n,lwalk);}).join(''))
    : '<p class="empty">—</p>';

  // recent
  document.getElementById('recentTable').innerHTML=table(
    [t('h-time'),t('h-page'),t('h-src'),t('h-screen'),t('h-device')],
    data.recent.map(function(r){
      var d=new Date(r.ts*1000);
      var time=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
      return '<tr>'+
        '<td class="mono">'+time+'</td>'+
        '<td class="mono">'+escapeHtml(r.path)+'</td>'+
        '<td class="dim">'+escapeHtml(r.ref||'—')+'</td>'+
        '<td class="dim">'+escapeHtml(r.screen||'—')+'</td>'+
        '<td class="dim">'+escapeHtml(r.device==='mobile'?'📱':'💻')+'</td>'+
        '</tr>';
    }).join('')
  );

  document.getElementById('lastUpdated').textContent=new Date(data.generated_at).toLocaleTimeString();
}

/* ── load & auth flow ───────────────────────────────────── */
var _csrf=null;
function O(k){try{return parseInt(localStorage.getItem(k))}catch(e){return null}}
function loadStats(){
  document.getElementById('refreshBtn').textContent='…';
  fetch('visitors/api.php?action=stats')
  .then(function(r){if(r.status===401)throw{code:401};return r.json();})
  .then(render)
  .catch(function(e){
    if(e&&e.code===401){document.getElementById('app').classList.remove('visible');location.reload();}
    else{console.error(e);}
  })
  .finally(function(){document.getElementById('refreshBtn').textContent=t('t-refresh');});
}

document.getElementById('app').classList.add('visible');
loadStats();
setInterval(loadStats, 60000);
})();
</script>
<?php endif; ?>
</body>
</html>