/* ============ TOOLKIT · 24 个实用工具（纯本地） ============ */
const $=s=>document.querySelector(s);
const grid=$('#grid'),catsEl=$('#cats'),modal=$('#modal'),mTitle=$('#mTitle'),mIc=$('#mIc'),mBody=$('#mBody');
let tools=[];

/* ---------- helpers ---------- */
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1600)}
function copy(text){navigator.clipboard.writeText(text).then(()=>toast('已复制到剪贴板 ✓')).catch(()=>toast('复制失败，请手动选择'))}
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
function add(t){tools.push(t)}
const box=(title,inner)=>`<div style="background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:14px"><div class="lb" style="margin:0 0 10px">${title}</div>${inner}</div>`;
const big=(id,unit='')=>`<div style="margin-top:12px;font-size:22px;font-weight:800;color:var(--c)" id="${id}">—</div>`;
const num=(id,ph)=>`<input class="ti" id="${id}" type="number" placeholder="${ph}" style="flex:1;min-width:0">`;

/* ================= 计算 ================= */

// 1 百分比
add({id:'percent',ic:'％',name:'百分比计算器',cat:'计算',desc:'算 X 的百分之几、占比、涨跌幅、打折价。',
 run(){mBody.innerHTML=
  box('X 的 Y% 是多少',`<div class="row" style="margin-top:0">${num('pa','数量')}<span style="color:var(--muted)">的</span>${num('pb','百分比')}<span style="color:var(--muted)">%</span></div>${big('pr')}`)+
  box('X 是 Y 的百分之几',`<div class="row" style="margin-top:0">${num('pc','部分')}<span style="color:var(--muted)">占</span>${num('pd','总数')}<span style="color:var(--muted)">的</span></div>${big('pr2')}`)+
  box('从 X 到 Y 的变化',`<div class="row" style="margin-top:0">${num('pe','原值')}<span style="color:var(--muted)">→</span>${num('pf','新值')}</div>${big('pr3')}`);
  function calc(){
    const a=+$('#pa').value,b=+$('#pb').value;
    $('#pr').textContent=(a&&$('#pa').value!==''&&$('#pb').value!=='')?(a*b/100).toLocaleString('zh-CN',{maximumFractionDigits:6}):'—';
    const c=+$('#pc').value,d=+$('#pd').value;
    $('#pr2').textContent=(d&&$('#pc').value!==''&&$('#pd').value!=='')?((c/d*100).toFixed(2)+'%'):'—';
    const e=+$('#pe').value,f=+$('#pf').value;
    if($('#pe').value!==''&&$('#pf').value!==''&&e!==0){const ch=(f-e)/e*100;$('#pr3').textContent=(ch>=0?'+':'')+ch.toFixed(2)+'%'+(ch>0?'（上涨）':ch<0?'（下跌）':'（持平）')}
    else $('#pr3').textContent='—';
  }
  ['pa','pb','pc','pd','pe','pf'].forEach(id=>$('#'+id).addEventListener('input',calc));
 }});

// 2 日期计算
add({id:'date',ic:'📅',name:'日期计算器',cat:'计算',desc:'算两个日期相差多少天、N 天后是几号、年龄。',
 run(){const today=new Date().toISOString().slice(0,10);
  mBody.innerHTML=
  box('两个日期相差',`<div class="row" style="margin-top:0"><input class="ti" id="d1" type="date" value="${today}" style="flex:1"><span style="color:var(--muted)">到</span><input class="ti" id="d2" type="date" value="${today}" style="flex:1"></div>${big('dr')}`)+
  box('从某天起 N 天后 / 前',`<div class="row" style="margin-top:0"><input class="ti" id="db" type="date" value="${today}" style="flex:1"><input class="ti" id="dn" type="number" value="30" style="width:90px"><span style="color:var(--muted)">天</span></div>${big('dr2')}`)+
  box('年龄计算',`<div class="row" style="margin-top:0"><input class="ti" id="dbirth" type="date" style="flex:1"><span style="color:var(--muted)">至今天</span></div>${big('dr3')}`);
  const WD=['日','一','二','三','四','五','六'];
  function dcalc(){
    if($('#d1').value&&$('#d2').value){const a=new Date($('#d1').value),b=new Date($('#d2').value);
      const days=Math.round((b-a)/86400000);$('#dr').textContent=Math.abs(days)+' 天（约 '+(Math.abs(days)/7).toFixed(1)+' 周）'+(days<0?'，早于起点':'')}
    if($('#db').value){const a=new Date($('#db').value);a.setDate(a.getDate()+(+$('#dn').value||0));
      $('#dr2').textContent=a.getFullYear()+'-'+String(a.getMonth()+1).padStart(2,'0')+'-'+String(a.getDate()).padStart(2,'0')+' 星期'+WD[a.getDay()]}
    if($('#dbirth').value){const b=new Date($('#dbirth').value),n=new Date();
      let y=n.getFullYear()-b.getFullYear(),m=n.getMonth()-b.getMonth(),d=n.getDate()-b.getDate();
      if(d<0){m--;d+=new Date(n.getFullYear(),n.getMonth(),0).getDate()} if(m<0){y--;m+=12}
      $('#dr3').textContent=(y>=0?y+' 岁 '+m+' 个月 '+d+' 天':'未出生')}
  }
  ['d1','d2','db','dn','dbirth'].forEach(id=>$('#'+id).addEventListener('input',dcalc));dcalc();
 }});

