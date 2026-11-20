/* ============ TOOLKIT · 24 local tools ============ */
const $=s=>document.querySelector(s);
const grid=$('#grid'),catsEl=$('#cats'),modal=$('#modal'),mTitle=$('#mTitle'),mIc=$('#mIc'),mBody=$('#mBody');
let tools=[];

/* ---------- helpers ---------- */
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1600)}
function copy(text){navigator.clipboard.writeText(text).then(()=>toast('已复制到剪贴板 ✓')).catch(()=>toast('复制失败，请手动选择'))}
function copyBtn(getter){return `<button class="btn primary" onclick="copy((${getter})())">复制结果</button>`}
// two-area tool: input + output
function ioHTML(opt={}){
  return `
  <textarea id="in" placeholder="${opt.ph||'在这里输入内容…'}"></textarea>
  <div class="row" id="actions"></div>
  <div class="out">
    <label class="lb">结果</label>
    <textarea id="out" readonly></textarea>
    <div class="row"><button class="btn sm" onclick="copy($('#out').value)">复制结果</button></div>
  </div>`;
}
function bindInput(){const i=$('#in'),o=$('#out');return {i,o}}

/* ---------- registry ---------- */
function add(t){tools.push(t)}

// 1 JSON format
add({id:'json',ic:'{ }',name:'JSON 格式化',cat:'开发',desc:'美化 / 压缩 / 校验 JSON，缩进清晰易读。',
 run(){mBody.innerHTML=ioHTML({ph:'粘贴 JSON，例如 {"name":"zqf","ok":true}'});
  $('#actions').innerHTML=`<div class="seg"><button class="on" data-m="format">格式化</button><button data-m="min">压缩</button></div><button class="btn primary" id="go">处理</button><button class="btn" id="val">校验</button>`;
  let mode='format';
  mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{mBody.querySelectorAll('.seg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mode=b.dataset.m});
  $('#go').onclick=()=>{try{const obj=JSON.parse($('#in').value);$('#out').value=mode==='format'?JSON.stringify(obj,null,2):JSON.stringify(obj);toast('处理成功')}catch(e){$('#out').value='❌ JSON 无效：'+e.message}};
  $('#val').onclick=()=>{try{JSON.parse($('#in').value);toast('✓ 合法 JSON')}catch(e){toast('❌ 无效 JSON')}};
 }});

// 2 Base64
add({id:'base64',ic:'🔤',name:'Base64 编解码',cat:'开发',desc:'文本与 Base64 互转，支持中文 UTF-8。',
 run(){mBody.innerHTML=ioHTML({ph:'输入文本…'});
  $('#actions').innerHTML=`<div class="seg"><button class="on" data-m="enc">编码</button><button data-m="dec">解码</button></div>`;
  let mode='enc';mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{mBody.querySelectorAll('.seg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mode=b.dataset.m;convert()});
  function convert(){try{const v=$('#in').value;if(mode==='enc'){const bytes=new TextEncoder().encode(v);let bin='';bytes.forEach(x=>bin+=String.fromCharCode(x));$('#out').value=btoa(bin)}else{const bin=atob(v.trim());const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));$('#out').value=new TextDecoder().decode(bytes)}}catch(e){$('#out').value='❌ 解码失败：可能不是合法的 Base64'}}
  $('#in').addEventListener('input',convert);
 }});

// 3 URL encode
add({id:'url',ic:'🔗',name:'URL 编解码',cat:'开发',desc:'对网址参数进行 encodeURIComponent / decode。',
 run(){mBody.innerHTML=ioHTML({ph:'输入 URL 或文本…'});
  $('#actions').innerHTML=`<div class="seg"><button class="on" data-m="enc">编码</button><button data-m="dec">解码</button></div>`;
  let mode='enc';mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{mBody.querySelectorAll('.seg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mode=b.dataset.m;convert()});
  function convert(){try{$('#out').value=mode==='enc'?encodeURIComponent($('#in').value):decodeURIComponent($('#in').value)}catch(e){$('#out').value='❌ 解码失败'}}
  $('#in').addEventListener('input',convert);
 }});

// 4 Hash
add({id:'hash',ic:'#️⃣',name:'哈希计算',cat:'开发',desc:'计算 MD5 / SHA-1 / SHA-256 / SHA-512。',
 run(){mBody.innerHTML=ioHTML({ph:'输入要计算哈希的文本…'})+
   `<label class="lb">算法</label><select id="algo"><option>SHA-256</option><option>SHA-1</option><option>SHA-512</option><option>MD5</option></select>`;
  $('#actions').innerHTML=`<button class="btn primary" id="go">计算</button>`;
  async function go(){const v=$('#in').value,algo=$('#algo').value;
   if(algo==='MD5'){$('#out').value=md5(v);return}
   const buf=await crypto.subtle.digest(algo,new TextEncoder().encode(v));
   $('#out').value=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  $('#go').onclick=go;$('#in').addEventListener('input',go);$('#algo').onchange=go;go();
 }});

// 5 UUID
add({id:'uuid',ic:'🆔',name:'UUID 生成器',cat:'开发',desc:'一键生成随机 UUID v4。',
 run(){mBody.innerHTML=`<label class="lb">生成数量</label><div class="row"><input class="ti" id="num" type="number" value="10" min="1" max="500" style="width:120px"><button class="btn primary" id="go">生成</button><button class="btn" onclick="copy($('#out').value)">复制</button></div><div class="out"><textarea id="out" readonly style="min-height:220px"></textarea></div>`;
  function gen(){const n=Math.min(500,Math.max(1,+$('#num').value||1));let s='';for(let i=0;i<n;i++)s+=crypto.randomUUID()+'\n';$('#out').value=s.trim()}
  $('#go').onclick=gen;gen();
 }});

// 6 Regex tester
add({id:'regex',ic:'.*',name:'正则表达式测试',cat:'开发',desc:'实时测试正则匹配，查看高亮结果。',
 run(){mBody.innerHTML=`<label class="lb">正则表达式</label><div class="row"><input class="ti" id="re" placeholder="例如 \\d+" style="flex:1"><input class="ti" id="flags" value="gi" style="width:90px" placeholder="flags"></div><label class="lb">测试文本</label><textarea id="in" placeholder="输入要匹配的文本…"></textarea><label class="lb">匹配结果</label><pre class="diff" id="out"></pre>`;
  function test(){try{const re=new RegExp($('#re').value||'(?!x)x',$('#flags').value);const txt=$('#in').value;const matches=[...txt.matchAll(re)];$('#out').innerHTML=matches.length?matches.map(m=>`<span class="diff-add">${esc(m[0])}</span>`).join(' ')||'':`<span style="color:var(--muted)">无匹配（共 0 处）</span>`;mBody.dataset.count=matches.length}catch(e){$('#out').textContent='❌ 正则错误：'+e.message}}
  ['#re','#flags','#in'].forEach(s=>$(s).addEventListener('input',test));test();
 }});

// 7 Timestamp
add({id:'time',ic:'🕐',name:'时间戳转换',cat:'开发',desc:'Unix 时间戳与日期互转，支持毫秒/秒。',
 run(){mBody.innerHTML=`<label class="lb">当前时间</label><div class="stat-grid"><div class="stat-box"><div class="n" id="nowSec">-</div><div class="l">秒 (s)</div></div><div class="stat-box"><div class="n" id="nowMs">-</div><div class="l">毫秒 (ms)</div></div></div>
  <label class="lb">时间戳 → 日期</label><div class="row"><input class="ti" id="ts" placeholder="例如 1700000000" style="flex:1"><select id="unit"><option value="s">秒</option><option value="ms">毫秒</option></select><button class="btn primary" id="toDate">转换</button></div>
  <div class="out"><textarea id="out" readonly></textarea></div>
  <label class="lb">日期 → 时间戳</label><div class="row"><input class="ti" id="dt" type="datetime-local" style="flex:1"><button class="btn primary" id="toTs">转换</button></div>`;
  function tick(){$('#nowSec').textContent=Math.floor(Date.now()/1000);$('#nowMs').textContent=Date.now()}
  tick();setInterval(tick,1000);
  $('#toDate').onclick=()=>{const v=+$('#ts').value;if(!v){$('#out').value='请输入时间戳';return}const ms=$('#unit').value==='ms'?v:v*1000;const d=new Date(ms);$('#out').value=isNaN(d)?'无效时间戳':`本地时间：${d.toLocaleString('zh-CN')}\nUTC 时间：${d.toUTCString()}\nISO：${d.toISOString()}`};
  $('#toTs').onclick=()=>{const v=$('#dt').value;if(!v)return;const ms=new Date(v).getTime();$('#out').value=`秒：${Math.floor(ms/1000)}\n毫秒：${ms}`};
 }});

// 8 Color converter
add({id:'color',ic:'🎨',name:'颜色转换器',cat:'开发',desc:'HEX / RGB / HSL 互转，附带取色器。',
 run(){mBody.innerHTML=`<label class="lb">选择颜色</label><div class="row"><input type="color" id="picker" value="#7c5cff" style="width:60px;height:44px;border:none;background:none;cursor:pointer"><input class="ti" id="hex" value="#7C5CFF" style="flex:1" placeholder="#RRGGBB"></div>
  <div class="color-preview" id="prev"></div>
  <label class="lb">转换结果</label>
  <div class="stat-grid"><div class="stat-box"><div class="n" id="rgb" style="font-size:16px">-</div><div class="l">RGB</div></div><div class="stat-box"><div class="n" id="hsl" style="font-size:16px">-</div><div class="l">HSL</div></div></div>`;
  function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
  function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0,s=0,l=(mx+mn)/2;
   if(d){s=d/(1-Math.abs(2*l-1));if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}
   return [Math.round(h),Math.round(s*100),Math.round(l*100)]}
  function upd(){let hex=$('#hex').value.trim();if(!/^#?[0-9a-fA-F]{6}$|^#?[0-9a-fA-F]{3}$/.test(hex))return;
   if(hex[0]!=='#')hex='#'+hex;$('#prev').style.background=hex;$('#picker').value=hex;
   const [r,g,b]=hex2rgb(hex);$('#rgb').textContent=`${r}, ${g}, ${b}`;const [h,s,l]=rgb2hsl(r,g,b);$('#hsl').textContent=`${h}°, ${s}%, ${l}%`}
  $('#hex').addEventListener('input',upd);$('#picker').addEventListener('input',e=>{$('#hex').value=e.target.value.toUpperCase();upd()});upd();
 }});

// 9 Number base
add({id:'base',ic:'🔢',name:'进制转换器',cat:'开发',desc:'二 / 八 / 十 / 十六进制互转。',
 run(){mBody.innerHTML=`<label class="lb">输入数字</label><div class="row"><input class="ti" id="v" value="255" style="flex:1"><select id="from"><option value="10">十进制</option><option value="2">二进制</option><option value="8">八进制</option><option value="16">十六进制</option></select></div>
  <div class="stat-grid"><div class="stat-box"><div class="n" id="b2" style="font-size:15px">-</div><div class="l">二进制 (2)</div></div><div class="stat-box"><div class="n" id="b8" style="font-size:15px">-</div><div class="l">八进制 (8)</div></div><div class="stat-box"><div class="n" id="b10" style="font-size:15px">-</div><div class="l">十进制 (10)</div></div><div class="stat-box"><div class="n" id="b16" style="font-size:15px">-</div><div class="l">十六进制 (16)</div></div></div>`;
  function conv(){const v=$('#v').value.trim(),f=+$('#from').value;if(!v)return;const d=parseInt(v,f);if(isNaN(d)){$['#b2'].textContent='无效';return}$('#b2').textContent=d.toString(2);$('#b8').textContent=d.toString(8);$('#b10').textContent=d.toString(10);$('#b16').textContent=d.toString(16).toUpperCase()}
  $('#v').addEventListener('input',conv);$('#from').onchange=conv;conv();
 }});

// 10 JWT decode
add({id:'jwt',ic:'🎫',name:'JWT 解码',cat:'开发',desc:'解析 JWT 的 Header 与 Payload（不验证签名）。',
 run(){mBody.innerHTML=ioHTML({ph:'粘贴 JWT，例如 eyJhbGciOi…'})+
  `<div class="out"><label class="lb">解析结果</label><pre class="diff" id="dec"></pre></div>`;
  $('#in').addEventListener('input',()=>{try{const t=$('#in').value.trim().split('.');if(t.length<2)throw new Error('不是合法的 JWT 结构');
   const dec=s=>JSON.parse(atob(s.replace(/-/g,'+').replace(/_/g,'/')));
   $('#dec').textContent=`HEADER\n${JSON.stringify(dec(t[0]),null,2)}\n\nPAYLOAD\n${JSON.stringify(dec(t[1]),null,2)}\n\nSIGNATURE\n${t[2]||'(无)'}`;
  }catch(e){$('#dec').textContent='❌ '+e.message}});
 }});

// 11 Word count
add({id:'count',ic:'📝',name:'字数统计',cat:'文本',desc:'统计字符、中文字、单词、行数与段落。',
 run(){mBody.innerHTML=`<textarea id="in" placeholder="输入或粘贴文本…"></textarea><div class="stat-grid" id="stats"></div>`;
  function cnt(){const t=$('#in').value;const cn=(t.match(/[\u4e00-\u9fa5]/g)||[]).length;const en=(t.match(/[a-zA-Z]+/g)||[]).length;const num=(t.match(/\d+/g)||[]).length;const lines=t?t.split('\n').length:0;const para=t?t.split(/\n\s*\n/).filter(x=>x.trim()).length:0;const chars=t.length;const noSpace=t.replace(/\s/g,'').length;
   const data=[['总字符',chars],['不含空格',noSpace],['中文字',cn],['英文单词',en],['数字',num],['行数',lines],['段落',para]];
   $('#stats').innerHTML=data.map(d=>`<div class="stat-box"><div class="n">${d[1]}</div><div class="l">${d[0]}</div></div>`).join('')}
  $('#in').addEventListener('input',cnt);cnt();
 }});

// 12 Case converter
add({id:'case',ic:'Aa',name:'大小写 / 命名转换',cat:'文本',desc:'多种大小写与命名风格一键转换。',
 run(){mBody.innerHTML=ioHTML({ph:'输入文本，例如 hello world'});
  $('#actions').innerHTML=`<div class="seg"><button data-m="upper">大写</button><button data-m="lower">小写</button><button data-m="title">首字母大写</button><button data-m="camel">驼峰</button><button data-m="snake">下划线</button><button data-m="kebab">短横线</button></div>`;
  mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{const v=$('#in').value.trim();const words=v.split(/[\s_\-]+/).filter(Boolean);
   let r='';switch(b.dataset.m){case'upper':r=v.toUpperCase();break;case'lower':r=v.toLowerCase();break;case'title':r=v.replace(/\b\w/g,c=>c.toUpperCase());break;
   case'camel':r=words.map((w,i)=>i?w[0].toUpperCase()+w.slice(1).toLowerCase():w.toLowerCase()).join('');break;
   case'snake':r=words.map(w=>w.toLowerCase()).join('_');break;case'kebab':r=words.map(w=>w.toLowerCase()).join('-');break}
   $('#out').value=r});
 }});

// 13 Dedupe
add({id:'dedupe',ic:'📑',name:'文本去重',cat:'文本',desc:'按行去重，可选择保留顺序。',
 run(){mBody.innerHTML=ioHTML({ph:'每行一条内容…'})+
  `<label class="switch"><input type="checkbox" id="trim" checked> 去除首尾空格</label>`;
  $('#actions').innerHTML=`<button class="btn primary" id="go">去重</button>`;
  $('#go').onclick=()=>{let lines=$('#in').value.split('\n');if($('#trim').checked)lines=lines.map(l=>l.trim());const seen=new Set();$('#out').value=lines.filter(l=>{if(!l||seen.has(l))return false;seen.add(l);return true}).join('\n')};
 }});

// 14 Reverse
add({id:'reverse',ic:'🔄',name:'文本反转',cat:'文本',desc:'逐字符反转或逐行反转文本。',
 run(){mBody.innerHTML=ioHTML({ph:'输入文本…'});
  $('#actions').innerHTML=`<div class="seg"><button class="on" data-m="char">逐字符</button><button data-m="line">逐行</button></div>`;
  let mode='char';mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{mBody.querySelectorAll('.seg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mode=b.dataset.m;doIt()});
  function doIt(){const v=$('#in').value;$('#out').value=mode==='char'?[...v].reverse().join(''):v.split('\n').reverse().join('\n')}
  $('#in').addEventListener('input',doIt);
 }});

// 15 Text diff
add({id:'diff',ic:'🔀',name:'文本对比 Diff',cat:'文本',desc:'对比两段文本的行级差异。',
 run(){mBody.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><label class="lb">原始文本</label><textarea id="a" placeholder="原始…"></textarea></div><div><label class="lb">新文本</label><textarea id="b" placeholder="修改后…"></textarea></div></div>
  <div class="row"><button class="btn primary" id="go">对比</button></div><pre class="diff" id="out"></pre>`;
  $('#go').onclick=()=>{const A=$('#a').value.split('\n'),B=$('#b').value.split('\n');
   // simple LCS
   const n=A.length,m=B.length,dp=Array.from({length:n+1},()=>new Array(m+1).fill(0));
   for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=A[i]===B[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
   let i=0,j=0,html='';while(i<n&&j<m){if(A[i]===B[j]){html+=esc(A[i])+'\n';i++;j++}else if(dp[i+1][j]>=dp[i][j+1]){html+=`<span class="diff-del">- ${esc(A[i])}</span>\n`;i++}else{html+=`<span class="diff-add">+ ${esc(B[j])}</span>\n`;j++}}
   while(i<n){html+=`<span class="diff-del">- ${esc(A[i++])}</span>\n`}while(j<m){html+=`<span class="diff-add">+ ${esc(B[j++])}</span>\n`}
   $('#out').innerHTML=html||'<span style="color:var(--muted)">两段文本相同</span>'};
 }});

// 16 Morse
add({id:'morse',ic:'📡',name:'摩斯电码',cat:'文本',desc:'文本与摩斯电码互转。',
 run(){mBody.innerHTML=ioHTML({ph:'输入文本…'});
  $('#actions').innerHTML=`<div class="seg"><button class="on" data-m="enc">转电码</button><button data-m="dec">转文本</button></div>`;
  const M={'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':' -.-. '};const R={};Object.entries(M).forEach(([k,v])=>R[v]=k);
  let mode='enc';mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{mBody.querySelectorAll('.seg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mode=b.dataset.m;doIt()});
  function doIt(){const v=$('#in').value.toUpperCase();$('#out').value=mode==='enc'?v.split('').map(c=>c===' '?' / ':M[c]||'').join(' ').trim():v.split(' ').map(c=>c==='/'?' ':R[c]||'').join('')}
  $('#in').addEventListener('input',doIt);
 }});

// 17 HTML escape
add({id:'html',ic:'< >',name:'HTML 转义',cat:'文本',desc:'HTML 实体转义与反转义。',
 run(){mBody.innerHTML=ioHTML({ph:'输入 HTML 或文本…'});
  $('#actions').innerHTML=`<div class="seg"><button class="on" data-m="esc">转义</button><button data-m="un">反转义</button></div>`;
  let mode='esc';mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{mBody.querySelectorAll('.seg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mode=b.dataset.m;doIt()});
  function doIt(){const v=$('#in').value;let r;if(mode==='esc'){const d=document.createElement('div');d.textContent=v;r=d.innerHTML}else{const d=document.createElement('textarea');d.innerHTML=v;r=d.value}$('#out').value=r}
  $('#in').addEventListener('input',doIt);
 }});

// 18 Password
add({id:'pwd',ic:'🔐',name:'密码生成器',cat:'生成',desc:'生成高强度随机密码，可自定义字符与长度。',
 run(){mBody.innerHTML=`<label class="lb">密码长度：<span id="lenV" style="color:var(--c)">16</span></label><input type="range" id="len" min="6" max="64" value="16" style="width:100%;accent-color:var(--a)">
  <div class="row" style="margin-top:16px"><label class="switch"><input type="checkbox" id="low" checked> 小写</label><label class="switch"><input type="checkbox" id="up" checked> 大写</label><label class="switch"><input type="checkbox" id="dig" checked> 数字</label><label class="switch"><input type="checkbox" id="sym" checked> 符号</label></div>
  <div class="row"><button class="btn primary" id="go">生成密码</button><button class="btn" onclick="copy($('#out').value)">复制</button></div>
  <div class="out"><input class="ti" id="out" readonly style="font-size:20px;letter-spacing:.1em"></div><div class="hint" id="strength"></div>`;
  function gen(){let pool='';if($('#low').checked)pool+='abcdefghijklmnopqrstuvwxyz';if($('#up').checked)pool+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';if($('#dig').checked)pool+='0123456789';if($('#sym').checked)pool+='!@#$%^&*()-_=+[]{}?';
   if(!pool){$('#out').value='请至少选择一种字符';return}const n=+$('#len').value;const arr=new Uint32Array(n);crypto.getRandomValues(arr);$('#out').value=[...arr].map(x=>pool[x%pool.length]).join('');
   const s=n>=16&&$('#sym').checked&&$('#dig').checked?'🔒 非常强':n>=12?'🔐 强':'⚠️ 一般';$('#strength').textContent='强度：'+s}
  $('#len').oninput=e=>{$('#lenV').textContent=e.target.value;gen()};$('#go').onclick=gen;['low','up','dig','sym'].forEach(id=>$('#'+id).onchange=gen);gen();
 }});

// 19 QR code
add({id:'qr',ic:'▦',name:'二维码生成',cat:'生成',desc:'把文字或网址生成二维码，可下载。',
 run(){mBody.innerHTML=`<label class="lb">输入内容（文字 / 网址）</label><input class="ti" id="txt" placeholder="https://zqf.ltd" value="https://zqf.ltd">
  <label class="lb">前景色 / 背景色</label><div class="row"><input type="color" id="fg" value="#000000" style="width:56px;height:40px;border:none;background:none;cursor:pointer"><input type="color" id="bg" value="#ffffff" style="width:56px;height:40px;border:none;background:none;cursor:pointer"><button class="btn primary" id="go">生成</button><button class="btn" id="dl">下载 PNG</button></div>
  <div class="qr-wrap"><div id="qrcode"></div><div class="hint">扫码即可查看内容</div></div>`;
  let qr;function gen(){const box=$('#qrcode');box.innerHTML='';qr=new QRCode(box,{text:$('#txt').value||' ',width:240,height:240,colorDark:$('#fg').value,colorLight:$('#bg').value,correctLevel:QRCode.CorrectLevel.H})}
  $('#go').onclick=gen;$('#txt').addEventListener('input',gen);$('#fg').onchange=gen;$('#bg').onchange=gen;
  $('#dl').onclick=()=>{const img=box.querySelector('img')||box.querySelector('canvas');if(!img){toast('请先生成');return}const a=document.createElement('a');a.download='qrcode.png';a.href=img.src||img.toDataURL();a.click()};
  gen();
 }});

// 20 Random number
add({id:'rand',ic:'🎲',name:'随机数生成',cat:'生成',desc:'指定范围生成随机数，支持去重与排序。',
 run(){mBody.innerHTML=`<div class="row"><label class="lb" style="margin:0">最小</label><input class="ti" id="min" type="number" value="1" style="width:100px"><label class="lb" style="margin:0">最大</label><input class="ti" id="max" type="number" value="100" style="width:100px"><label class="lb" style="margin:0">个数</label><input class="ti" id="cnt" type="number" value="10" style="width:90px"></div>
  <label class="switch" style="margin-top:14px"><input type="checkbox" id="uniq" checked> 不重复</label>
  <div class="row"><button class="btn primary" id="go">生成</button><button class="btn" onclick="copy($('#out').value)">复制</button></div>
  <div class="out"><textarea id="out" readonly></textarea></div>`;
  $('#go').onclick=()=>{let a=+$('#min').value,b=+$('#max').value,c=Math.min(1000,+$('#cnt').value||1),u=$('#uniq').checked;if(a>b)[a,b]=[b,a];
   if(u){const pool=[];for(let i=a;i<=b;i++)pool.push(i);if(c>pool.length)c=pool.length;for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}$('#out').value=pool.slice(0,c).join('\n')}
   else{let r=[];for(let i=0;i<c;i++)r.push(a+Math.floor(Math.random()*(b-a+1)));$('#out').value=r.join('\n')}};
  $('#go').click();
 }});

// 21 RMB uppercase
add({id:'rmb',ic:'💰',name:'人民币大写',cat:'生活',desc:'数字金额转中文大写（财务用）。',
 run(){mBody.innerHTML=`<label class="lb">输入金额（元）</label><input class="ti" id="v" placeholder="例如 12345.67" value="12345.67"><div class="out"><label class="lb">中文大写</label><textarea id="out" readonly style="min-height:80px"></textarea></div>`;
  function up(n){const digit='零壹贰叁肆伍陆柒捌玖'.split(''),unit=['','拾','佰','仟'],big=['','万','亿','兆'];
   n=n.replace(/,/g,'');if(!/^\d+(\.\d{1,2})?$/.test(n))return '请输入有效金额';
   let [int,dec]=n.split('.');dec=dec||'';
   let s='';for(let i=0;i<int.length;i++){const d=+int[i],pos=int.length-1-i,sec=Math.floor(pos/4),p=pos%4;
    if(d===0){if(p===0&&s&&!s.endsWith('零'))s+='零'}else{s+=digit[d]+unit[p]}
    if(p===0&&sec>0)s+=big[sec]}
   s=s.replace(/零+/g,'零').replace(/零$|零(万|亿|兆)/g,'$1')||'零';
   let r=s+'元';if(dec){if(dec[0]!=='0')r+=digit[+dec[0]]+'角';if(dec[1])r+=digit[+dec[1]]+'分'}else r+='整';return r}
  $('#v').addEventListener('input',()=>$('#out').value=up($('#v').value));$('#out').value=up($('#v').value);
 }});

// 22 Unit converter
add({id:'unit',ic:'📏',name:'单位换算',cat:'生活',desc:'长度、重量、温度、面积常用单位换算。',
 run(){mBody.innerHTML=`<label class="lb">类别</label><select id="type"><option value="len">长度</option><option value="weight">重量</option><option value="temp">温度</option><option value="area">面积</option></select>
  <div class="row" style="margin-top:16px"><input class="ti" id="v" type="number" value="1" style="flex:1"><select id="from"></select><span style="color:var(--muted)">→</span><select id="to"></select></div>
  <div class="out"><label class="lb">结果</label><input class="ti" id="out" readonly style="font-size:20px;color:var(--c)"></div>`;
  const U={len:{米:1,千米:1000,厘米:.01,毫米:.001,英尺:.3048,英寸:.0254,英里:1609.344},weight:{千克:1,克:.001,吨:1000,斤:.5,磅:.453592,盎司:.0283495},area:{平方米:1,平方千米:1e6,平方厘米:.0001,公顷:10000,亩:666.667},temp:{摄氏度:1,华氏度:1,开尔文:1}};
  function fill(){const u=U[$('#type').value];$('#from').innerHTML=$('#to').innerHTML=Object.keys(u).map(k=>`<option>${k}</option>`).join('');if($('#type').value==='len'){$('#from').value='米';$('#to').value='英尺'}conv()}
  function conv(){const t=$('#type').value,v=+$('#v').value,f=$('#from').value,to=$('#to').value;let r;
   if(t==='temp'){let c;if(f==='摄氏度')c=v;else if(f==='华氏度')c=(v-32)*5/9;else c=v-273.15;
    r=to==='摄氏度'?c:to==='华氏度'?c*9/5+32:c+273.15}
   else{const u=U[t];r=v*u[f]/u[to]}
   $('#out').value=(Math.round(r*1e6)/1e6)+' '+to}
  $('#type').onchange=fill;['v','from','to'].forEach(id=>$('#'+id).addEventListener('input',conv));fill();
 }});

// 23 Image to base64
add({id:'imgb64',ic:'🖼️',name:'图片转 Base64',cat:'图片',desc:'把图片转成可内联的 Base64 Data URL。',
 run(){mBody.innerHTML=`<label class="lb">选择图片</label><input type="file" id="f" accept="image/*" class="ti"><div class="out"><label class="lb">Base64（Data URL）</label><textarea id="out" readonly style="min-height:180px"></textarea><div class="row"><button class="btn sm" onclick="copy($('#out').value)">复制</button><span class="hint" id="sz"></span></div></div>`;
  $('#f').onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{$('#out').value=r.result;$('#sz').textContent=`大小：${(file.size/1024).toFixed(1)} KB`};r.readAsDataURL(file)};
 }});

// 24 Image compress
add({id:'imgc',ic:'🗜️',name:'图片压缩 / 转换',cat:'图片',desc:'调整质量与尺寸，转 JPG/WebP/PNG，纯本地。',
 run(){mBody.innerHTML=`<label class="lb">选择图片</label><input type="file" id="f" accept="image/*" class="ti">
  <label class="lb">输出格式</label><select id="fmt"><option value="image/webp">WebP</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select>
  <div class="row"><label class="lb" style="margin:0">质量 <span id="qv" style="color:var(--c)">0.8</span></label><input type="range" id="q" min="0.1" max="1" step="0.05" value="0.8" style="flex:1;accent-color:var(--a)"></div>
  <div class="row"><label class="lb" style="margin:0">最大宽度 <span id="wv" style="color:var(--c)">原图</span></label><input type="range" id="w" min="200" max="4000" step="100" value="4000" style="flex:1;accent-color:var(--a)"></div>
  <div class="row"><button class="btn primary" id="dl">压缩并下载</button><span class="hint" id="info"></span></div>
  <div class="qr-wrap"><img id="prev" style="max-width:100%;max-height:280px;border-radius:12px;display:none"></div>`;
  let img;const q=$('#q'),w=$('#w');q.oninput=()=>$('#qv').textContent=q.value;w.oninput=()=>$('#wv').textContent=w.value>=4000?'原图':w.value+'px';
  $('#f').onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{img=new Image();img.onload=()=>{$('#prev').src=img.src;$('#prev').style.display='block';$('#info').textContent=`原图：${img.width}×${img.height}，${(file.size/1024).toFixed(1)} KB`};img.src=r.result};r.readAsDataURL(file)};
  $('#dl').onclick=()=>{if(!img){toast('请先选择图片');return}const scale=Math.min(1,+$('#w').value/img.width);const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);
   c.getContext('2d').drawImage(img,0,0,c.width,c.height);const fmt=$('#fmt').value;const ext=fmt==='image/jpeg'?'jpg':fmt==='image/webp'?'webp':'png';const url=c.toDataURL(fmt,+$('#q').value);
   const a=document.createElement('a');a.download='compressed.'+ext;a.href=url;a.click();$('#info').textContent=`已压缩：${c.width}×${c.height}，${(url.length*0.75/1024).toFixed(1)} KB`};
 }});

/* ---------- MD5 (compact pure JS) ---------- */
function md5(s){
 function safeAdd(x,y){const l=(x&0xffff)+(y&0xffff);return ((x>>16)+(y>>16)+(l>>16))<<16|(l&0xffff)}
 function rol(a,n){return (a<<n)|(a>>>(32-n))}
 function cmn(q,a,b,x,s,t){a=safeAdd(safeAdd(a,q),safeAdd(x,t));return safeAdd(rol(a,s),b)}
 function ff(a,b,c,d,x,s,t){return cmn((b&c)|(~b&d),a,b,x,s,t)}
 function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&~d),a,b,x,s,t)}
 function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t)}
 function ii(a,b,c,d,x,s,t){return cmn(c^(b|~d),a,b,x,s,t)}
 const bytes=new TextEncoder().encode(s),n=bytes.length;
 const x=[];for(let i=0;i<n;i++)x[i>>2]|=(bytes[i]&0xff)<<((i%4)*8);
 const bitLen=n*8;x[n>>2]|=0x80<<((n%4)*8);x[(((n+8)>>9)<<4)+14]=bitLen&0xffffffff;x[(((n+8)>>9)<<4)+15]=Math.floor(bitLen/0x100000000);
 let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
 for(let i=0;i<x.length;i+=16){let oa=a,ob=b,oc=c,od=d;
  a=ff(a,b,c,d,x[i+0],7,-680876936);d=ff(d,a,b,c,x[i+1],12,-389564586);c=ff(c,d,a,b,x[i+2],17,606105819);b=ff(b,c,d,a,x[i+3],22,-1044525330);
  a=ff(a,b,c,d,x[i+4],7,-176418897);d=ff(d,a,b,c,x[i+5],12,1200080426);c=ff(c,d,a,b,x[i+6],17,-1473231341);b=ff(b,c,d,a,x[i+7],22,-45705983);
  a=ff(a,b,c,d,x[i+8],7,1770035416);d=ff(d,a,b,c,x[i+9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,-42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
  a=ff(a,b,c,d,x[i+12],7,1804603682);d=ff(d,a,b,c,x[i+13],12,-40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);b=ff(b,c,d,a,x[i+15],22,1236535329);
  a=gg(a,b,c,d,x[i+1],5,-165796510);d=gg(d,a,b,c,x[i+6],9,-1069501632);c=gg(c,d,a,b,x[i+11],14,643717713);b=gg(b,c,d,a,x[i+0],20,-373897302);
  a=gg(a,b,c,d,x[i+5],5,-701558691);d=gg(d,a,b,c,x[i+10],9,38016083);c=gg(c,d,a,b,x[i+15],14,-660478335);b=gg(b,c,d,a,x[i+4],20,-405537848);
  a=gg(a,b,c,d,x[i+9],5,568446438);d=gg(d,a,b,c,x[i+14],9,-1019803690);c=gg(c,d,a,b,x[i+3],14,-187363961);b=gg(b,c,d,a,x[i+8],20,1163531501);
  a=gg(a,b,c,d,x[i+13],5,-1444681467);d=gg(d,a,b,c,x[i+2],9,-51403784);c=gg(c,d,a,b,x[i+7],14,1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);
  a=hh(a,b,c,d,x[i+5],4,-378558);d=hh(d,a,b,c,x[i+8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16,1839030562);b=hh(b,c,d,a,x[i+14],23,-35309556);
  a=hh(a,b,c,d,x[i+1],4,-1530992060);d=hh(d,a,b,c,x[i+4],11,1272893353);c=hh(c,d,a,b,x[i+7],16,-155497632);b=hh(b,c,d,a,x[i+10],23,-1094730640);
  a=hh(a,b,c,d,x[i+13],4,681279174);d=hh(d,a,b,c,x[i+0],11,-358537222);c=hh(c,d,a,b,x[i+3],16,-722521979);b=hh(b,c,d,a,x[i+6],23,76029189);
  a=hh(a,b,c,d,x[i+9],4,-640364487);d=hh(d,a,b,c,x[i+12],11,-421815835);c=hh(c,d,a,b,x[i+15],16,530742520);b=hh(b,c,d,a,x[i+2],23,-995338651);
  a=ii(a,b,c,d,x[i+0],6,-198630844);d=ii(d,a,b,c,x[i+7],10,1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);b=ii(b,c,d,a,x[i+5],21,-57434055);
  a=ii(a,b,c,d,x[i+12],6,1700485571);d=ii(d,a,b,c,x[i+3],10,-1894986606);c=ii(c,d,a,b,x[i+10],15,-1051523);b=ii(b,c,d,a,x[i+1],21,-2054922799);
  a=ii(a,b,c,d,x[i+8],6,1873313359);d=ii(d,a,b,c,x[i+15],10,-30611744);c=ii(c,d,a,b,x[i+6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21,1309151649);
  a=ii(a,b,c,d,x[i+4],6,-145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+2],15,718787259);b=ii(b,c,d,a,x[i+9],21,-343485551);
  a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od);
 }
 return [a,b,c,d].map(v=>{let h='';for(let i=0;i<4;i++)h+=(v>>>(i*8)&0xff).toString(16).padStart(2,'0');return h}).join('');
}

/* ---------- render ---------- */
function render(filter='',cat='全部'){
 const q=filter.trim().toLowerCase();
 const list=tools.filter(t=>(cat==='全部'||t.cat===cat)&&(!q||t.name.toLowerCase().includes(q)||t.desc.toLowerCase().includes(q)||t.cat.includes(q)));
 grid.innerHTML=list.map(t=>`<div class="tool" data-id="${t.id}"><span class="tag">${t.cat}</span><span class="ic">${t.ic}</span><h3>${t.name}</h3><p>${t.desc}</p></div>`).join('');
 $('#empty').style.display=list.length?'none':'block';
 grid.querySelectorAll('.tool').forEach(el=>el.onclick=()=>openTool(el.dataset.id));
}
function openTool(id){const t=tools.find(x=>x.id===id);mTitle.textContent=t.name;mIc.textContent=t.ic;mBody.innerHTML='';t.run();modal.classList.add('show')}
function closeTool(){modal.classList.remove('show')}
$('#mClose').onclick=closeTool;modal.onclick=e=>{if(e.target===modal)closeTool()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTool()});

const catNames=['全部','开发','文本','生成','图片','生活'];
catsEl.innerHTML=catNames.map((c,i)=>`<div class="cat ${i===0?'on':''}" data-c="${c}">${c}</div>`).join('');
let curCat='全部';
catsEl.querySelectorAll('.cat').forEach(el=>el.onclick=()=>{catsEl.querySelectorAll('.cat').forEach(x=>x.classList.remove('on'));el.classList.add('on');curCat=el.dataset.c;render($('#search').value,curCat)});
$('#search').addEventListener('input',e=>render(e.target.value,curCat));
render();
