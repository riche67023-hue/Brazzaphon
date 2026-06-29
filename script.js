/* ============================================================
   BRAZZAPHONE – script.js
   Catalogue · Panier · Commande · WhatsApp
   ============================================================ */

const WHATSAPP_NUMBER = "+242 056 145 113"; // WhatsApp boutique

/* ===== CATALOGUE PRODUITS (à remplacer par tes vraies images) =====
   Structure : { id, name, price, oldPrice, category, badge, image }
   category : "neuf" | "reconditionne" | "accessoire"
   badge    : "🔥 Promo" | "⭐ Nouveau" | "♻️ Reconditionné" | null
================================================================= */
window.PRODUCTS = [

  {
    id: 1,
    name: "Samsung Galaxy A55 5G 128Go",
    price: 185000,
    oldPrice: 210000,
    category: "neuf",
    badge: "🔥 Promo",
    image: "images/samsung-a55.jpg"
  },
  {
    id: 2,
    name: "Samsung Galaxy A35 128Go",
    price: 145000,
    oldPrice: null,
    category: "neuf",
    badge: "⭐ Nouveau",
    image: "images/samsung-a35.jpg"
  },
  {
    id: 3,
    name: "iPhone 13 128Go – Reconditionné",
    price: 250000,
    oldPrice: 310000,
    category: "reconditionne",
    badge: "♻️ Recond.",
    image: "images/iphone13.jpg"
  },
  {
    id: 4,
    name: "iPhone 14 256Go",
    price: 390000,
    oldPrice: null,
    category: "neuf",
    badge: "⭐ Nouveau",
    image: "images/iphone14.jpg"
  },
  {
    id: 5,
    name: "Samsung S23 FE 256Go",
    price: 280000,
    oldPrice: 330000,
    category: "neuf",
    badge: "🔥 Promo",
    image: "images/samsung-s23fe.jpg"
  },
  {
    id: 6,
    name: "iPhone 12 64Go – Reconditionné",
    price: 170000,
    oldPrice: 220000,
    category: "reconditionne",
    badge: "♻️ Recond.",
    image: "images/iphone12.jpg"
  },
  {
    id: 7,
    name: "Écouteurs Bluetooth Pro",
    price: 12000,
    oldPrice: null,
    category: "accessoire",
    badge: null,
    image: "images/ecouteurs.jpg"
  },
  {
    id: 8,
    name: "Chargeur Rapide USB-C 65W",
    price: 8500,
    oldPrice: null,
    category: "accessoire",
    badge: null,
    image: "images/chargeur.jpg"
  },
  {
    id: 9,
    name: "Coque Samsung A55 Antichoc",
    price: 3500,
    oldPrice: null,
    category: "accessoire",
    badge: null,
    image: "images/coque-a55.jpg"
  },
  {
    id: 10,
    name: "Samsung Galaxy A15 128Go",
    price: 98000,
    oldPrice: null,
    category: "neuf",
    badge: "⭐ Nouveau",
    image: "images/samsung-a15.jpg"
  },
  {
    id: 11,
    name: "Batterie externe 20000mAh",
    price: 15000,
    oldPrice: 19000,
    category: "accessoire",
    badge: "🔥 Promo",
    image: "images/batterie.jpg"
  },
  {
    id: 12,
    name: "iPhone 11 64Go – Reconditionné",
    price: 125000,
    oldPrice: 160000,
    category: "reconditionne",
    badge: "♻️ Recond.",
    image: "images/iphone11.jpg"
  }
];

/* ===== ÉTAT ===== */
let cart = JSON.parse(localStorage.getItem("bpCart") || "[]");
let currentFilter = "all";
let currentSearch  = "";

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Charger les produits ajoutés/modifiés depuis l'admin
  // (fallback pour éviter le cas où bpAdminProducts n'est pas renseigné dans la session courante)
  const savedAdmin = localStorage.getItem("bpAdminProducts");
  const savedProducts = localStorage.getItem("bpProducts");

  const adminProducts = savedAdmin ? JSON.parse(savedAdmin) : null;
  const publicProducts = savedProducts ? JSON.parse(savedProducts) : null;

  const nextProducts = (
    adminProducts && Array.isArray(adminProducts) && adminProducts.length
  ) ? adminProducts
    : (publicProducts && Array.isArray(publicProducts) && publicProducts.length)
      ? publicProducts
      : null;

  if (nextProducts) {
    // On remplace dynamiquement la liste utilisée pour le catalogue
    window.PRODUCTS = nextProducts;
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

    const catLabel = { neuf: "📱 Neuf", reconditionne: "♻️ Reconditionné", accessoire: "🎧 Accessoire" }[p.category] || "";

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
      </div>`;
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
  let list = PRODUCTS;

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
      "neuf": "neuf",
      "nouveau": "neuf",
      "reconditionne": "reconditionne",
      "reconditionné": "reconditionne",
      "recond": "reconditionne",
      "recondition": "reconditionne",
      "accessoire": "accessoire",
      "accessoires": "accessoire",
      "promo": "promo"
    };

    const mapped = catMap[q] || null;

    list = list.filter(p => {
      const inName = (p.name || "").toLowerCase().includes(q);
      if (inName) return true;

      if (mapped === "promo") return !!p.oldPrice;
      if (mapped) return p.category === mapped;

      return false;
    });
  }

  renderProducts(list);
}

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

  const waNumber = (typeof WHATSAPP_NUMBER !== 'undefined') ? WHATSAPP_NUMBER : '242XXXXXXXXX';
  const clean = String(waNumber).replaceAll(/\s+/g, '');
  window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
}

/* ===== PANIER ===== */
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
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
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }
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

  const lines = cart.map(c => `• ${c.name} x${c.qty} = ${fmt(c.price * c.qty)}`).join("\n");
  const msg   = encodeURIComponent(
    `🛒 *NOUVELLE COMMANDE – Brazzaphone*\n\n` +
    `👤 Nom : ${name}\n` +
    `📞 Tél : ${phone}\n` +
    `📍 Adresse : ${address}\n` +
    `💳 Paiement : ${payLabels[payment.value]}\n\n` +
    `📦 Produits :\n${lines}\n\n` +
    `💰 *Total : ${fmt(total)}*`
  );

  // Construire une commande pour l'admin + WhatsApp
  const order = {

    id: 'ord_' + Math.random().toString(16).slice(2) + '_' + Date.now(),
    createdAt: new Date().toISOString(),
    buyerName: name,
    buyerPhone: phone,
    buyerAddress: address,
    payment: payment.value,
    status: 'pending',
    items: cart.map(c => ({
      id: c.id,
      name: c.name,
      qty: c.qty,
      price: c.price,
      subtotal: c.price * c.qty
    })),
    total
  };

  // Sauvegarder dans localStorage (admin)
  try {
    const ordersRaw = localStorage.getItem('bpOrders');
    const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
    const safe = Array.isArray(orders) ? orders : [];
    safe.unshift(order);
    localStorage.setItem('bpOrders', JSON.stringify(safe));
  } catch (e) {
    console.warn('Impossible de sauvegarder bpOrders', e);
  }

  // Ouvrir WhatsApp
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");

  // Vider panier
  cart = [];
  saveCart();
  updateCartUI();
  closeModal();
  showToast("🎉 Commande envoyée sur WhatsApp !");

}

/* ===== UTILITAIRES ===== */
function fmt(n) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}