// 3 房贷
add({id:'loan',ic:'🏠',name:'房贷 / 贷款计算',cat:'计算',desc:'等额本息 / 等额本金，算月供与总利息。',
 run(){mBody.innerHTML=
  box('贷款信息',`<label class="lb" style="margin-top:0">贷款金额（万元）</label>${num('lp','100')}
   <label class="lb">年利率（%）</label>${num('lr','3.1')}
   <label class="lb">贷款年限（年）</label>${num('ly','30')}
   <label class="lb">还款方式</label><select id="lmode"><option value="benxi">等额本息（每月固定）</option><option value="benjin">等额本金（逐月递减）</option></select>
   <div class="row"><button class="btn primary" id="lgo">计算</button></div>`)+
  `<div class="out"><pre class="diff" id="lout" style="min-height:0"></pre></div>`;
  $('#lgo').onclick=()=>{
    const P=(+$('#lp').value||0)*10000, rate=(+$('#lr').value||0)/100/12, n=(+$('#ly').value||0)*12;
    if(!P||!n){$('#lout').textContent='请填写贷款金额和年限';return}
    let txt='';
    if($('#lmode').value==='benxi'){
      let m;
      if(rate===0)m=P/n; else m=P*rate*Math.pow(1+rate,n)/(Math.pow(1+rate,n)-1);
      const total=m*n;
      txt=`【等额本息】\n每月月供：${m.toFixed(2)} 元\n还款总额：${total.toFixed(2)} 元\n支付利息：${(total-P).toFixed(2)} 元\n贷款月数：${n} 个月`;
    }else{
      const principal=P/n, first=principal+P*rate;
      const totalInt=P*rate*(n+1)/2, total=P+totalInt;
      txt=`【等额本金】\n首月月供：${first.toFixed(2)} 元\n每月递减：${(principal*rate).toFixed(2)} 元\n末月月供：${(principal+principal*rate).toFixed(2)} 元\n还款总额：${total.toFixed(2)} 元\n支付利息：${totalInt.toFixed(2)} 元`;
    }
    $('#lout').textContent=txt;
  };
 }});

// 4 个税
add({id:'tax',ic:'🧾',name:'工资个税估算',cat:'计算',desc:'按月度税率表估算个税与实发工资。',
 run(){mBody.innerHTML=
  box('收入与扣除',`<label class="lb" style="margin-top:0">税前月薪（元）</label>${num('tsal','15000')}
   <label class="lb">五险一金（元/月）</label>${num('tins','2000')}
   <label class="lb">专项附加扣除（元/月，如房贷/子女教育）</label>${num('textra','0')}
   <div class="row"><button class="btn primary" id="tgo">计算</button></div>`)+
  `<div class="out"><pre class="diff" id="tout" style="min-height:0"></pre></div>
   <div class="hint">⚠️ 按月度税率表简化估算，实际以「累计预扣法」为准，结果仅供参考。</div>`;
  $('#tgo').onclick=()=>{
    const sal=+$('#tsal').value||0, ins=+$('#tins').value||0, extra=+$('#textra').value||0;
    const taxable=Math.max(0,sal-ins-5000-extra);
    const T=[[3000,.03,0],[12000,.1,210],[25000,.2,1410],[35000,.25,2660],[55000,.3,4410],[80000,.35,7160],[Infinity,.45,15160]];
    let tax=0,rate=0,qd=0;
    for(const [cap,r,q] of T){if(taxable<=cap){rate=r;qd=q;break}}
    tax=Math.max(0,taxable*rate-qd);
    $('#tout').textContent=`应纳税所得额：${taxable.toFixed(2)} 元\n适用税率：${(rate*100).toFixed(0)}%\n速算扣除数：${qd} 元\n应缴个税：${tax.toFixed(2)} 元\n实发工资：${(sal-ins-tax).toFixed(2)} 元`;
  };
 }});

// 5 BMI
add({id:'bmi',ic:'⚖️',name:'BMI 与体型',cat:'计算',desc:'算 BMI、健康体重范围与每日热量。',
 run(){mBody.innerHTML=
  box('身体数据',`<div class="row" style="margin-top:0">${num('bh','身高cm')}${num('bw','体重kg')}</div>
   <div class="row">${num('bage','年龄')}<select id="bsex" style="flex:1"><option value="1">男</option><option value="0">女</option></select></div>
   <div class="row"><button class="btn primary" id="bgo">计算</button></div>`)+
  `<div class="out"><pre class="diff" id="bout" style="min-height:0"></pre></div>`;
  $('#bgo').onclick=()=>{
    const h=(+$('#bh').value||0)/100, w=+$('#bw').value||0, age=+$('#bage').value||25, male=$('#bsex').value==='1';
    if(!h||!w){$('#bout').textContent='请填写身高和体重';return}
    const bmi=w/(h*h);
    let lv='正常',color='#4ade80';
    if(bmi<18.5){lv='偏瘦';color='#60a5fa'}else if(bmi<24){lv='正常';color='#4ade80'}else if(bmi<28){lv='超重';color='#fbbf24'}else{lv='肥胖';color='#f87171'}
    const lo=(18.5*h*h).toFixed(1), hi=(23.9*h*h).toFixed(1);
    // Mifflin-St Jeor
    const bmr=male?(10*w+6.25*(h*100)-5*age+5):(10*w+6.25*(h*100)-5*age-161);
    $('#bout').textContent=`BMI：${bmi.toFixed(1)}（${lv}）\n健康体重范围：${lo} ~ ${hi} kg\n基础代谢 BMR：约 ${Math.round(bmr)} 千卡/天\n久坐每日消耗：约 ${Math.round(bmr*1.2)} 千卡\n轻度活动：约 ${Math.round(bmr*1.375)} 千卡\n（中国成人标准：18.5 正常 24 超重 28 肥胖）`;
  };
 }});

