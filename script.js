/* ============================================================
   BRAZZAPHONE – script.js
   Catalogue · Panier · Commande · WhatsApp
   ============================================================ */

const WHATSAPP_NUMBER = "+242056145113";

/* ===== CATALOGUE — chargé depuis products.json ===== */
window.PRODUCTS = [];

/* ===== ÉTAT ===== */
let cart = JSON.parse(localStorage.getItem("bpCart") || "[]");
let currentFilter = "all";
let currentSearch  = "";

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", async () => {

  // Charger products.json (source unique de vérité)
  try {
    const res = await fetch("./products.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        window.PRODUCTS = data;
      }
    }
  } catch (e) {
    console.warn("Impossible de charger products.json :", e);
  }

  // Fallback localStorage uniquement si products.json est vide/inaccessible
  if (!window.PRODUCTS.length) {
    const saved = localStorage.getItem("bpAdminProducts");
    if (saved) {
      try { window.PRODUCTS = JSON.parse(saved); } catch (e) {}
    }
  }

  renderProducts(window.PRODUCTS);
  updateCartUI();

  const input = document.getElementById("searchInput");
  if (input) {
    input.addEventListener("input", e => {
      currentSearch = (e.target.value || "").toLowerCase().trim();
      applyFilters();
    });
  }
});

