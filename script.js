const products = [
  {id:"blueberry", name:"Joocy Basil Blueberry", flavour:"Blueberry", category:"fruit", price:30, image:"assets/blueberry.png"},
  {id:"greenapple", name:"Joocy Basil Green Apple", flavour:"Green Apple", category:"fruit", price:30, image:"assets/greenapple.png"},
  {id:"lemon", name:"Joocy Basil Lemon", flavour:"Lemon", category:"fruit", price:30, image:"assets/lemon.png"},
  {id:"lychee", name:"Joocy Basil Lychee", flavour:"Lychee", category:"fruit", price:35, image:"assets/lychee.png"},
  {id:"orange", name:"Joocy Basil Orange", flavour:"Orange", category:"fruit", price:30, image:"assets/orange.png"},
  {id:"rose-milk", name:"Joocy Basil Rose Milk", flavour:"Rose Milk", category:"milk", price:35, image:"assets/rose-milk.png"}
];

let activeFilter = "all";
let cart = JSON.parse(localStorage.getItem("greenNaturalCart") || "[]");

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");

function money(n){ return "₹" + n.toLocaleString("en-IN"); }

function visibleProducts(){
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  let list = products.filter(p =>
    (activeFilter === "all" || p.category === activeFilter) &&
    (p.name.toLowerCase().includes(q) || p.flavour.toLowerCase().includes(q))
  );
  const sort = document.getElementById("sortSelect").value;
  if(sort === "low") list.sort((a,b)=>a.price-b.price);
  if(sort === "high") list.sort((a,b)=>b.price-a.price);
  if(sort === "name") list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}

function renderProducts(){
  const list = visibleProducts();
  productGrid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image-wrap">
        <span class="badge">BASIL SEED</span>
        <img class="product-image" src="${p.image}" alt="${p.name}">
      </div>
      <div class="product-info">
        <span class="flavour">${p.flavour}</span>
        <h3>${p.name}</h3>
        <p>Refreshing basil seed drink. Add your preferred bottle size/price when finalizing your catalogue.</p>
        <div class="product-bottom">
          <div class="price">${money(p.price)} <small>/ bottle</small></div>
          <button class="add-btn" onclick="addToCart('${p.id}')">Add</button>
        </div>
      </div>
    </article>
  `).join("");
  emptyState.style.display = list.length ? "none" : "block";
}

function saveCart(){
  localStorage.setItem("greenNaturalCart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id){
  const item = cart.find(x=>x.id===id);
  if(item) item.qty++;
  else cart.push({id, qty:1});
  saveCart();
  openCart();
}

function changeQty(id, delta){
  const item = cart.find(x=>x.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(x=>x.id!==id);
  saveCart();
}

function removeItem(id){
  cart = cart.filter(x=>x.id!==id);
  saveCart();
}

function renderCart(){
  const totalQty = cart.reduce((s,x)=>s+x.qty,0);
  cartCount.textContent = totalQty;
  const items = document.getElementById("cartItems");

  if(!cart.length){
    items.innerHTML = `<div style="text-align:center;color:#6f786f;padding:45px 10px">Your cart is empty.<br><br>Add a drink to get started 🍹</div>`;
    document.getElementById("cartTotal").textContent = "₹0";
    return;
  }

  let total = 0;
  items.innerHTML = cart.map(item=>{
    const p = products.find(x=>x.id===item.id);
    const line = p.price * item.qty;
    total += line;
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div>
          <h4>${p.name}</h4>
          <p>${money(p.price)} / bottle</p>
          <div class="qty">
            <button onclick="changeQty('${p.id}',-1)">−</button>
            <strong>${item.qty}</strong>
            <button onclick="changeQty('${p.id}',1)">+</button>
            <button class="remove" onclick="removeItem('${p.id}')">Remove</button>
          </div>
        </div>
        <strong>${money(line)}</strong>
      </div>
    `;
  }).join("");
  document.getElementById("cartTotal").textContent = money(total);
}

function openCart(){
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  cartDrawer.setAttribute("aria-hidden","false");
}
function closeCart(){
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden","true");
}

function whatsappOrder(){
  if(!cart.length){
    alert("Your cart is empty.");
    return;
  }
  let message = "Hello GREEN NATURAL, I would like to place an order:%0A%0A";
  let total = 0;
  cart.forEach(item=>{
    const p = products.find(x=>x.id===item.id);
    total += p.price * item.qty;
    message += `• ${p.name} x ${item.qty} = ${money(p.price*item.qty)}%0A`;
  });
  message += `%0ATotal: ${money(total)}%0A%0AName:%0APhone:%0ADelivery Address:`;
  window.open("https://wa.me/919659391865?text=" + message, "_blank");
}

document.querySelectorAll(".category-card").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".category-card").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderProducts();
    document.getElementById("shop").scrollIntoView({behavior:"smooth"});
  });
});

document.getElementById("sortSelect").addEventListener("change",renderProducts);
document.getElementById("searchInput").addEventListener("input",renderProducts);
document.getElementById("clearSearch").addEventListener("click",()=>{
  document.getElementById("searchInput").value="";
  renderProducts();
});
document.getElementById("searchBtn").addEventListener("click",()=>{
  document.getElementById("searchPanel").classList.toggle("open");
  if(document.getElementById("searchPanel").classList.contains("open"))
    document.getElementById("searchInput").focus();
});
document.getElementById("cartBtn").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
document.getElementById("continueBtn").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
document.getElementById("checkoutBtn").addEventListener("click",whatsappOrder);
document.getElementById("whatsappContact").addEventListener("click",()=>{
  window.open("https://wa.me/919659391865?text=Hello%20GREEN%20NATURAL,%20I%20would%20like%20to%20know%20more%20about%20your%20products.", "_blank");
});
document.getElementById("menuBtn").addEventListener("click",()=>{
  document.getElementById("mobileMenu").classList.toggle("open");
});
document.querySelectorAll(".mobile-menu a").forEach(a=>a.addEventListener("click",()=>{
  document.getElementById("mobileMenu").classList.remove("open");
}));

renderProducts();
renderCart();