// 6 单位换算
add({id:'unit',ic:'📏',name:'单位换算',cat:'计算',desc:'长度、重量、面积、体积、温度、速度、存储、时间。',
 run(){const U={
   len:{n:'长度',b:'米',u:{'毫米':.001,'厘米':.01,'米':1,'千米':1000,'英寸':.0254,'英尺':.3048,'码':.9144,'英里':1609.344,'市尺':1/3,'市里':500}},
   weight:{n:'重量',b:'千克',u:{'毫克':1e-6,'克':.001,'千克':1,'吨':1000,'斤':.5,'两':.05,'磅':.453592,'盎司':.0283495}},
   area:{n:'面积',b:'平方米',u:{'平方厘米':.0001,'平方米':1,'平方千米':1e6,'公顷':10000,'亩':666.6667,'平方英尺':.092903,'平方英寸':.00064516}},
   vol:{n:'体积',b:'升',u:{'毫升':.001,'升':1,'立方米':1000,'加仑(美)':3.78541,'品脱(美)':.473176,'杯(美)':.236588}},
   speed:{n:'速度',b:'米/秒',u:{'米/秒':1,'千米/时':.277778,'英里/时':.44704,'节':.514444}},
   data:{n:'存储',b:'字节',u:{'字节(B)':1,'KB':1024,'MB':1048576,'GB':1073741824,'TB':1099511627776}},
   time:{n:'时间',b:'秒',u:{'毫秒':.001,'秒':1,'分钟':60,'小时':3600,'天':86400,'周':604800}}
  };
  mBody.innerHTML=box('换算',`<label class="lb" style="margin-top:0">类别</label><select id="utype">${Object.entries(U).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join('')}<option value="temp">温度</option></select>
   <div class="row" style="margin-top:14px"><input class="ti" id="uv" type="number" value="1" style="flex:1"><select id="ufrom" style="flex:1"></select><span style="color:var(--muted)">→</span><select id="uto" style="flex:1"></select></div>${big('ur')}`);
  const T={'摄氏度':1,'华氏度':1,'开尔文':1};
  function fill(){const t=$('#utype').value, u=t==='temp'?T:U[t].u;
   $('#ufrom').innerHTML=$('#uto').innerHTML=Object.keys(u).map(k=>`<option>${k}</option>`).join('');
   if(t==='len'){$('#ufrom').value='米';$('#uto').value='英尺'} conv()}
  function conv(){const t=$('#utype').value,v=+$('#uv').value,f=$('#ufrom').value,to=$('#uto').value;let r;
   if(t==='temp'){let c;if(f==='摄氏度')c=v;else if(f==='华氏度')c=(v-32)*5/9;else c=v-273.15;
    r=to==='摄氏度'?c:to==='华氏度'?c*9/5+32:c+273.15}
   else{const u=U[t].u;r=v*u[f]/u[to]}
   $('#ur').textContent=(Math.abs(r)>=1e-4&&Math.abs(r)<1e12?+(r.toPrecision(10)):r)+' '+to}
  $('#utype').onchange=fill;['uv','ufrom','uto'].forEach(id=>$('#'+id).addEventListener('input',conv));fill();
 }});

// 7 人民币大写
add({id:'rmb',ic:'💰',name:'人民币大写',cat:'计算',desc:'金额转中文大写（报销、财务用）。',
 run(){mBody.innerHTML=`<label class="lb">输入金额（元）</label><input class="ti" id="v" placeholder="例如 12345.67" value="12345.67"><div class="out"><label class="lb">中文大写</label><textarea id="out" readonly style="min-height:80px"></textarea><div class="row"><button class="btn sm" onclick="copy($('#out').value)">复制</button></div></div>`;
  function up(n){const digit='零壹贰叁肆伍陆柒捌玖'.split(''),unit=['','拾','佰','仟'],big=['','万','亿','兆'];
   n=String(n).replace(/,/g,'');if(!/^\d+(\.\d{1,2})?$/.test(n))return '请输入有效金额';
   let [int,dec]=n.split('.');dec=dec||'';
   let s='';for(let i=0;i<int.length;i++){const d=+int[i],pos=int.length-1-i,sec=Math.floor(pos/4),p=pos%4;
    if(d===0){if(p===0&&s&&!s.endsWith('零'))s+='零'}else{s+=digit[d]+unit[p]}
    if(p===0&&sec>0)s+=big[sec]}
   s=s.replace(/零+/g,'零').replace(/零$|零(万|亿|兆)/g,'$1')||'零';
   let r=s+'元';if(dec){if(dec[0]!=='0')r+=digit[+dec[0]]+'角';if(dec[1])r+=digit[+dec[1]]+'分'}else r+='整';return r}
  $('#v').addEventListener('input',()=>$('#out').value=up($('#v').value));$('#out').value=up($('#v').value);
 }});

/* ================= 文本 ================= */

// 8 字数统计
add({id:'count',ic:'📝',name:'字数统计',cat:'文本',desc:'字符、中文字、单词、行数、字节、阅读时长。',
 run(){mBody.innerHTML=`<textarea id="in" placeholder="输入或粘贴文本…"></textarea><div class="stat-grid" id="stats"></div>`;
  function cnt(){const t=$('#in').value;const cn=(t.match(/[\u4e00-\u9fa5]/g)||[]).length;const en=(t.match(/[a-zA-Z]+/g)||[]).length;
   const lines=t?t.split('\n').length:0;const para=t?t.split(/\n\s*\n/).filter(x=>x.trim()).length:0;
   const chars=t.length, noSpace=t.replace(/\s/g,'').length, bytes=new Blob([t]).size;
   const read=Math.ceil((cn+en*1.5)/400);
   const data=[['总字符',chars],['不含空格',noSpace],['中文字',cn],['英文词',en],['行数',lines],['段落',para],['字节',bytes],['阅读约',read+'分']];
   $('#stats').innerHTML=data.map(d=>`<div class="stat-box"><div class="n">${d[1]}</div><div class="l">${d[0]}</div></div>`).join('')}
  $('#in').addEventListener('input',cnt);cnt();
 }});