/* ===== RENDU PRODUITS ===== */
function renderProducts(list) {
  const grid  = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("productCount");

  grid.innerHTML = "";
  count.textContent = list.length + " produit(s)";

  if (list.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  list.forEach(p => {
    const badgeClass = p.category === "reconditionne" ? "badge-reconditionne"
                     : p.category === "accessoire"    ? "badge-accessoire"
                     : "";

    const oldPriceHTML = p.oldPrice
      ? `<span class="product-old-price">${fmt(p.oldPrice)}</span>` : "";

    const badgeHTML = p.badge
      ? `<span class="product-badge ${badgeClass}">${p.badge}</span>` : "";

    const catLabel = {
      neuf: "📱 Neuf",
      reconditionne: "♻️ Reconditionné",
      accessoire: "🎧 Accessoire"
    }[p.category] || "";

    grid.innerHTML += `
      <a class="product-card" href="product.html?id=${p.id}">
        ${badgeHTML}
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23eee%22 width=%22200%22 height=%22200%22/><text fill=%22%23aaa%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>📱</text></svg>'" />
        </div>
        <div class="product-info">
          <span class="product-category-tag">${catLabel}</span>
          <p class="product-name">${p.name}</p>
          ${oldPriceHTML}
          <p class="product-price">${fmt(p.price)}</p>
        </div>
        <span style="display:block;">
          <button class="add-to-cart" onclick="event.preventDefault(); addToCart(${p.id});">
            🛒 Ajouter au panier
          </button>
        </span>
      </a>`;
  });
}

/* ===== FILTRES ===== */
function filterCategory(cat) {
  currentFilter = cat;
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  applyFilters();
}

function filterProducts() {
  currentSearch = document.getElementById("searchInput").value.toLowerCase();
  applyFilters();
}

function applyFilters() {
  let list = window.PRODUCTS;

  if (currentFilter !== "all") {
    if (currentFilter === "promo") {
      list = list.filter(p => p.oldPrice);
    } else {
      list = list.filter(p => p.category === currentFilter);
    }
  }

  if (currentSearch) {
    const q = currentSearch;
    const catMap = {
      "neuf": "neuf", "nouveau": "neuf",
      "reconditionne": "reconditionne", "reconditionné": "reconditionne",
      "recond": "reconditionne", "recondition": "reconditionne",
      "accessoire": "accessoire", "accessoires": "accessoire",
      "promo": "promo"
    };
    const mapped = catMap[q] || null;
    list = list.filter(p => {
      if ((p.name || "").toLowerCase().includes(q)) return true;
      if (mapped === "promo") return !!p.oldPrice;
      if (mapped) return p.category === mapped;
      return false;
    });
  }

  renderProducts(list);
}

/* ===== PARTAGE WHATSAPP ===== */
function shareProductWhatsApp(id) {
  const product = (window.PRODUCTS || []).find(p => p.id === id);
  if (!product) return;
  const url = `product.html?id=${product.id}`;
  const msg = encodeURIComponent(
    `Bonjour, voici un produit que je vous recommande :\n\n` +
    `🛒 ${product.name}\n` +
    `💰 Prix : ${fmt(product.price)}\n` +
    `🔗 ${url}`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

/* ===== PANIER ===== */
function addToCart(id) {
  const product = window.PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`✅ ${product.name} ajouté au panier !`);
  openCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("bpCart", JSON.stringify(cart));
}

function updateCartUI() {
  const count    = cart.reduce((s, c) => s + c.qty, 0);
  const total    = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const itemsDiv = document.getElementById("cartItems");
  const footer   = document.getElementById("cartFooter");
  const empty    = document.getElementById("cartEmpty");

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = fmt(total);

  if (cart.length === 0) {
    itemsDiv.innerHTML = "";
    footer.style.display = "none";
    empty.style.display  = "block";
    return;
  }

  footer.style.display = "block";
  empty.style.display  = "none";

  itemsDiv.innerHTML = cart.map(c => `
    <div class="cart-item">
      <img src="${c.image}" alt="${c.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2256%22 height=%2256%22><rect fill=%22%23eee%22 width=%2256%22 height=%2256%22/><text fill=%22%23aaa%22 font-size=%2224%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>📱</text></svg>'" />
      <div class="cart-item-info">
        <p class="cart-item-name">${c.name}</p>
        <p class="cart-item-price">${fmt(c.price)}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${c.id},-1)">−</button>
          <span class="qty-num">${c.qty}</span>
          <button class="qty-btn" onclick="changeQty(${c.id},1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart(${c.id})">🗑</button>
    </div>`).join("");
}

function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("open");
  document.getElementById("cartOverlay").classList.toggle("open");
}
function openCart() {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
}

/* ===== MODAL COMMANDE ===== */
function showCheckout() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const lines = cart.map(c =>
    `<div class="order-line"><span>${c.name} x${c.qty}</span><span>${fmt(c.price * c.qty)}</span></div>`
  ).join("");
  document.getElementById("orderSummary").innerHTML = `
    <p class="order-summary-title">Récapitulatif</p>
    ${lines}
    <div class="order-line"><span>Total</span><span>${fmt(total)}</span></div>`;
  document.getElementById("modalOverlay").classList.add("open");
  toggleCart();
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

function submitOrder() {
  const name    = document.getElementById("orderName").value.trim();
  const phone   = document.getElementById("orderPhone").value.trim();
  const address = document.getElementById("orderAddress").value.trim();
  const payment = document.querySelector('input[name="payment"]:checked');

  if (!name || !phone || !address || !payment) {
    showToast("⚠️ Veuillez remplir tous les champs !");
    return;
  }

  const payLabels = { airtel: "Airtel Money", mtn: "MTN Money", cash: "Livraison Cash" };
  const total     = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const lines     = cart.map(c => `• ${c.name} x${c.qty} = ${fmt(c.price * c.qty)}`).join("\n");

  const msg = encodeURIComponent(
    `🛒 *NOUVELLE COMMANDE – Brazzaphone*\n\n` +
    `👤 Nom : ${name}\n` +
    `📞 Tél : ${phone}\n` +
    `📍 Adresse : ${address}\n` +
    `💳 Paiement : ${payLabels[payment.value]}\n\n` +
    `📦 Produits :\n${lines}\n\n` +
    `💰 *Total : ${fmt(total)}*`
  );

  // Sauvegarder commande dans localStorage (pour section admin)
  try {
    const order = {
      id: "ord_" + Math.random().toString(16).slice(2) + "_" + Date.now(),
      createdAt: new Date().toISOString(),
      buyerName: name,
      buyerPhone: phone,
      buyerAddress: address,
      payment: payment.value,
      status: "pending",
      items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price, subtotal: c.price * c.qty })),
      total
    };
    const ordersRaw = localStorage.getItem("bpOrders");
    const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
    const safe = Array.isArray(orders) ? orders : [];
    safe.unshift(order);
    localStorage.setItem("bpOrders", JSON.stringify(safe));
  } catch (e) {
    console.warn("Impossible de sauvegarder bpOrders", e);
  }

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");

  cart = [];
  saveCart();
  updateCartUI();
  closeModal();
  showToast("🎉 Commande envoyée sur WhatsApp !");
}

/* ===== UTILITAIRES ===== */
function fmt(n) {
  return (n || 0).toLocaleString("fr-FR") + " FCFA";
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}