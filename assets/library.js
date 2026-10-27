const state={map:null,articles:[],selected:null};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
function byId(id){return state.map.settlements.find(s=>s.id===id)}
function point(s){return {x:s.x,y:s.y}}
function roadPath(a,b){
  const p1=point(a),p2=point(b),mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2;
  const bend=(p2.x-p1.x)*(p2.y-p1.y)>0?-6:6;
  return `M ${p1.x} ${p1.y} Q ${mx+bend} ${my-bend} ${p2.x} ${p2.y}`;
}
function signPosition(a,b,i){
  const x=(a.x+b.x)/2,y=(a.y+b.y)/2;
  const offsets=[[0,-4],[0,5],[2,0],[-2,2],[1,-3]];
  const o=offsets[i%offsets.length]; return {x:x+o[0],y:y+o[1]};
}
function renderMap(){
  const canvas=$('#mapCanvas'), svg=$('#roads');
  svg.innerHTML='';
  state.map.roads.forEach(r=>{
    const a=byId(r.from),b=byId(r.to); if(!a||!b)return;
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',roadPath(a,b)); path.setAttribute('class',`road ${r.strength||''}`); path.setAttribute('vector-effect','non-scaling-stroke'); svg.appendChild(path);
  });
  state.map.settlements.forEach(s=>{
    const b=document.createElement('button'); b.className='settlement'; b.style.left=s.x+'%'; b.style.top=s.y+'%'; b.dataset.id=s.id;
    b.innerHTML=`<span class="settlement-name">${escapeHtml(s.short_name||s.name)}</span><span class="settlement-question">${escapeHtml(s.question||'')}</span>`;
    b.addEventListener('click',()=>openVillage(s.id)); canvas.appendChild(b);
  });
  state.map.roads.forEach((r,i)=>{
    const a=byId(r.from),b=byId(r.to); if(!a||!b)return; const pos=signPosition(a,b,i);
    const sign=document.createElement('button'); sign.className='road-sign'; sign.style.left=pos.x+'%'; sign.style.top=pos.y+'%'; sign.textContent=r.sign; sign.addEventListener('click',e=>showSign(r,sign,e)); canvas.appendChild(sign);
  });
}
function showSign(r,el,e){
  e.stopPropagation(); const pop=$('#signPopover');
  pop.innerHTML=`<button class="sign-close" aria-label="閉じる">×</button><h3>${escapeHtml(r.sign)}</h3><p>${escapeHtml(r.detail)}</p>`;
  const canvas=$('#mapCanvas'),cr=canvas.getBoundingClientRect(),er=el.getBoundingClientRect();
  const left=Math.min(Math.max(er.left-cr.left,12),canvas.clientWidth-380); const top=Math.min(er.bottom-cr.top+9,canvas.clientHeight-180);
  pop.style.left=left+'px'; pop.style.top=top+'px'; pop.classList.add('open');
  pop.querySelector('.sign-close').onclick=()=>pop.classList.remove('open');
}
function openVillage(id){
  state.selected=id; const s=byId(id); if(!s)return;
  $('#signPopover').classList.remove('open');
  $('#villageTitle').textContent=s.name; $('#villageQuestion').textContent=s.question||'';
  const books=state.articles.filter(a=>a.category===id).sort((a,b)=>(a.id||0)-(b.id||0)); const grid=$('#bookGrid'); grid.innerHTML='';
  if(!books.length){grid.innerHTML='<div class="empty">この集落には、まだ記事がありません。</div>';} else books.forEach(a=>grid.appendChild(bookCard(a)));
  renderRoadLinks(id); const view=$('#villageView'); view.classList.add('open'); view.scrollIntoView({behavior:'smooth',block:'start'});
}
function bookCard(a){
  const art=document.createElement('article'); art.className='book'; const band=state.map.bands?.[String(a.id)]||a.recommendation||'';
  art.innerHTML=`<a href="${escapeAttr(a.url||'#')}" target="_blank" rel="noopener"><div class="cover-wrap">${a.cover?`<img class="cover" src="${escapeAttr(a.cover)}" alt="">`:'<div class="cover"></div>'}${a.note_money_pickup?'<span class="pickup">🌸 noteマネー</span>':''}</div><div class="book-title">${escapeHtml(a.title||'')}</div>${band?`<div class="band">${escapeHtml(band)}</div>`:''}</a>`; return art;
}
function renderRoadLinks(id){
  const roads=state.map.roads.filter(r=>r.from===id||r.to===id),box=$('#roadLinkList'); box.innerHTML='';
  roads.forEach(r=>{const target=r.from===id?r.to:r.from,s=byId(target); if(!s)return; const b=document.createElement('button'); b.className='road-link'; b.textContent='→ '+(s.short_name||s.name); b.title=r.sign; b.onclick=()=>openVillage(target); box.appendChild(b)});
}
function escapeHtml(v=''){return String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function escapeAttr(v=''){return escapeHtml(v).replace(/'/g,'&#39;')}
async function init(){
 try{
   const [mapRes,articlesRes]=await Promise.all([fetch('./library_map.json',{cache:'no-store'}),fetch('../articles.json?v='+Date.now(),{cache:'no-store'})]);
   if(!mapRes.ok)throw new Error('library_map.jsonを読み込めません'); if(!articlesRes.ok)throw new Error('articles.jsonを読み込めません');
   state.map=await mapRes.json(); state.articles=await articlesRes.json();
   $('#regionDescription').textContent=state.map.region.description; renderMap();
 }catch(err){$('#mapCanvas').innerHTML=`<div class="empty">蔵書ナビを読み込めませんでした。${escapeHtml(err.message)}</div>`; console.error(err)}
}
document.addEventListener('DOMContentLoaded',()=>{
 $('#backMap').addEventListener('click',()=>{document.querySelector('.map-shell').scrollIntoView({behavior:'smooth',block:'start'})});
 $('#mapCanvas').addEventListener('click',()=>$('#signPopover').classList.remove('open'));
 init();
});