// 9 文本对比
add({id:'diff',ic:'🔀',name:'文本对比 Diff',cat:'文本',desc:'对比两段文本，标出增删行。',
 run(){mBody.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div><label class="lb">原始文本</label><textarea id="a" placeholder="原始…"></textarea></div><div><label class="lb">新文本</label><textarea id="b" placeholder="修改后…"></textarea></div></div>
  <div class="row"><button class="btn primary" id="go">对比</button></div><pre class="diff" id="out"></pre>`;
  $('#go').onclick=()=>{const A=$('#a').value.split('\n'),B=$('#b').value.split('\n');
   const n=A.length,m=B.length,dp=Array.from({length:n+1},()=>new Array(m+1).fill(0));
   for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=A[i]===B[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
   let i=0,j=0,html='';while(i<n&&j<m){if(A[i]===B[j]){html+=esc(A[i])+'\n';i++;j++}else if(dp[i+1][j]>=dp[i][j+1]){html+=`<span class="diff-del">- ${esc(A[i])}</span>\n`;i++}else{html+=`<span class="diff-add">+ ${esc(B[j])}</span>\n`;j++}}
   while(i<n){html+=`<span class="diff-del">- ${esc(A[i++])}</span>\n`}while(j<m){html+=`<span class="diff-add">+ ${esc(B[j++])}</span>\n`}
   $('#out').innerHTML=html||'<span style="color:var(--muted)">两段文本相同</span>'};
 }});

// 10 文本整理
add({id:'tidy',ic:'🧹',name:'文本整理',cat:'文本',desc:'去重、排序、打乱、去空行、去空格。',
 run(){mBody.innerHTML=ioHTML({ph:'每行一条内容…'});
  $('#actions').innerHTML=`<button class="btn" id="t1">去重</button><button class="btn" id="t2">去空行</button><button class="btn" id="t3">去首尾空格</button><button class="btn" id="t4">升序</button><button class="btn" id="t5">降序</button><button class="btn" id="t6">随机打乱</button><button class="btn primary" id="tg">整理</button>`;
  const lines=()=>$('#in').value.split('\n');
  $('#t1').onclick=()=>{const s=new Set();$('#in').value=lines().filter(l=>{if(s.has(l))return false;s.add(l);return true}).join('\n')};
  $('#t2').onclick=()=>$('#in').value=lines().filter(l=>l.trim()).join('\n');
  $('#t3').onclick=()=>$('#in').value=lines().map(l=>l.trim()).join('\n');
  $('#t4').onclick=()=>$('#in').value=lines().sort((a,b)=>a.localeCompare(b,'zh')).join('\n');
  $('#t5').onclick=()=>$('#in').value=lines().sort((a,b)=>b.localeCompare(a,'zh')).join('\n');
  $('#t6').onclick=()=>{const a=lines();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}$('#in').value=a.join('\n')};
  $('#tg').onclick=()=>{const s=new Set();const out=lines().map(l=>l.trim()).filter(l=>l&&!s.has(l)&&s.add(l)).join('\n');$('#in').value=out;$('#out').value=out;toast('已去重+去空行+去空格')};
 }});

// 11 大小写
add({id:'case',ic:'Aa',name:'大小写转换',cat:'文本',desc:'全大写、全小写、首字母大写、反转大小写。',
 run(){mBody.innerHTML=ioHTML({ph:'输入文本，例如 hello world'});
  $('#actions').innerHTML=`<div class="seg"><button data-m="upper">全部大写</button><button data-m="lower">全部小写</button><button data-m="title">单词首字母</button><button data-m="sentence">句首字母</button><button data-m="toggle">反转大小写</button></div>`;
  mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{const v=$('#in').value;
   let r='';switch(b.dataset.m){case'upper':r=v.toUpperCase();break;case'lower':r=v.toLowerCase();break;
   case'title':r=v.replace(/\b\w/g,c=>c.toUpperCase());break;
   case'sentence':r=v.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g,c=>c.toUpperCase());break;
   case'toggle':r=[...v].map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join('');break}
   $('#out').value=r});
 }});

// 12 查找替换
add({id:'replace',ic:'🔁',name:'批量查找替换',cat:'文本',desc:'批量替换文字，支持正则与大小写。',
 run(){mBody.innerHTML=`<textarea id="in" placeholder="粘贴原文…"></textarea>
  <div class="row" style="margin-top:14px"><input class="ti" id="find" placeholder="查找…" style="flex:1"><input class="ti" id="repl" placeholder="替换为…" style="flex:1"></div>
  <div class="row"><label class="switch"><input type="checkbox" id="re"> 正则模式</label><label class="switch"><input type="checkbox" id="ci"> 区分大小写</label></div>
  <div class="row"><button class="btn primary" id="go">替换</button><span class="hint" id="cnt"></span></div>
  <div class="out"><label class="lb">结果</label><textarea id="out" readonly></textarea><div class="row"><button class="btn sm" onclick="copy($('#out').value)">复制结果</button></div></div>`;
  $('#go').onclick=()=>{const src=$('#in').value,f=$('#find').value;
   if(!f){$('#out').value=src;$('#cnt').textContent='';return}
   let out,n=0;
   try{
     if($('#re').checked){const re=new RegExp(f,'g'+($('#ci').checked?'':'i'));n=(src.match(re)||[]).length;out=src.replace(re,$('#repl').value)}
     else{const flags='g'+($('#ci').checked?'':'i');const re=new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),flags);n=(src.match(re)||[]).length;out=src.replace(re,$('#repl').value)}
     $('#out').value=out;$('#cnt').textContent=`已替换 ${n} 处`;
   }catch(e){$('#out').value='❌ 正则错误：'+e.message;$('#cnt').textContent=''}
  };
 }});

// 13 CSV ↔ JSON
add({id:'csvjson',ic:'📊',name:'CSV ⇄ JSON',cat:'文本',desc:'表格数据与 JSON 互转，带表头识别。',
 run(){mBody.innerHTML=`<div class="seg" style="margin-bottom:14px"><button class="on" data-m="c2j">CSV → JSON</button><button data-m="j2c">JSON → CSV</button></div>
  <textarea id="in" placeholder="CSV 或 JSON…" style="min-height:150px"></textarea>
  <div class="row"><button class="btn primary" id="go">转换</button><button class="btn sm" onclick="copy($('#out').value)">复制</button></div>
  <div class="out"><label class="lb">结果</label><textarea id="out" readonly></textarea></div>`;
  let mode='c2j';mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{mBody.querySelectorAll('.seg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mode=b.dataset.m});
  function parseCSV(text,delim){const rows=[];let row=[],cur='',q=false;
   for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
    else{if(c==='"')q=true;else if(c===delim){row.push(cur);cur=''}else if(c==='\n'){row.push(cur);rows.push(row);row=[];cur=''}else if(c==='\r'){}else cur+=c}}
   if(cur!==''||row.length){row.push(cur);rows.push(row)}
   return rows.filter(r=>r.length>1||(r[0]!==''&&r[0]!==undefined))}
  function toCSV(arr){if(!Array.isArray(arr)||!arr.length)throw new Error('需要一个非空 JSON 数组');
   const keys=[...new Set(arr.flatMap(o=>Object.keys(o)))];
   const es=v=>{v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
   return [keys.join(',')].concat(arr.map(o=>keys.map(k=>es(o[k])).join(','))).join('\n')}
  $('#go').onclick=()=>{try{
   if(mode==='c2j'){const t=$('#in').value.trim();const d=t.includes('\t')?'\t':t.includes(';')?';':',';
    const rows=parseCSV(t,d);if(rows.length<2)throw new Error('至少需要表头 + 一行数据');
    const head=rows[0];const arr=rows.slice(1).map(r=>{const o={};head.forEach((h,i)=>o[h.trim()]=r[i]??'');return o});
    $('#out').value=JSON.stringify(arr,null,2)}
   else{const arr=JSON.parse($('#in').value);$('#out').value=toCSV(arr)}
  }catch(e){$('#out').value='❌ '+e.message}};
 }});

// 14 Markdown 预览
add({id:'markdown',ic:'📄',name:'Markdown 预览',cat:'文本',desc:'实时渲染 Markdown，可导出 HTML。',
 run(){mBody.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
   <div><label class="lb">Markdown</label><textarea id="in" style="min-height:320px" placeholder="# 标题&#10;&#10;正文 **加粗** _斜体_&#10;&#10;- 列表项&#10;- 列表项"></textarea></div>
   <div><label class="lb">预览</label><div class="md-preview" id="prev" style="height:320px;overflow:auto;background:var(--bg);border:1px solid var(--line);border-radius:11px;padding:14px"></div></div>
  </div>
  <div class="row"><button class="btn primary" id="dl">导出 HTML</button><button class="btn sm" onclick="copy($('#in').value)">复制 Markdown</button></div>`;
  const render=()=>{const t=$('#in').value;try{$('#prev').innerHTML=typeof marked!=='undefined'?marked.parse(t):'<span style="color:#f87171">渲染库未加载</span>'}catch(e){$('#prev').textContent='渲染失败：'+e.message}};
  let tm; $('#in').addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(render,120)});render();
  $('#dl').onclick=()=>{const html=`<!DOCTYPE html><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.7;color:#222}pre{background:#f5f5f5;padding:12px;border-radius:8px;overflow:auto}code{background:#f0f0f0;padding:2px 5px;border-radius:4px}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px 10px}</style>`+'<body>'+$('#prev').innerHTML+'</body>';
   const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download='document.html';a.click()};
 }});

