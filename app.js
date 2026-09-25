import{createClient}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const sb=createClient("https://bbwbaohkbxsjumkfknqn.supabase.co","sb_publishable_5mdYxS9nGFb3DoxbdsdiAg_dOCOnTP5"),WA="5493743512413",$=s=>document.querySelector(s);
let cats=[],subs=[],prods=[],vars=[],selectedCat=null,selectedSub=null,openCats=new Set(),cart=[];
const money=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Number(n)||0),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])),qty=()=>cart.reduce((a,x)=>a+x.n,0),isWholesale=()=>qty()>=10,unitPrice=p=>Number(isWholesale()?(p.wholesale_price??p.price):p.price)||0;
$("#wa").href="https://wa.me/"+WA+"?text="+encodeURIComponent("Hola CUBIC, quería hacer una consulta.");
function norm(v){v=(v||"").trim();if(!v)return"https://instagram.com/";if(v.startsWith("http"))return v;if(v.startsWith("@"))v=v.slice(1);return"https://instagram.com/"+v.replace(/^\/+|\/+$/g,"")}
function setLogo(url){const img=$("#siteLogo"),fb=$("#logoFallback");if(url){img.src=url;img.hidden=false;fb.hidden=true;img.onerror=()=>{img.hidden=true;fb.hidden=false}}else{img.hidden=true;fb.hidden=false}}
function openZoom(src){if(!src)return;$("#zoomImg").src=src;$("#lightbox").classList.add("open")}function closeZoom(){$("#lightbox").classList.remove("open");$("#zoomImg").src=""}
function openCart(){$("#shade").classList.add("open")}
function catLabel(c){return c.slug==="graficas-de-motos"?"GRÁFICAS SIMIL ORIGINALES":String(c.name||"").toUpperCase()}
function updateHero(){
 const c=cats.find(x=>x.id===selectedCat),s=subs.find(x=>x.id===selectedSub);
 if(!c)return;
 if(c.slug==="graficas-de-motos"){
   $("#heroTitle").textContent=s?s.name:"Gráficas de motos simil originales";
   $("#heroSubtitle").textContent=s?"Explorá los modelos disponibles de "+s.name+".":"Elegí tu modelo y variante. Trabajamos a pedido.";
   $("#heroExtra").textContent="Si no encontrás el modelo que buscás, no dudes en consultarnos.";
   $("#heroBadge").textContent="10 o más gráficas = precio mayorista";
 }else if(c.slug==="remeras"){
   $("#heroTitle").textContent=s?s.name:"Remeras";
   $("#heroSubtitle").textContent=s?"Mirá los diseños disponibles en "+s.name+".":"Elegí la categoría y el diseño que buscás. Trabajamos a pedido.";
   $("#heroExtra").textContent="Si no encontrás lo que buscás, no dudes en consultarnos.";
   $("#heroBadge").textContent="Productos hechos a pedido";
 }else{
   $("#heroTitle").textContent=s?s.name:"Calcos";
   $("#heroSubtitle").textContent=s?"Mirá los diseños disponibles en "+s.name+".":"Elegí la categoría y el diseño que buscás. Trabajamos a pedido.";
   $("#heroExtra").textContent="Si no encontrás lo que buscás, no dudes en consultarnos.";
   $("#heroBadge").textContent="Diseños y opciones personalizadas";
 }
}
async function load(){
 const[a,b,c,d,e]=await Promise.all([
   sb.from("categories").select("*").eq("active",true).order("sort_order"),
   sb.from("subcategories").select("*").eq("active",true).order("sort_order"),
   sb.from("products").select("*").eq("active",true).order("sort_order"),
   sb.from("product_variants").select("*").eq("active",true).order("sort_order"),
   sb.from("site_settings").select("*")
 ]);
 cats=a.data||[];subs=b.data||[];prods=c.data||[];vars=d.data||[];
 const s=e.data||[];
 $("#ig").href=norm(s.find(x=>x.key==="instagram_url")?.value);
 setLogo(s.find(x=>x.key==="logo_url")?.value||"");
 const preferred=cats.find(x=>x.slug==="graficas-de-motos")||cats[0];
 if(!selectedCat&&preferred){selectedCat=preferred.id;openCats.add(preferred.id)}
 renderNav();updateHero();render();cartRender()
}
function renderNav(){
 const box=$("#catalogNav");box.innerHTML="";
 cats.forEach(c=>{
   const cs=subs.filter(s=>s.category_id===c.id),section=document.createElement("section");
   section.className="catalogSection"+(openCats.has(c.id)?" open":"")+(selectedCat===c.id?" active":"");
   section.innerHTML='<button type="button" class="catalogMain"><span>'+esc(catLabel(c))+'</span><span class="arrow">⌄</span></button><div class="catalogSubs"></div>';
   const main=section.querySelector(".catalogMain"),subBox=section.querySelector(".catalogSubs");
   main.onclick=()=>{
     selectedCat=c.id;selectedSub=null;
     if(openCats.has(c.id))openCats.delete(c.id);else openCats.add(c.id);
     renderNav();updateHero();render();
   };
   const all=document.createElement("button");all.className="nav"+(selectedCat===c.id&&!selectedSub?" on":"");all.innerHTML="<span>Ver todo</span><span>›</span>";
   all.onclick=()=>{selectedCat=c.id;selectedSub=null;openCats.add(c.id);renderNav();updateHero();render();if(innerWidth<=900)$("#catAside").classList.remove("open")};
   subBox.appendChild(all);
   if(!cs.length){const empty=document.createElement("div");empty.className="catalogEmpty";empty.textContent="Todavía no hay categorías cargadas.";subBox.appendChild(empty)}
   cs.forEach(s=>{const b=document.createElement("button");b.className="nav"+(selectedSub===s.id?" on":"");b.innerHTML="<span>"+esc(s.name)+"</span><span>›</span>";b.onclick=()=>{selectedCat=c.id;selectedSub=s.id;openCats.add(c.id);renderNav();updateHero();render();if(innerWidth<=900)$("#catAside").classList.remove("open")};subBox.appendChild(b)});
   box.appendChild(section);
 });
}
function render(){
 const q=$("#q").value.toLowerCase().trim();
 const list=prods.filter(p=>(!selectedCat||p.category_id===selectedCat)&&(!selectedSub||p.subcategory_id===selectedSub)&&(!q||[p.name,p.description,subs.find(s=>s.id===p.subcategory_id)?.name,cats.find(c=>c.id===p.category_id)?.name].join(" ").toLowerCase().includes(q)));
 const box=$("#products");box.innerHTML="";
 if(!list.length){box.innerHTML='<div class="empty">Todavía no hay productos cargados en esta sección.</div>';return}
 for(const p of list){
   const pv=vars.filter(v=>v.product_id===p.id),first=pv[0],wh=p.wholesale_price??p.price,el=document.createElement("article");el.className="card";el.dataset.v=first?.id||"";
   el.innerHTML='<div class="pic"><img loading="lazy" src="'+esc(first?.image_url||p.main_image_url||"")+'" alt="'+esc(p.name)+'"><span class="zoomHint">Tocá para ampliar</span></div><div class="body"><h3>'+esc(p.name)+'</h3><div class="muted">'+esc(subs.find(s=>s.id===p.subcategory_id)?.name||cats.find(c=>c.id===p.category_id)?.name||"")+'</div>'+(pv.length?'<div class="variants">'+pv.map((v,i)=>'<button class="variant '+(i?"":"on")+'" data-id="'+v.id+'" data-img="'+esc(v.image_url||p.main_image_url||"")+'">'+esc(v.name)+'</button>').join("")+'</div>':"")+'<div class="priceBlock"><div class="retail">Minorista: '+money(p.price)+'</div><div class="wholesale">Mayorista: '+money(wh)+'</div><div class="smallNote">Precio mayorista desde 10 unidades totales en el carrito.</div></div><button class="btn violet add">Agregar al carrito</button></div>';
   const img=el.querySelector(".pic img");el.querySelector(".pic").onclick=()=>openZoom(img.src);
   el.querySelectorAll(".variant").forEach(b=>b.onclick=e=>{e.stopPropagation();el.querySelectorAll(".variant").forEach(x=>x.classList.remove("on"));b.classList.add("on");el.dataset.v=b.dataset.id;img.src=b.dataset.img});
   el.querySelector(".add").onclick=()=>add(p.id,el.dataset.v);box.appendChild(el)
 }
}
function add(pid,vid){const k=pid+"::"+vid,x=cart.find(i=>i.k===k);x?x.n++:cart.push({k,pid,vid,n:1});cartRender();const f=$("#floatingCart");f.classList.remove("hasItems");void f.offsetWidth;f.classList.add("hasItems")}
function cartRender(){const q=qty(),wh=isWholesale();$("#cc").textContent=q;$("#fcc").textContent=q;const float=$("#floatingCart");float.setAttribute("aria-label",q?("Abrir carrito, "+q+" productos"):"Abrir carrito");const st=$("#cartStatus");st.className="cartStatus "+(wh?"wholesaleMode":"retailMode");st.innerHTML=wh?'<b>Precio mayorista activado</b><br><span class="muted">Tenés '+q+' unidades en el carrito.</span>':'<b>Precio minorista</b><br><span class="muted">Agregá '+(10-q)+' unidad'+(10-q===1?"":"es")+' más para acceder al precio mayorista.</span>';const box=$("#items");box.innerHTML=cart.length?"":"<p class='muted'>Todavía no agregaste productos.</p>";for(const i of cart){const p=prods.find(x=>x.id===i.pid),v=vars.find(x=>x.id===i.vid),u=unitPrice(p),d=document.createElement("div");d.className="cartItem";d.innerHTML='<img src="'+esc(v?.image_url||p?.main_image_url||"")+'"><div><b>'+esc(p?.name)+'</b><div class="muted">'+esc(v?.name||"")+'</div><div class="smallNote">'+(wh?"Mayorista":"Minorista")+': '+money(u)+' c/u</div><div class="qty"><button data-d="-1">−</button><span>'+i.n+'</span><button data-d="1">+</button></div></div><b>'+money(u*i.n)+'</b>';d.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{i.n+=Number(b.dataset.d);if(i.n<=0)cart=cart.filter(x=>x.k!==i.k);cartRender()});box.appendChild(d)}const t=cart.reduce((a,i)=>a+unitPrice(prods.find(p=>p.id===i.pid))*i.n,0);$("#total").textContent=money(t);const lines=["Hola CUBIC, quiero realizar este pedido:","",wh?"PRECIO MAYORISTA APLICADO (10+ unidades)":"PRECIO MINORISTA",""];for(const i of cart){const p=prods.find(x=>x.id===i.pid),v=vars.find(x=>x.id===i.vid),u=unitPrice(p);lines.push(i.n+" × "+p.name+" — "+money(u)+" c/u");if(v)lines.push("Variante: "+v.name);lines.push("Subtotal: "+money(u*i.n),"")}lines.push("Cantidad total: "+q+" unidades","TOTAL: "+money(t));$("#send").href=cart.length?"https://wa.me/"+WA+"?text="+encodeURIComponent(lines.join("\n")):"#";$("#send").style.pointerEvents=cart.length?"auto":"none";$("#send").style.opacity=cart.length?"1":".5"}
$("#q").oninput=render;$("#cartBtn").onclick=openCart;$("#floatingCart").onclick=openCart;$("#close").onclick=()=>$("#shade").classList.remove("open");$("#shade").onclick=e=>{if(e.target===$("#shade"))$("#shade").classList.remove("open")};$("#catToggle").onclick=()=>$("#catAside").classList.toggle("open");$("#zoomClose").onclick=closeZoom;$("#lightbox").onclick=e=>{if(e.target===$("#lightbox"))closeZoom()};document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeZoom();$("#shade").classList.remove("open")}});load();