import{createClient}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const sb=createClient(
  "https://bbwbaohkbxsjumkfknqn.supabase.co",
  "sb_publishable_5mdYxS9nGFb3DoxbdsdiAg_dOCOnTP5"
);
const WA="5493743512413",IS_PREVIEW=true,$=s=>document.querySelector(s);

let cats=[],subs=[],prods=[],vars=[],selectedCat=null,selectedSub=null,openCats=new Set(),cart=[],toastTimer;

const money=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Number(n)||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const qty=()=>cart.reduce((a,x)=>a+x.n,0);
const categoryQty=catId=>cart.reduce((a,i)=>{const p=prods.find(x=>x.id===i.pid);return a+(p?.category_id===catId?i.n:0)},0);
const isWholesaleFor=p=>!!p&&categoryQty(p.category_id)>=10;
const unitPrice=p=>Number(isWholesaleFor(p)?(p.wholesale_price??p.price):p.price)||0;

$("#wa").href="https://wa.me/"+WA+"?text="+encodeURIComponent("Hola CUBIC, quería hacer una consulta.");

function norm(v){
 v=(v||"").trim();
 if(!v)return"https://instagram.com/";
 if(v.startsWith("http"))return v;
 if(v.startsWith("@"))v=v.slice(1);
 return"https://instagram.com/"+v.replace(/^\/+|\/+$/g,"")
}
function setLogo(url){
 const img=$("#siteLogo"),fb=$("#logoFallback");
 if(url){
   img.src=url;img.hidden=false;fb.hidden=true;
   img.onerror=()=>{img.hidden=true;fb.hidden=false}
 }else{img.hidden=true;fb.hidden=false}
}
function catLabel(c){return c?.slug==="graficas-de-motos"?"GRÁFICAS SIMIL ORIGINALES":String(c?.name||"").toUpperCase()}
function catShort(c){
 if(c?.slug==="graficas-de-motos")return["GRÁFICAS","Simil originales"];
 if(c?.slug==="remeras")return["REMERAS","Diseños y personalizadas"];
 if(c?.slug==="calcos")return["CALCOS","Calcos y blisters"];
 return[String(c?.name||"").toUpperCase(),"Ver productos"]
}
function productImage(p){
 if(!p)return"";
 const first=vars.find(v=>v.product_id===p.id&&v.image_url);
 return first?.image_url||p.main_image_url||""
}
function openZoom(src){if(!src)return;$("#zoomImg").src=src;$("#lightbox").classList.add("open")}
function closeZoom(){$("#lightbox").classList.remove("open");$("#zoomImg").src=""}
function openCart(){
 $("#shade").classList.add("open");
 const d=$("#shade .drawer");
 d.classList.remove("opening");void d.offsetWidth;d.classList.add("opening");
 setTimeout(()=>d.classList.remove("opening"),320)
}

function getVisitorId(){
 let id=localStorage.getItem("cubic_visitor_id");
 if(!id){id=crypto.randomUUID();localStorage.setItem("cubic_visitor_id",id)}
 return id
}
function detectSource(){
 const url=new URL(location.href),explicit=url.searchParams.get("ref");
 if(explicit){
   const clean=explicit.trim().slice(0,80)||"Directo";
   sessionStorage.setItem("cubic_ref",clean);return clean
 }
 const saved=sessionStorage.getItem("cubic_ref");if(saved)return saved;
 try{
   const host=new URL(document.referrer).hostname.toLowerCase();
   if(!host)return"Directo";
   if(host.includes("instagram"))return"Instagram";
   if(host.includes("whatsapp")||host.includes("wa.me"))return"WhatsApp";
   if(host.includes("facebook")||host.includes("fb.com"))return"Facebook";
   if(host.includes("google"))return"Google";
   return host.slice(0,80)
 }catch{return"Directo"}
}
async function trackVisit(){
 if(IS_PREVIEW)return;
 try{await sb.from("page_visits").insert({visitor_id:getVisitorId(),source:detectSource(),path:(location.pathname+location.search).slice(0,300)})}catch{}
}

