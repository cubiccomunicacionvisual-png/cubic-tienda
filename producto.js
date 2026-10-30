import{createClient}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const sb=createClient("https://bbwbaohkbxsjumkfknqn.supabase.co","sb_publishable_5mdYxS9nGFb3DoxbdsdiAg_dOCOnTP5"),WA="5493743512413",$=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Number(n)||0);
let product=null,variants=[],selectedVariant=null,quantity=1;
$("#wa").href="https://wa.me/"+WA+"?text="+encodeURIComponent("Hola CUBIC, quería hacer una consulta.");
function norm(v){v=(v||"").trim();if(!v)return"https://instagram.com/";if(v.startsWith("http"))return v;if(v.startsWith("@"))v=v.slice(1);return"https://instagram.com/"+v.replace(/^\\/+|\\/+$/g,"")}
function setLogo(url){const img=$("#siteLogo"),fb=$("#logoFallback");if(url){img.src=url;img.hidden=false;fb.hidden=true;img.onerror=()=>{img.hidden=true;fb.hidden=false}}}
function imageFor(){return selectedVariant?.image_url||product?.main_image_url||""}
function setImage(src){$("#productImg").src=src||"";$("#zoomImg").src=src||""}
function selectVariant(v){selectedVariant=v;setImage(imageFor());document.querySelectorAll("[data-variant]").forEach(x=>x.classList.toggle("on",x.dataset.variant===v.id));updateOrder()}
function renderVariants(){
 const box=$("#variantButtons"),thumbs=$("#variantThumbs");
 if(!variants.length){$("#variantChoice").classList.add("hidden");thumbs.innerHTML="";return}
 $("#variantChoice").classList.remove("hidden");box.innerHTML="";thumbs.innerHTML="";
 variants.forEach(v=>{
   const b=document.createElement("button");b.type="button";b.className="variantBtn";b.dataset.variant=v.id;b.textContent=v.name;b.onclick=()=>selectVariant(v);box.appendChild(b);
   const t=document.createElement("button");t.type="button";t.className="thumb";t.dataset.variant=v.id;t.innerHTML='<img src="'+(v.image_url||product.main_image_url||"")+'" alt="">';t.onclick=()=>selectVariant(v);thumbs.appendChild(t)
 });
 selectVariant(variants[0])
}
function updateOrder(){
 $("#quantity").textContent=quantity;
 const wholesale=quantity>=10,unit=Number(wholesale?(product.wholesale_price??product.price):product.price)||0;
 $("#priceMode").textContent=(wholesale?"✓ Precio mayorista aplicado":"Precio minorista")+" · "+money(unit)+" c/u";
 const lines=["Hola CUBIC, quiero consultar/pedir este producto:","",product.name];
 if(selectedVariant)lines.push("Variante: "+selectedVariant.name);
 lines.push("Cantidad: "+quantity,"Precio: "+money(unit)+" c/u","Total: "+money(unit*quantity));
 $("#orderBtn").href="https://wa.me/"+WA+"?text="+encodeURIComponent(lines.join("\n"))
}
async function load(){
 const id=new URLSearchParams(location.search).get("id");
 if(!id){$("#loading").classList.add("hidden");$("#notFound").classList.remove("hidden");return}
 const[p,v,c,s,settings]=await Promise.all([
   sb.from("products").select("*").eq("id",id).maybeSingle(),
   sb.from("product_variants").select("*").eq("product_id",id).eq("active",true).order("sort_order"),
   sb.from("categories").select("*"),
   sb.from("subcategories").select("*"),
   sb.from("site_settings").select("*")
 ]);
 product=p.data;variants=v.data||[];
 const cfg=settings.data||[];$("#ig").href=norm(cfg.find(x=>x.key==="instagram_url")?.value);setLogo(cfg.find(x=>x.key==="logo_url")?.value||"");
 $("#loading").classList.add("hidden");
 if(!product){$("#notFound").classList.remove("hidden");return}
 const cat=(c.data||[]).find(x=>x.id===product.category_id),sub=(s.data||[]).find(x=>x.id===product.subcategory_id);
 document.title=product.name+" · CUBIC";
 $("#productDetail").classList.remove("hidden");$("#productName").textContent=product.name;$("#productDesc").textContent=product.description||"";
 $("#categoryName").textContent=[cat?.name,sub?.name].filter(Boolean).join(" · ");
 $("#retailPrice").textContent=money(product.price);$("#wholesalePrice").textContent=money(product.wholesale_price??product.price);
 setImage(product.main_image_url||variants[0]?.image_url||"");renderVariants();updateOrder()
}
$("#minus").onclick=()=>{quantity=Math.max(1,quantity-1);updateOrder()};$("#plus").onclick=()=>{quantity++;updateOrder()};
$("#mainPic").onclick=()=>$("#lightbox").classList.add("open");$("#zoomClose").onclick=()=>$("#lightbox").classList.remove("open");$("#lightbox").onclick=e=>{if(e.target===$("#lightbox"))$("#lightbox").classList.remove("open")};
load();