/* ================= 图片 ================= */

// 15 图片压缩
add({id:'imgc',ic:'🗜️',name:'图片压缩 / 转换',cat:'图片',desc:'调质量与尺寸，转 JPG/WebP/PNG，纯本地。',
 run(){mBody.innerHTML=`<label class="lb">选择图片</label><input type="file" id="f" accept="image/*" class="ti">
  <label class="lb">输出格式</label><select id="fmt"><option value="image/webp">WebP（最小）</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select>
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

// 16 图片改尺寸
add({id:'resize',ic:'✂️',name:'图片改尺寸',cat:'图片',desc:'按宽高等比缩放图片，本地处理。',
 run(){mBody.innerHTML=`<label class="lb">选择图片</label><input type="file" id="f" accept="image/*" class="ti">
  <div class="row"><label class="lb" style="margin:0">宽度</label><input class="ti" id="w" type="number" placeholder="宽 px" style="width:120px"><label class="lb" style="margin:0">高度</label><input class="ti" id="h" type="number" placeholder="高 px" style="width:120px"></div>
  <label class="switch"><input type="checkbox" id="lock" checked> 锁定宽高比例</label>
  <div class="row"><button class="btn primary" id="dl">生成并下载</button><span class="hint" id="info"></span></div>
  <div class="qr-wrap"><img id="prev" style="max-width:100%;max-height:260px;border-radius:12px;display:none"></div>`;
  let img,ratio=1;
  $('#f').onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{img=new Image();img.onload=()=>{ratio=img.width/img.height;$('#w').value=img.width;$('#h').value=img.height;$('#prev').src=img.src;$('#prev').style.display='block';$('#info').textContent=`原图：${img.width}×${img.height}，${(file.size/1024).toFixed(1)} KB`};img.src=r.result};r.readAsDataURL(file)};
  $('#w').addEventListener('input',()=>{if($('#lock').checked&&img&&$('#w').value)$('#h').value=Math.round($('#w').value/ratio)});
  $('#h').addEventListener('input',()=>{if($('#lock').checked&&img&&$('#h').value)$('#w').value=Math.round($('#h').value*ratio)});
  $('#dl').onclick=()=>{if(!img){toast('请先选择图片');return}const cw=+$('#w').value||img.width,ch=+$('#h').value||img.height;
   const c=document.createElement('canvas');c.width=cw;c.height=ch;c.getContext('2d').drawImage(img,0,0,cw,ch);
   const a=document.createElement('a');a.download='resized.png';a.href=c.toDataURL('image/png');a.click();$('#info').textContent=`已生成：${cw}×${ch}`};
 }});

// 17 二维码生成
add({id:'qr',ic:'▦',name:'二维码生成',cat:'图片',desc:'文本 / 网址 / WiFi / 名片，可下载。',
 run(){mBody.innerHTML=`<label class="lb">类型</label><div class="seg" id="qtype"><button class="on" data-t="text">文本 / 网址</button><button data-t="wifi">WiFi</button><button data-t="vcard">名片</button></div>
  <div id="qform"></div>
  <div class="row" style="margin-top:14px"><label class="lb" style="margin:0">前景</label><input type="color" id="fg" value="#000000" style="width:52px;height:38px;border:none;background:none;cursor:pointer"><label class="lb" style="margin:0">背景</label><input type="color" id="bg" value="#ffffff" style="width:52px;height:38px;border:none;background:none;cursor:pointer"><button class="btn primary" id="go">生成</button><button class="btn" id="dl">下载 PNG</button></div>
  <div class="qr-wrap"><div id="qrcode"></div><div class="hint">扫码即可查看内容</div></div>`;
  let type='text';
  const form=()=>{
   if(type==='text')$('#qform').innerHTML=`<input class="ti" id="t1" placeholder="https://zqf.ltd" value="https://zqf.ltd">`;
   else if(type==='wifi')$('#qform').innerHTML=`<div class="row" style="margin-top:10px"><input class="ti" id="ssid" placeholder="WiFi 名称" style="flex:1"><input class="ti" id="pass" placeholder="密码" style="flex:1"></div><div class="row"><select id="enc"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">无密码</option></select></div>`;
   else $('#qform').innerHTML=`<div class="row" style="margin-top:10px"><input class="ti" id="vn" placeholder="姓名" style="flex:1"><input class="ti" id="vt" placeholder="电话" style="flex:1"></div><div class="row"><input class="ti" id="ve" placeholder="邮箱" style="flex:1"><input class="ti" id="vc" placeholder="公司" style="flex:1"></div>`;
   gen();
  };
  const payload=()=>{
   if(type==='wifi'){const s=$('#ssid')?.value||'',p=$('#pass')?.value||'',e=$('#enc')?.value||'WPA';return `WIFI:T:${e};S:${s};P:${p};;`}
   if(type==='vcard'){const n=$('#vn')?.value||'',t=$('#vt')?.value||'',e=$('#ve')?.value||'',c=$('#vc')?.value||'';return `BEGIN:VCARD\nVERSION:3.0\nFN:${n}\nTEL:${t}\nEMAIL:${e}\nORG:${c}\nEND:VCARD`}
   return $('#t1')?.value||' ';
  };
  let qr;
  function gen(){const box=$('#qrcode');if(!box)return;box.innerHTML='';try{qr=new QRCode(box,{text:payload()||' ',width:240,height:240,colorDark:$('#fg').value,colorLight:$('#bg').value,correctLevel:QRCode.CorrectLevel.M})}catch(e){}}
  mBody.querySelectorAll('#qtype button').forEach(b=>b.onclick=()=>{mBody.querySelectorAll('#qtype button').forEach(x=>x.classList.remove('on'));b.classList.add('on');type=b.dataset.t;form()});
  mBody.addEventListener('input',e=>{if(e.target.closest('#qform'))gen()});
  $('#fg').oninput=gen;$('#bg').oninput=gen;
  $('#dl').onclick=()=>{const box=$('#qrcode');const img=box.querySelector('img')||box.querySelector('canvas');if(!img){toast('请先生成');return}const a=document.createElement('a');a.download='qrcode.png';a.href=img.src||img.toDataURL();a.click()};
  form();
 }});