function updateHero(){
 const c=cats.find(x=>x.id===selectedCat),s=subs.find(x=>x.id===selectedSub);
 if(!c)return;
 if(c.slug==="graficas-de-motos"){
   $("#heroTitle").textContent=s?s.name:"Gráficas de motos simil originales";
   $("#heroSubtitle").textContent=s?"Explorá los modelos disponibles de "+s.name+".":"Elegí tu modelo y variante. Trabajamos a pedido.";
   $("#heroExtra").textContent="Si no encontrás el modelo que buscás, no dudes en consultarnos.";
   $("#heroBadge").textContent="10 o más gráficas = precio mayorista en gráficas";
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
 const settings=e.data||[];
 $("#ig").href=norm(settings.find(x=>x.key==="instagram_url")?.value);
 setLogo(settings.find(x=>x.key==="logo_url")?.value||"");
 const preferred=cats.find(x=>x.slug==="graficas-de-motos")||cats[0];
 if(!selectedCat&&preferred){selectedCat=preferred.id;openCats.add(preferred.id)}
 renderNav();renderQuickCategories();renderFeatured();updateHero();render();cartRender();
 requestAnimationFrame(setupReveal)
}

function selectCategory(catId,scroll=true){
 selectedCat=catId;selectedSub=null;openCats.add(catId);
 renderNav();updateHero();render();
 if(scroll)setTimeout(()=>$("#products")?.scrollIntoView({behavior:"smooth",block:"start"}),80)
}

function renderQuickCategories(){
 const markup=cats.map(c=>{
   const p=prods.find(x=>x.category_id===c.id&&productImage(x));
   const img=productImage(p),[title,sub]=catShort(c);
   return '<button class="quickCatCard" data-cat="'+c.id+'">'+
     (img?'<img src="'+esc(img)+'" alt="" loading="lazy">':'')+
     '<span class="quickCatText"><span><b>'+esc(title)+'</b><small>'+esc(sub)+'</small></span><span class="quickCatArrow">→</span></span></button>'
 }).join("");
 ["#quickCategoriesMobile","#quickCategoriesDesktop"].forEach(sel=>{
   const box=$(sel);if(!box)return;box.innerHTML=markup;
   box.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>selectCategory(b.dataset.cat,true))
 })
}

function renderFeatured(){
 const box=$("#featuredProducts");if(!box)return;
 const picks=[];
 cats.forEach(c=>picks.push(...prods.filter(p=>p.category_id===c.id).slice(0,3)));
 const seen=new Set(),list=picks.filter(p=>!seen.has(p.id)&&seen.add(p.id)).slice(0,9);
 if(!list.length){box.innerHTML='<p class="muted">Los productos destacados aparecerán acá.</p>';return}
 box.innerHTML="";
 list.forEach(p=>{
   const pv=vars.filter(v=>v.product_id===p.id),first=pv[0],img=first?.image_url||p.main_image_url||"",el=document.createElement("article");
   el.className="featuredCard";
   el.innerHTML='<div class="featuredPic"><img src="'+esc(img)+'" alt="'+esc(p.name)+'" loading="lazy"></div><div class="featuredBody"><b>'+esc(p.name)+'</b><div class="featuredPrice">'+money(p.price)+'</div><button class="btn violet featuredAdd">Agregar al carrito</button></div>';
   el.querySelector(".featuredPic").onclick=()=>openZoom(img);
   const btn=el.querySelector(".featuredAdd");
   btn.onclick=()=>add(p.id,first?.id||"",el.querySelector("img"),btn);
   box.appendChild(el)
 })
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
     renderNav();updateHero();render()
   };
   const all=document.createElement("button");
   all.className="nav"+(selectedCat===c.id&&!selectedSub?" on":"");
   all.innerHTML="<span>Ver todo</span><span>›</span>";
   all.onclick=()=>{selectedCat=c.id;selectedSub=null;openCats.add(c.id);renderNav();updateHero();render();if(innerWidth<=900)$("#catAside").classList.remove("open")};
   subBox.appendChild(all);
   if(!cs.length){
     const empty=document.createElement("div");empty.className="catalogEmpty";empty.textContent="Todavía no hay categorías cargadas.";subBox.appendChild(empty)
   }
   cs.forEach(s=>{
     const b=document.createElement("button");
     b.className="nav"+(selectedSub===s.id?" on":"");
     b.innerHTML="<span>"+esc(s.name)+"</span><span>›</span>";
     b.onclick=()=>{selectedCat=c.id;selectedSub=s.id;openCats.add(c.id);renderNav();updateHero();render();if(innerWidth<=900)$("#catAside").classList.remove("open")};
     subBox.appendChild(b)
   });
   box.appendChild(section)
 })
}

function swapImage(img,src){
 if(!src||img.src===src)return;
 img.classList.add("switching");
 const done=()=>{img.classList.remove("switching");img.onload=null};
 img.onload=done;img.src=src;setTimeout(done,350)
}

