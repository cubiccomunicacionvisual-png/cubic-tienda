import{createClient}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const sb=createClient("https://bbwbaohkbxsjumkfknqn.supabase.co","sb_publishable_5mdYxS9nGFb3DoxbdsdiAg_dOCOnTP5"),$=s=>document.querySelector(s);
let user,cats=[],subs=[],prods=[],variants=[],draft=[],removedVariantIds=[],openBrands=new Set(),openMainCats=new Set();
const money=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Number(n)||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const catLabel=c=>c?.slug==="graficas-de-motos"?"Gráficas simil originales":c?.name||"";
async function canvasBlob(c,q){return new Promise((r,j)=>c.toBlob(b=>b?r(b):j(new Error("No se pudo optimizar la imagen.")),"image/webp",q))}
async function optimizeImage(f,max=1800,q=.84){if(!f)return null;const b=await createImageBitmap(f),s=Math.min(1,max/Math.max(b.width,b.height)),w=Math.max(1,Math.round(b.width*s)),h=Math.max(1,Math.round(b.height*s)),c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d",{alpha:true}).drawImage(b,0,0,w,h);const x=await canvasBlob(c,q);b.close?.();return new File([x],f.name.replace(/\.[^.]+$/,"")+".webp",{type:"image/webp"})}
async function upload(f,prefix=""){if(!f)return null;const o=await optimizeImage(f,prefix==="logo-"?700:1800,prefix==="logo-"?.9:.84),p=user.id+"/"+prefix+crypto.randomUUID()+".webp",r=await sb.storage.from("product-images").upload(p,o,{cacheControl:"31536000",contentType:"image/webp"});if(r.error)throw r.error;return sb.storage.from("product-images").getPublicUrl(p).data.publicUrl}
async function start(){const s=(await sb.auth.getSession()).data.session;user=s?.user;if(!user)return;const a=await sb.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();if(!a.data){$("#loginBox").classList.add("hidden");$("#pending").classList.remove("hidden");return}$("#loginBox").classList.add("hidden");$("#adm").classList.remove("hidden");await load()}
$("#login").onsubmit=async e=>{e.preventDefault();const r=await sb.auth.signInWithPassword({email:$("#email").value,password:$("#pass").value});$("#msg").textContent=r.error?r.error.message:"";$("#msg").className=r.error?"danger":"";if(!r.error)start()};
$("#logout").onclick=async()=>{await sb.auth.signOut();location.reload()};

async function load(){
 const[a,b,c,d,e]=await Promise.all([
   sb.from("categories").select("*").order("sort_order"),
   sb.from("subcategories").select("*").order("sort_order"),
   sb.from("products").select("*").order("created_at",{ascending:false}),
   sb.from("product_variants").select("*").order("sort_order"),
   sb.from("site_settings").select("*")
 ]);
 cats=a.data||[];subs=b.data||[];prods=c.data||[];variants=d.data||[];
 const settings=e.data||[];
 $("#igInput").value=settings.find(x=>x.key==="instagram_url")?.value||"";
 const logo=settings.find(x=>x.key==="logo_url")?.value||"";
 $("#logoPreview").src=logo||"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23111116'/%3E%3Ctext x='50%25' y='50%25' fill='white' font-size='28' text-anchor='middle' dominant-baseline='middle'%3ECUBIC%3C/text%3E%3C/svg%3E";
 const options=cats.map(c=>'<option value="'+c.id+'">'+esc(catLabel(c))+'</option>').join("");
 $("#subcatParent").innerHTML=options;$("#pcat").innerHTML=options;
 if(!$("#pcat").value&&cats[0])$("#pcat").value=cats[0].id;
 updateProductSubcats();renderSubcatList();renderProducts()
}
$("#logoFile").onchange=e=>{const f=e.target.files[0];if(f)$("#logoPreview").src=URL.createObjectURL(f)};
$("#logoForm").onsubmit=async e=>{e.preventDefault();const b=e.submitter,old=b.textContent;try{b.disabled=true;b.textContent="Comprimiendo y guardando...";const f=$("#logoFile").files[0],url=await upload(f,"logo-");const r=await sb.from("site_settings").upsert({key:"logo_url",value:url,updated_at:new Date().toISOString()});if(r.error)throw r.error;$("#logoPreview").src=url;$("#logoMsg").textContent="Logo actualizado. La tienda lo toma automáticamente.";$("#logoFile").value=""}catch(err){alert(err.message||err)}finally{b.disabled=false;b.textContent=old}};
$("#igForm").onsubmit=async e=>{e.preventDefault();const r=await sb.from("site_settings").upsert({key:"instagram_url",value:$("#igInput").value.trim(),updated_at:new Date().toISOString()});alert(r.error?r.error.message:"Instagram guardado.")};

function slugify(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
$("#subcatForm").onsubmit=async e=>{
 e.preventDefault();
 const parent=cats.find(c=>c.id===$("#subcatParent").value),name=$("#subcatName").value.trim();
 if(!parent||!name)return;
 const base=slugify(name),slug=parent.slug+"-"+base,order=subs.filter(s=>s.category_id===parent.id).length+1;
 const r=await sb.from("subcategories").insert({category_id:parent.id,name,slug,sort_order:order,active:true});
 if(r.error)return alert(r.error.message);
 $("#subcatName").value="";await load();alert("Categoría agregada en "+catLabel(parent)+".")
};
function renderSubcatList(){
 const box=$("#subcatList");box.innerHTML="";
 cats.forEach(c=>{const group=document.createElement("div"),list=subs.filter(s=>s.category_id===c.id);group.className="subcatGroup";group.innerHTML='<div class="subcatGroupTitle">'+esc(catLabel(c))+'</div>'+(list.length?list.map(s=>'<span class="subcatChip">'+esc(s.name)+'</span>').join(""):'<span class="muted">Sin categorías todavía.</span>');box.appendChild(group)})
}
function updateProductSubcats(selectedId=null){
 const catId=$("#pcat").value,list=subs.filter(s=>s.category_id===catId);
 $("#ps").innerHTML=list.map(s=>'<option value="'+s.id+'">'+esc(s.name)+'</option>').join("");
 if(selectedId&&list.some(s=>s.id===selectedId))$("#ps").value=selectedId;
 $("#ps").disabled=!list.length;
}
$("#pcat").onchange=()=>updateProductSubcats();

function previewFor(v){return v.preview_url||v.image_url||""}
function variantRows(){
 const b=$("#vrows");b.innerHTML="";
 if($("#pid").value&&draft.length){const n=document.createElement("div");n.className="editNotice";n.textContent="Estas son las variantes que ya tiene el producto. Podés cambiar el nombre, reemplazar la foto, eliminar una o agregar nuevas.";b.appendChild(n)}
 draft.forEach((v,i)=>{const r=document.createElement("div");r.className="vr";r.innerHTML='<img class="variantPreview" src="'+esc(previewFor(v))+'" alt=""><div><input class="vn" placeholder="Ej.: Roja" value="'+esc(v.name||"")+'"><div class="variantMeta">'+(v.id?"Variante actual":"Nueva variante")+'</div></div><input class="vf" type="file" accept="image/*"><button type="button" class="btn removeV">'+(v.id?"Eliminar":"Quitar")+'</button>';r.querySelector(".vn").oninput=e=>v.name=e.target.value;r.querySelector(".vf").onchange=e=>{v.file=e.target.files[0]||null;if(v.file){v.preview_url=URL.createObjectURL(v.file);r.querySelector(".variantPreview").src=v.preview_url}};r.querySelector(".removeV").onclick=()=>{if(v.id&&!confirm("¿Eliminar esta variante del producto?"))return;if(v.id)removedVariantIds.push(v.id);draft.splice(i,1);variantRows()};b.appendChild(r)})
}
$("#addV").onclick=()=>{draft.push({id:null,name:"",image_url:"",preview_url:"",file:null});variantRows()};

function clearForm(){
 $("#pf").reset();$("#pid").value="";$("#ft").textContent="Agregar producto";$("#pa").checked=true;draft=[];removedVariantIds=[];
 if(cats[0])$("#pcat").value=cats[0].id;updateProductSubcats();
 $("#mainImageCurrent").classList.add("hidden");$("#mainImagePreview").src="";variantRows()
}
$("#clear").onclick=clearForm;
$("#pi").onchange=e=>{const f=e.target.files[0];if(f){$("#mainImagePreview").src=URL.createObjectURL(f);$("#mainImageCurrent").classList.remove("hidden");$("#mainImageCurrent").querySelector("span").textContent="Nueva imagen principal seleccionada"}};

function editProduct(p){
 $("#pid").value=p.id;$("#ft").textContent="Editar producto · "+p.name;$("#pn").value=p.name;$("#pp").value=p.price;$("#pw").value=p.wholesale_price??p.price;
 $("#pcat").value=p.category_id;updateProductSubcats(p.subcategory_id);
 $("#pd").value=p.description||"";$("#pa").checked=p.active;removedVariantIds=[];
 draft=variants.filter(v=>v.product_id===p.id).map(v=>({id:v.id,name:v.name,image_url:v.image_url||"",preview_url:v.image_url||"",file:null,active:v.active,sort_order:v.sort_order}));
 if(p.main_image_url){$("#mainImagePreview").src=p.main_image_url;$("#mainImageCurrent").querySelector("span").textContent="Imagen principal actual";$("#mainImageCurrent").classList.remove("hidden")}else{$("#mainImageCurrent").classList.add("hidden");$("#mainImagePreview").src=""}
 variantRows();document.querySelector("#ft").scrollIntoView({behavior:"smooth",block:"start"})
}

function renderProductRow(p){
 const r=document.createElement("div");r.className="prodRow";
 r.innerHTML='<img src="'+esc(p.main_image_url||"")+'" alt=""><div><b>'+esc(p.name)+'</b><div class="muted">'+variants.filter(v=>v.product_id===p.id).length+' variante(s)</div><div>Minorista: '+money(p.price)+' · Mayorista: '+money(p.wholesale_price??p.price)+'</div></div><div class="prodActions"><button class="btn ed">Editar</button><button class="btn del">Eliminar</button></div>';
 r.querySelector(".ed").onclick=()=>editProduct(p);
 r.querySelector(".del").onclick=async()=>{if(!confirm("¿Eliminar "+p.name+" y sus variantes?"))return;const vr=await sb.from("product_variants").delete().eq("product_id",p.id);if(vr.error)return alert(vr.error.message);const pr=await sb.from("products").delete().eq("id",p.id);if(pr.error)return alert(pr.error.message);await load()};
 return r
}
function renderProducts(){
 const root=$("#plist");root.innerHTML="";
 if(!prods.length){root.innerHTML="<p class='muted'>Todavía no cargaste productos.</p>";return}
 cats.forEach(c=>{
   const catProducts=prods.filter(p=>p.category_id===c.id),main=document.createElement("section");
   main.className="mainCatSection"+(openMainCats.has(c.id)?" open":"");
   main.innerHTML='<button class="mainCatHead" type="button"><span>'+esc(catLabel(c))+' <span class="count">'+catProducts.length+'</span></span><span class="chev">⌄</span></button><div class="mainCatBody"></div>';
   const body=main.querySelector(".mainCatBody");
   main.querySelector(".mainCatHead").onclick=()=>{if(openMainCats.has(c.id))openMainCats.delete(c.id);else openMainCats.add(c.id);main.classList.toggle("open")};
   const catSubs=subs.filter(s=>s.category_id===c.id);
   if(!catSubs.length)body.innerHTML='<div class="brandEmpty">Todavía no creaste categorías dentro de esta pestaña.</div>';
   catSubs.forEach(s=>{
     const list=catProducts.filter(p=>p.subcategory_id===s.id),section=document.createElement("div");
     section.className="brandSection"+(openBrands.has(s.id)?" open":"");
     section.innerHTML='<button class="brandHead" type="button"><span class="brandHeadLeft"><span class="brandName">'+esc(s.name)+'</span><span class="count">'+list.length+'</span></span><span class="chev">⌄</span></button><div class="brandBody"></div>';
     const subBody=section.querySelector(".brandBody");
     section.querySelector(".brandHead").onclick=()=>{if(openBrands.has(s.id))openBrands.delete(s.id);else openBrands.add(s.id);section.classList.toggle("open")};
     if(!list.length)subBody.innerHTML='<div class="brandEmpty">No hay productos cargados en esta categoría.</div>';else list.forEach(p=>subBody.appendChild(renderProductRow(p)));
     body.appendChild(section)
   });
   root.appendChild(main)
 })
}

$("#pf").onsubmit=async e=>{
 e.preventDefault();const s=e.submitter,o=s?.textContent;
 try{
  if(s){s.disabled=true;s.textContent="Optimizando y guardando..."}
  if(!$("#ps").value)throw new Error("Primero creá y elegí una categoría dentro de la pestaña seleccionada.");
  const id=$("#pid").value,newMain=await upload($("#pi").files[0]),data={category_id:$("#pcat").value,subcategory_id:$("#ps").value,name:$("#pn").value.trim(),price:Number($("#pp").value),wholesale_price:Number($("#pw").value),description:$("#pd").value.trim(),active:$("#pa").checked};
  if(newMain)data.main_image_url=newMain;
  let pid=id;
  if(id){const r=await sb.from("products").update(data).eq("id",id);if(r.error)throw r.error}else{const r=await sb.from("products").insert(data).select("id").single();if(r.error)throw r.error;pid=r.data.id}
  for(const rid of removedVariantIds){const r=await sb.from("product_variants").delete().eq("id",rid);if(r.error)throw r.error}
  for(let i=0;i<draft.length;i++){const v=draft[i];if(!v.name.trim())continue;let image=v.image_url||"";if(v.file)image=await upload(v.file);if(v.id){const patch={name:v.name.trim(),sort_order:i+1};if(image)patch.image_url=image;const r=await sb.from("product_variants").update(patch).eq("id",v.id);if(r.error)throw r.error}else{if(!image)continue;const r=await sb.from("product_variants").insert({product_id:pid,name:v.name.trim(),image_url:image,sort_order:i+1,active:true});if(r.error)throw r.error}}
  clearForm();await load();alert("Producto guardado correctamente.")
 }catch(err){alert(err.message||err)}finally{if(s){s.disabled=false;s.textContent=o||"Guardar producto"}}
};
start();