// 18 二维码识别
add({id:'qrdecode',ic:'📷',name:'二维码识别',cat:'图片',desc:'上传含二维码的图片，解析出内容。',
 run(){mBody.innerHTML=`<label class="lb">选择图片</label><input type="file" id="f" accept="image/*" class="ti">
  <div class="out"><label class="lb">识别结果</label><textarea id="out" readonly style="min-height:90px"></textarea><div class="row"><button class="btn sm" onclick="copy($('#out').value)">复制</button></div></div>`;
  $('#f').onchange=e=>{const file=e.target.files[0];if(!file)return;
   if(typeof jsQR==='undefined'){$('#out').value='识别库未加载';return}
   const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{
     const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
     const data=ctx.getImageData(0,0,c.width,c.height);const code=jsQR(data.data,c.width,c.height);
     $('#out').value=code?code.data:'未识别到二维码，请换一张更清晰、二维码占比更大的图片';
   };img.src=r.result};r.readAsDataURL(file)};
 }});

// 19 颜色工具
add({id:'color',ic:'🎨',name:'颜色转换',cat:'图片',desc:'HEX / RGB / HSL 互转，附配色预览。',
 run(){mBody.innerHTML=`<label class="lb">选择颜色</label><div class="row"><input type="color" id="picker" value="#7c5cff" style="width:60px;height:44px;border:none;background:none;cursor:pointer"><input class="ti" id="hex" value="#7C5CFF" style="flex:1" placeholder="#RRGGBB"></div>
  <div class="color-preview" id="prev"></div>
  <div class="stat-grid"><div class="stat-box"><div class="n" id="rgb" style="font-size:16px">-</div><div class="l">RGB</div></div><div class="stat-box"><div class="n" id="hsl" style="font-size:16px">-</div><div class="l">HSL</div></div></div>
  <div class="row"><button class="btn sm" onclick="copy($('#hex').value)">复制 HEX</button><button class="btn sm" onclick="copy($('#rgb').textContent)">复制 RGB</button></div>`;
  function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
  function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0,s=0,l=(mx+mn)/2;
   if(d){s=d/(1-Math.abs(2*l-1));if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}
   return [Math.round(h),Math.round(s*100),Math.round(l*100)]}
  function upd(){let hex=$('#hex').value.trim();if(!/^#?[0-9a-fA-F]{6}$|^#?[0-9a-fA-F]{3}$/.test(hex))return;
   if(hex[0]!=='#')hex='#'+hex;$('#prev').style.background=hex;$('#picker').value=hex;
   const [r,g,b]=hex2rgb(hex);$('#rgb').textContent=`${r}, ${g}, ${b}`;const [h,s,l]=rgb2hsl(r,g,b);$('#hsl').textContent=`${h}°, ${s}%, ${l}%`}
  $('#hex').addEventListener('input',upd);$('#picker').addEventListener('input',e=>{$('#hex').value=e.target.value.toUpperCase();upd()});upd();
 }});