function render(){
 const q=$("#q").value.toLowerCase().trim();
 const list=prods.filter(p=>
   (!selectedCat||p.category_id===selectedCat)&&
   (!selectedSub||p.subcategory_id===selectedSub)&&
   (!q||[p.name,p.description,subs.find(s=>s.id===p.subcategory_id)?.name,cats.find(c=>c.id===p.category_id)?.name].join(" ").toLowerCase().includes(q))
 );
 const box=$("#products");box.innerHTML="";
 if(!list.length){box.innerHTML='<div class="empty reveal">Todavía no hay productos cargados en esta sección.</div>';setupReveal();return}
 for(const p of list){
   const pv=vars.filter(v=>v.product_id===p.id),first=pv[0],wh=p.wholesale_price??p.price,el=document.createElement("article");
   el.className="card reveal";el.dataset.v=first?.id||"";
   el.innerHTML='<div class="pic"><img loading="lazy" src="'+esc(first?.image_url||p.main_image_url||"")+'" alt="'+esc(p.name)+'"><span class="zoomHint">Tocá para ampliar</span></div><div class="body"><h3>'+esc(p.name)+'</h3><div class="muted">'+esc(subs.find(s=>s.id===p.subcategory_id)?.name||cats.find(c=>c.id===p.category_id)?.name||"")+'</div>'+
   (pv.length?'<div class="variants">'+pv.map((v,i)=>'<button class="variant '+(i?"":"on")+'" data-id="'+v.id+'" data-img="'+esc(v.image_url||p.main_image_url||"")+'">'+esc(v.name)+'</button>').join("")+'</div>':"")+
   '<div class="priceBlock"><div class="retail">Minorista: '+money(p.price)+'</div><div class="wholesale">Mayorista: '+money(wh)+'</div><div class="smallNote">Precio mayorista desde 10 unidades dentro de esta categoría.</div></div><button class="btn violet add">Agregar al carrito</button></div>';
   const img=el.querySelector(".pic img");
   el.querySelector(".pic").onclick=()=>openZoom(img.src);
   el.querySelectorAll(".variant").forEach(b=>b.onclick=e=>{
     e.stopPropagation();el.querySelectorAll(".variant").forEach(x=>x.classList.remove("on"));b.classList.add("on");el.dataset.v=b.dataset.id;swapImage(img,b.dataset.img)
   });
   const btn=el.querySelector(".add");
   btn.onclick=()=>add(p.id,el.dataset.v,img,btn);
   box.appendChild(el)
 }
 setupReveal()
}

function showCartToast(name){
 const t=$("#cartToast");$("#cartToastName").textContent=name||"";
 clearTimeout(toastTimer);t.classList.add("show");
 toastTimer=setTimeout(()=>t.classList.remove("show"),1500)
}
function flyToCart(img){
 if(!img?.getBoundingClientRect)return;
 const target=$("#floatingCart"),a=img.getBoundingClientRect(),b=target.getBoundingClientRect();
 const clone=img.cloneNode();clone.className="flyThumb";
 Object.assign(clone.style,{left:a.left+"px",top:a.top+"px",width:a.width+"px",height:a.height+"px"});
 document.body.appendChild(clone);
 const dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
 clone.animate([
   {transform:"translate(0,0) scale(1)",opacity:1},
   {transform:"translate("+dx+"px,"+dy+"px) scale(.18)",opacity:.3}
 ],{duration:520,easing:"cubic-bezier(.2,.75,.25,1)"});
 setTimeout(()=>clone.remove(),540)
}
function add(pid,vid,sourceImg=null,sourceBtn=null){
 const k=pid+"::"+vid,x=cart.find(i=>i.k===k),p=prods.find(x=>x.id===pid);
 x?x.n++:cart.push({k,pid,vid,n:1});
 if(sourceImg)flyToCart(sourceImg);
 if(sourceBtn){sourceBtn.classList.add("justAdded");setTimeout(()=>sourceBtn.classList.remove("justAdded"),420)}
 showCartToast(p?.name);
 cartRender();
 const f=$("#floatingCart");
 f.classList.remove("hasItems","countPop");void f.offsetWidth;f.classList.add("hasItems","countPop");
 setTimeout(()=>f.classList.remove("countPop"),450)
}

