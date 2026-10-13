(() => {
const CATS=['Abbigliamento','Scarpe','Oggetti 3D','NFC','Portachiavi','Accessori Moto 3D','Vario'];
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const local={products:'og_products',orders:'og_orders',messages:'og_messages'};
const read=k=>{try{return JSON.parse(localStorage.getItem(local[k])||'[]')}catch{return []}};
const write=(k,v)=>localStorage.setItem(local[k],JSON.stringify(v));
let products=read('products'),orders=read('orders'),messages=read('messages'),cart=JSON.parse(sessionStorage.getItem('og_cart')||'[]'),category='Tutti',query='';
let toastTimer;
function toast(s){const el=$('toast');if(!el)return;el.textContent=s;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
function theme(t){document.documentElement.dataset.theme=t;localStorage.setItem('og_theme',t)}
theme(localStorage.getItem('og_theme')||'dark');
const api=()=>window.SHOP_CONFIG?.API_URL||'';
async function send(action,payload){
 if(!api()){return {demo:true}}
 // Apps Script web app: POST as text/plain avoids preflight; backend returns JSON.
 const r=await fetch(api(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload})});
 if(!r.ok)throw new Error('Connessione al server non riuscita');
 const d=await r.json();if(!d.ok)throw new Error(d.error||'Errore server');return d;
}
async function syncProducts(){if(!api())return;try{const r=await fetch(api()+'?action=products');const d=await r.json();if(d.ok){products=d.products||[];write('products',products);renderProducts()}}catch(e){console.warn(e)}}
function getAvailable(p){return p.available!==false&&Number(p.quantity)>0}
function renderProducts(){
 const grid=$('productGrid');if(!grid)return;
 let list=products.filter(p=>(category==='Tutti'||p.category===category)&&(`${p.title} ${p.description} ${p.category}`).toLowerCase().includes(query));
 const sort=$('sortSelect')?.value||'featured';if(sort==='name')list.sort((a,b)=>a.title.localeCompare(b.title));if(sort==='price-low')list.sort((a,b)=>a.price-b.price);if(sort==='price-high')list.sort((a,b)=>b.price-a.price);
 $('sectionTitle').childNodes[0].textContent=category==='Tutti'?'Tutti i prodotti':category+' ';
 $('productCount').textContent=list.length;$('emptyState').classList.toggle('hidden',list.length>0);grid.innerHTML=list.map((p,i)=>`<article class="product-card" style="animation-delay:${Math.min(i,8)*35}ms"><div class="product-image">${p.image?`<img loading="lazy" src="${esc(p.image)}" alt="${esc(p.title)}" onerror="this.remove()">`:`<span class="product-placeholder">OG<span style="color:var(--accent)">.</span></span>`}<span class="product-badge">${getAvailable(p)?'Disponibile':'Non disponibile'}</span></div><div class="product-info"><span class="product-category">${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description||'')}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" data-add="${esc(p.id)}" ${!getAvailable(p)?'disabled':''}>${getAvailable(p)?'＋ Aggiungi':'Esaurito'}</button></div></div></article>`).join('');
}
function renderCart(){
 const items=$('cartItems');if(!items)return;
 const count=cart.reduce((n,x)=>n+x.qty,0);$('cartCount').textContent=count;$('drawerCount').textContent=count;
 items.innerHTML=cart.map(x=>{const p=products.find(p=>p.id===x.id)||x;return `<div class="cart-row"><div><h4>${esc(p.title)}</h4><small>${money(p.price)} · ${money(p.price*x.qty)}</small><div class="qty-controls"><button data-qty="${esc(x.id)}" data-delta="-1">−</button><span>${x.qty}</span><button data-qty="${esc(x.id)}" data-delta="1">＋</button></div></div><button class="remove-btn" data-remove="${esc(x.id)}">Rimuovi</button></div>`}).join('');
 $('cartEmpty').classList.toggle('hidden',cart.length>0);$('cartTotal').textContent=money(cart.reduce((n,x)=>n+(Number(products.find(p=>p.id===x.id)?.price)||0)*x.qty,0));sessionStorage.setItem('og_cart',JSON.stringify(cart));
}
function showCart(){ $('cartBackdrop').classList.remove('hidden');$('cartDrawer').classList.add('open') }
function hideCart(){ $('cartBackdrop').classList.add('hidden');$('cartDrawer').classList.remove('open') }
function openModal(id){$(id).classList.remove('hidden')}
function closeModal(id){$(id).classList.add('hidden')}
document.addEventListener('click',e=>{
 const cat=e.target.closest('[data-category]');if(cat){category=cat.dataset.category;document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active',b===cat));$('sidebar')?.classList.remove('open');renderProducts()}
 const add=e.target.closest('[data-add]');if(add){const p=products.find(p=>p.id===add.dataset.add);if(!p||!getAvailable(p))return;const item=cart.find(x=>x.id===p.id);if(item){if(item.qty>=Number(p.quantity)){toast('Quantità massima disponibile raggiunta');return}item.qty++}else cart.push({id:p.id,qty:1});renderCart();toast('Aggiunto al carrello')}
 const q=e.target.closest('[data-qty]');if(q){const item=cart.find(x=>x.id===q.dataset.qty),p=products.find(p=>p.id===q.dataset.qty);if(item){item.qty+=Number(q.dataset.delta);if(item.qty<=0)cart=cart.filter(x=>x.id!==q.dataset.qty);else if(p&&item.qty>Number(p.quantity)){item.qty=Number(p.quantity);toast('Quantità massima disponibile raggiunta')}renderCart()}}
 const rem=e.target.closest('[data-remove]');if(rem){cart=cart.filter(x=>x.id!==rem.dataset.remove);renderCart()}
});
$('search')?.addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderProducts()});
$('sortSelect')?.addEventListener('change',renderProducts);
$('themeToggle')?.addEventListener('click',()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
$('adminTheme')?.addEventListener('click',()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
$('menuToggle')?.addEventListener('click',()=>$('sidebar').classList.toggle('open'));
$('cartOpen')?.addEventListener('click',showCart);$('cartClose')?.addEventListener('click',hideCart);$('cartBackdrop')?.addEventListener('click',hideCart);
$('checkoutOpen')?.addEventListener('click',()=>{if(!cart.length){toast('Il carrello è vuoto');return}hideCart();openModal('checkoutModal')});
$('checkoutClose')?.addEventListener('click',()=>closeModal('checkoutModal'));
$('checkoutModal')?.addEventListener('click',e=>{if(e.target.id==='checkoutModal')closeModal('checkoutModal')});
$('messageForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;const v=Object.fromEntries(new FormData(f));const m={id:crypto.randomUUID(),...v,date:new Date().toISOString(),status:'Nuovo'};try{await send('message',{message:m});messages=read('messages');messages.unshift(m);write('messages',messages);$('messageStatus').textContent=api()?'Messaggio inviato.':'Messaggio salvato solo in questa demo: configura Google Sheets per riceverlo.';f.reset()}catch(err){$('messageStatus').textContent='Invio non riuscito. Riprova più tardi.'}});
$('checkoutForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!cart.length){$('checkoutStatus').textContent='Il carrello è vuoto.';return}const f=e.currentTarget,v=Object.fromEntries(new FormData(f));const items=cart.map(x=>{const p=products.find(p=>p.id===x.id);return {id:x.id,title:p?.title||x.title,price:Number(p?.price)||0,quantity:x.qty}});const order={id:crypto.randomUUID(),...v,items,total:items.reduce((n,x)=>n+x.price*x.quantity,0),date:new Date().toISOString(),status:'Da confermare'};try{await send('order',{order});orders=read('orders');orders.unshift(order);write('orders',orders);cart=[];renderCart();f.reset();$('checkoutStatus').textContent=api()?'Richiesta inviata! Ti contatteremo per confermare.':'Richiesta registrata solo in questa demo locale. Configura Google Sheets prima di ricevere ordini reali.';toast('Richiesta ordine registrata');setTimeout(()=>closeModal('checkoutModal'),1900)}catch(err){$('checkoutStatus').textContent='Invio non riuscito. Riprova più tardi.'}});
$('year')&&($('year').textContent=new Date().getFullYear());
renderProducts();renderCart();syncProducts();
window.ShopApp={read,write,send,toast,money,esc,get products(){return products},set products(v){products=v;write('products',v);renderProducts()},get orders(){return orders},set orders(v){orders=v;write('orders',v)},get messages(){return messages},set messages(v){messages=v;write('messages',v)}};
})();