/* ================= 效率 ================= */

// 20 密码生成
add({id:'pwd',ic:'🔐',name:'密码生成器',cat:'效率',desc:'生成高强度随机密码，可自定义长度与字符。',
 run(){mBody.innerHTML=`<label class="lb">密码长度：<span id="lenV" style="color:var(--c)">16</span></label><input type="range" id="len" min="6" max="64" value="16" style="width:100%;accent-color:var(--a)">
  <div class="row" style="margin-top:16px"><label class="switch"><input type="checkbox" id="low" checked> 小写</label><label class="switch"><input type="checkbox" id="up" checked> 大写</label><label class="switch"><input type="checkbox" id="dig" checked> 数字</label><label class="switch"><input type="checkbox" id="sym" checked> 符号</label></div>
  <div class="row"><button class="btn primary" id="go">生成密码</button><button class="btn" onclick="copy($('#out').value)">复制</button></div>
  <div class="out"><input class="ti" id="out" readonly style="font-size:20px;letter-spacing:.1em"></div><div class="hint" id="strength"></div>`;
  function gen(){let pool='';if($('#low').checked)pool+='abcdefghijklmnopqrstuvwxyz';if($('#up').checked)pool+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';if($('#dig').checked)pool+='0123456789';if($('#sym').checked)pool+='!@#$%^&*()-_=+[]{}?';
   if(!pool){$('#out').value='请至少选择一种字符';return}const n=+$('#len').value;const arr=new Uint32Array(n);crypto.getRandomValues(arr);$('#out').value=[...arr].map(x=>pool[x%pool.length]).join('');
   const s=n>=16&&$('#sym').checked&&$('#dig').checked?'🔒 非常强':n>=12?'🔐 强':'⚠️ 一般';$('#strength').textContent='强度：'+s}
  $('#len').oninput=e=>{$('#lenV').textContent=e.target.value;gen()};$('#go').onclick=gen;['low','up','dig','sym'].forEach(id=>$('#'+id).onchange=gen);gen();
 }});

// 21 随机抽签
add({id:'picker',ic:'🎯',name:'随机抽签 / 分组',cat:'效率',desc:'从名单抽人、随机分组、打乱顺序。',
 run(){mBody.innerHTML=`<label class="lb">名单（每行一个）</label><textarea id="in" placeholder="张三&#10;李四&#10;王五…"></textarea>
  <div class="row"><label class="lb" style="margin:0">抽取人数</label><input class="ti" id="n" type="number" value="1" style="width:90px"><label class="lb" style="margin:0">或分成</label><input class="ti" id="g" type="number" placeholder="组数" style="width:90px"></div>
  <div class="row"><button class="btn primary" id="pick">抽签</button><button class="btn" id="group">随机分组</button><button class="btn" id="shuffle">打乱顺序</button></div>
  <div class="out"><label class="lb">结果</label><textarea id="out" readonly style="min-height:120px"></textarea></div>`;
  const list=()=>$('#in').value.split('\n').map(s=>s.trim()).filter(Boolean);
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  $('#pick').onclick=()=>{const a=list();if(!a.length){toast('请先填写名单');return}const n=Math.min(+$('#n').value||1,a.length);
   $('#out').value='🎉 抽中：\n'+shuffle(a).slice(0,n).join('\n')};
  $('#group').onclick=()=>{const a=shuffle(list());const g=Math.max(1,+$('#g').value||2);const groups=Array.from({length:g},()=>[]);
   a.forEach((x,i)=>groups[i%g].push(x));$('#out').value=groups.map((arr,i)=>`第 ${i+1} 组：${arr.join('、')}`).join('\n')};
  $('#shuffle').onclick=()=>$('#out').value=shuffle(list()).join('\n');
 }});