function cartRender(){
 const q=qty();
 $("#cc").textContent=q;$("#fcc").textContent=q;
 const float=$("#floatingCart");
 float.setAttribute("aria-label",q?("Abrir carrito, "+q+" productos"):"Abrir carrito");

 const catStates=cats.map(c=>({cat:c,n:categoryQty(c.id)})).filter(x=>x.n>0);
 const anyWholesale=catStates.some(x=>x.n>=10);
 const st=$("#cartStatus");
 st.className="cartStatus "+(anyWholesale?"wholesaleMode":"retailMode");

 if(!catStates.length){
   st.innerHTML='<b>Progreso hacia el mayorista</b><br><span class="muted">Cada categoría activa su precio mayorista al llegar a 10 unidades.</span>'
 }else{
   st.innerHTML='<b>Progreso hacia el mayorista</b><div class="categoryPriceStatus">'+catStates.map(x=>{
     const done=x.n>=10,left=Math.max(0,10-x.n),pct=Math.min(100,x.n*10);
     return '<div class="catProgress '+(done?'done':'')+'"><div class="catProgressTop"><b>'+esc(catLabel(x.cat))+'</b><span>'+(done?'✓ Mayorista activado':('Te faltan '+left))+' · '+x.n+'/10</span></div><div class="progressTrack"><div class="progressFill" style="width:'+pct+'%"></div></div></div>'
   }).join("")+'</div>'
 }

 const box=$("#items");
 box.innerHTML=cart.length?"":"<p class='muted'>Todavía no agregaste productos.</p>";
 for(const i of cart){
   const p=prods.find(x=>x.id===i.pid),v=vars.find(x=>x.id===i.vid),wh=isWholesaleFor(p),u=unitPrice(p),d=document.createElement("div");
   d.className="cartItem";
   d.innerHTML='<img src="'+esc(v?.image_url||p?.main_image_url||"")+'"><div><b>'+esc(p?.name)+'</b><div class="muted">'+esc(v?.name||"")+'</div><div class="smallNote">'+(wh?"Mayorista":"Minorista")+': '+money(u)+' c/u</div><div class="qty"><button data-d="-1">−</button><span>'+i.n+'</span><button data-d="1">+</button></div></div><b>'+money(u*i.n)+'</b>';
   d.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{i.n+=Number(b.dataset.d);if(i.n<=0)cart=cart.filter(x=>x.k!==i.k);cartRender()});
   box.appendChild(d)
 }

 const t=cart.reduce((a,i)=>a+unitPrice(prods.find(p=>p.id===i.pid))*i.n,0);
 $("#total").textContent=money(t);
 const lines=["Hola CUBIC, quiero realizar este pedido:","","PRECIOS CALCULADOS POR CATEGORÍA","Mayorista desde 10 unidades de la misma categoría.",""];
 for(const state of catStates){
   const wh=state.n>=10;
   lines.push(catLabel(state.cat)+" — "+state.n+" unidades — "+(wh?"PRECIO MAYORISTA":"PRECIO MINORISTA"),"");
   for(const i of cart){
     const p=prods.find(x=>x.id===i.pid);if(!p||p.category_id!==state.cat.id)continue;
     const v=vars.find(x=>x.id===i.vid),u=unitPrice(p);
     lines.push(i.n+" × "+p.name+" — "+money(u)+" c/u");
     if(v)lines.push("Variante: "+v.name);
     lines.push("Subtotal: "+money(u*i.n),"")
   }
 }
 lines.push("Cantidad total: "+q+" unidades","TOTAL: "+money(t));
 $("#send").href=cart.length?"https://wa.me/"+WA+"?text="+encodeURIComponent(lines.join("\n")):"#";
 $("#send").style.pointerEvents=cart.length?"auto":"none";
 $("#send").style.opacity=cart.length?"1":".5"
}

let revealObserver;
function setupReveal(){
 if(matchMedia("(prefers-reduced-motion: reduce)").matches){
   document.querySelectorAll(".reveal").forEach(x=>x.classList.add("in"));return
 }
 if(!revealObserver)revealObserver=new IntersectionObserver(entries=>{
   entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");revealObserver.unobserve(e.target)}})
 },{threshold:.08,rootMargin:"0px 0px -30px"});
 document.querySelectorAll(".reveal:not(.in)").forEach(x=>revealObserver.observe(x))
}

$("#q").oninput=render;
$("#cartBtn").onclick=openCart;
$("#floatingCart").onclick=openCart;
$("#close").onclick=()=>$("#shade").classList.remove("open");
$("#shade").onclick=e=>{if(e.target===$("#shade"))$("#shade").classList.remove("open")};
$("#catToggle").onclick=()=>$("#catAside").classList.toggle("open");
$("#zoomClose").onclick=closeZoom;
$("#lightbox").onclick=e=>{if(e.target===$("#lightbox"))closeZoom()};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeZoom();$("#shade").classList.remove("open")}});
trackVisit();load();