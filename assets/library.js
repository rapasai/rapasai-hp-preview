const state={map:null,articles:[],selected:null};
const $=s=>document.querySelector(s);
function byId(id){return state.map.shelves.find(s=>s.id===id)}
function renderMap(){
  const canvas=$('#mapCanvas'),svg=$('#roads');
  svg.innerHTML='';
  state.map.roads.forEach(r=>{
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',r.path); path.setAttribute('class',`road ${r.strength||''}`); svg.appendChild(path);
  });
  state.map.shelves.forEach(s=>{
    const b=document.createElement('button'); b.className='shelf-node'; b.style.left=s.x+'px'; b.style.top=s.y+'px'; b.dataset.id=s.id;
    b.innerHTML=`<span class="shelf-name">${escapeHtml(s.short_name||s.name)}</span>`;
    b.addEventListener('click',e=>{e.stopPropagation();openShelf(s.id)}); canvas.appendChild(b);
  });
  state.map.roads.forEach(r=>{
    const sign=document.createElement('button'); sign.className='road-sign'; sign.style.left=r.sign_x+'px'; sign.style.top=r.sign_y+'px'; sign.textContent=r.sign;
    sign.addEventListener('click',e=>showSign(r,sign,e)); canvas.appendChild(sign);
  });
}
function showSign(r,el,e){
  e.stopPropagation(); const pop=$('#signPopover');
  pop.innerHTML=`<button class="sign-close" aria-label="閉じる">×</button><h3>${escapeHtml(r.sign)}</h3><p>${escapeHtml(r.detail)}</p>`;
  const canvas=$('#mapCanvas'),er=el.getBoundingClientRect(),cr=canvas.getBoundingClientRect();
  let left=er.left-cr.left+el.offsetWidth/2-180; let top=er.bottom-cr.top+14;
  left=Math.max(12,Math.min(left,canvas.clientWidth-372)); top=Math.max(12,Math.min(top,canvas.clientHeight-180));
  pop.style.left=left+'px';pop.style.top=top+'px';pop.classList.add('open');
  pop.querySelector('.sign-close').onclick=()=>pop.classList.remove('open');
}
function openShelf(id){
  state.selected=id; const s=byId(id); if(!s)return; $('#signPopover').classList.remove('open');
  $('#shelfTitle').textContent=s.name; $('#shelfQuestion').textContent=s.description||'';
  const books=state.articles.filter(a=>a.category===id).sort((a,b)=>(a.id||0)-(b.id||0)); const grid=$('#bookGrid');grid.innerHTML='';
  if(!books.length){grid.innerHTML='<div class="empty">この本棚には、まだ記事がありません。</div>';}else books.forEach(a=>grid.appendChild(bookCard(a)));
  renderRoadLinks(id); const view=$('#shelfView');view.classList.add('open');view.scrollIntoView({behavior:'smooth',block:'start'});
}
function bookCard(a){
  const art=document.createElement('article');art.className='book';const band=state.map.bands?.[String(a.id)]||a.recommendation||'';
  art.innerHTML=`<a href="${escapeAttr(a.url||'#')}" target="_blank" rel="noopener"><div class="cover-wrap">${a.cover?`<img class="cover" src="${escapeAttr(a.cover)}" alt="">`:'<div class="cover"></div>'}${a.note_money_pickup?'<span class="pickup">🌸 noteマネー</span>':''}</div><div class="book-title">${escapeHtml(a.title||'')}</div>${band?`<div class="band">${escapeHtml(band)}</div>`:''}</a>`;return art;
}
function renderRoadLinks(id){
  const roads=state.map.roads.filter(r=>r.from===id||r.to===id),box=$('#roadLinkList');box.innerHTML='';
  roads.forEach(r=>{const target=r.from===id?r.to:r.from,s=byId(target);if(!s)return;const b=document.createElement('button');b.className='road-link';b.textContent='→ '+(s.short_name||s.name);b.title=r.sign;b.onclick=()=>openShelf(target);box.appendChild(b)});
}
function escapeHtml(v=''){return String(v).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
function escapeAttr(v=''){return escapeHtml(v).replace(/'/g,'&#39;')}
async function init(){
 try{
  const [mapRes,articlesRes]=await Promise.all([fetch('./library_map.json',{cache:'no-store'}),fetch('../articles.json?v='+Date.now(),{cache:'no-store'})]);
  if(!mapRes.ok)throw new Error('library_map.jsonを読み込めません');if(!articlesRes.ok)throw new Error('articles.jsonを読み込めません');
  state.map=await mapRes.json();state.articles=await articlesRes.json();renderMap();
 }catch(err){$('#mapCanvas').innerHTML=`<div class="empty">蔵書ナビを読み込めませんでした。${escapeHtml(err.message)}</div>`;console.error(err)}
}
document.addEventListener('DOMContentLoaded',()=>{$('#backMap').addEventListener('click',()=>document.querySelector('.map-shell').scrollIntoView({behavior:'smooth',block:'start'}));$('#mapCanvas').addEventListener('click',()=>$('#signPopover').classList.remove('open'));init()});