// 22 临时记事本
add({id:'note',ic:'📒',name:'临时记事本',cat:'效率',desc:'随手记，自动保存在本机浏览器。',
 run(){mBody.innerHTML=`<textarea id="in" placeholder="随手记点什么…会自动保存在这台设备上" style="min-height:320px"></textarea><div class="row"><span class="hint" id="cnt"></span><button class="btn" id="clear">清空</button><button class="btn sm" onclick="copy($('#in').value)">复制</button></div>`;
  const K='toolkit_note';$('#in').value=localStorage.getItem(K)||'';
  const upd=()=>{$('#cnt').textContent=$('#in').value.length+' 字';localStorage.setItem(K,$('#in').value)};
  $('#in').addEventListener('input',upd);upd();
  $('#clear').onclick=()=>{if(confirm('确定清空记事本？')){$('#in').value='';upd()}};
 }});

// 23 文本朗读
add({id:'tts',ic:'🔊',name:'文本朗读',cat:'效率',desc:'用系统语音朗读文本，可调语速。',
 run(){mBody.innerHTML=`<textarea id="in" placeholder="粘贴要朗读的文字…" style="min-height:180px"></textarea>
  <div class="row"><label class="lb" style="margin:0">语速</label><input type="range" id="rate" min="0.5" max="2" step="0.1" value="1" style="flex:1;accent-color:var(--a)"><span class="hint" id="rv">1.0x</span></div>
  <div class="row"><button class="btn primary" id="speak">▶ 开始朗读</button><button class="btn" id="stop">■ 停止</button></div>
  <div class="hint">朗读使用浏览器内置语音，不会上传文本。</div>`;
  $('#rate').oninput=e=>$('#rv').textContent=e.target.value+'x';
  let u;
  $('#speak').onclick=()=>{const t=$('#in').value.trim();if(!t){toast('请输入文字');return}
   if(typeof speechSynthesis==='undefined'){toast('当前浏览器不支持语音朗读');return}
   speechSynthesis.cancel();u=new SpeechSynthesisUtterance(t);u.lang='zh-CN';u.rate=+$('#rate').value;speechSynthesis.speak(u)};
  $('#stop').onclick=()=>speechSynthesis.cancel();
 }});

// 24 JSON 格式化
add({id:'json',ic:'{ }',name:'JSON 格式化',cat:'效率',desc:'美化 / 压缩 / 校验 JSON。',
 run(){mBody.innerHTML=ioHTML({ph:'粘贴 JSON，例如 {"name":"zqf","ok":true}'});
  $('#actions').innerHTML=`<div class="seg"><button class="on" data-m="format">格式化</button><button data-m="min">压缩</button></div><button class="btn primary" id="go">处理</button><button class="btn" id="val">校验</button>`;
  let mode='format';
  mBody.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{mBody.querySelectorAll('.seg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');mode=b.dataset.m});
  $('#go').onclick=()=>{try{const obj=JSON.parse($('#in').value);$('#out').value=mode==='format'?JSON.stringify(obj,null,2):JSON.stringify(obj);toast('处理成功')}catch(e){$('#out').value='❌ JSON 无效：'+e.message}};
  $('#val').onclick=()=>{try{JSON.parse($('#in').value);toast('✓ 合法 JSON')}catch(e){toast('❌ 无效 JSON')}};
 }});

/* ---------- render ---------- */
function render(filter='',cat='全部'){
 const q=filter.trim().toLowerCase();
 const list=tools.filter(t=>(cat==='全部'||t.cat===cat)&&(!q||t.name.toLowerCase().includes(q)||t.desc.toLowerCase().includes(q)||t.cat.includes(q)));
 grid.innerHTML=list.map(t=>`<div class="tool" data-id="${t.id}"><span class="tag">${t.cat}</span><span class="ic">${t.ic}</span><h3>${t.name}</h3><p>${t.desc}</p></div>`).join('');
 $('#empty').style.display=list.length?'none':'block';
 grid.querySelectorAll('.tool').forEach(el=>el.onclick=()=>openTool(el.dataset.id));
}
function openTool(id){const t=tools.find(x=>x.id===id);mTitle.textContent=t.name;mIc.textContent=t.ic;mBody.innerHTML='';t.run();modal.classList.add('show')}
function closeTool(){modal.classList.remove('show');if(window.speechSynthesis)speechSynthesis.cancel()}
$('#mClose').onclick=closeTool;modal.onclick=e=>{if(e.target===modal)closeTool()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTool()});

const catNames=['全部','计算','文本','图片','效率'];
catsEl.innerHTML=catNames.map((c,i)=>`<div class="cat ${i===0?'on':''}" data-c="${c}">${c}</div>`).join('');
let curCat='全部';
catsEl.querySelectorAll('.cat').forEach(el=>el.onclick=()=>{catsEl.querySelectorAll('.cat').forEach(x=>x.classList.remove('on'));el.classList.add('on');curCat=el.dataset.c;render($('#search').value,curCat)});
$('#search').addEventListener('input',e=>render(e.target.value,curCat));
render();
