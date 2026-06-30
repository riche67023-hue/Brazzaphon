/* ============================================================
   BRAZZAPHONE – admin.js
   ============================================================ */

/* ===== AUTH ===== */
const ADMIN_USER = "admin";
const ADMIN_PASS = "brazzaphone2025";

async function doLogin() {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value.trim();
  if (u === ADMIN_USER && p === ADMIN_PASS) {

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "flex";
    await loadData();
    renderAdminProducts();
    renderStats();
    renderMiniStats();
    showSection('products');
  } else {
    document.getElementById("loginError").textContent = "❌ Identifiants incorrects.";
  }
}

function togglePassword() {
  const passInput = document.getElementById("loginPass");
  const btn = document.querySelector(".toggle-pass");
  if (!passInput) return;
  const isHidden = passInput.type === "password";
  passInput.type = isHidden ? "text" : "password";
  if (btn) btn.textContent = isHidden ? "🙈" : "👁️";
}

function doLogout() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";
}

/* ===== Mobile admin menu (overlay/slide) ===== */
function toggleAdminMenu() {
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return;

  const isOpen = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
}


document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.getElementById("loginScreen").style.display !== "none") doLogin();
});

/* ===== DONNÉES ===== */
const DEFAULT_PRODUCTS = [
  { id: 1,  name: "Samsung Galaxy A55 5G 128Go", price: 185000, oldPrice: 210000, category: "neuf",          badge: "🔥 Promo",   image: "images/samsung-a55.jpg" },
  { id: 2,  name: "Samsung Galaxy A35 128Go",    price: 145000, oldPrice: null,   category: "neuf",          badge: "⭐ Nouveau", image: "images/samsung-a35.jpg" },
  { id: 3,  name: "iPhone 13 128Go – Recond.",   price: 250000, oldPrice: 310000, category: "reconditionne", badge: "♻️ Recond.", image: "images/iphone13.jpg" },
  { id: 4,  name: "iPhone 14 256Go",             price: 390000, oldPrice: null,   category: "neuf",          badge: "⭐ Nouveau", image: "images/iphone14.jpg" },
  { id: 5,  name: "Samsung S23 FE 256Go",        price: 280000, oldPrice: 330000, category: "neuf",          badge: "🔥 Promo",   image: "images/samsung-s23fe.jpg" },
  { id: 6,  name: "iPhone 12 64Go – Recond.",    price: 170000, oldPrice: 220000, category: "reconditionne", badge: "♻️ Recond.", image: "images/iphone12.jpg" },
  { id: 7,  name: "Écouteurs Bluetooth Pro",     price: 12000,  oldPrice: null,   category: "accessoire",    badge: null,         image: "images/ecouteurs.jpg" },
  { id: 8,  name: "Chargeur Rapide USB-C 65W",   price: 8500,   oldPrice: null,   category: "accessoire",    badge: null,         image: "images/chargeur.jpg" },
  { id: 9,  name: "Coque Samsung A55 Antichoc",  price: 3500,   oldPrice: null,   category: "accessoire",    badge: null,         image: "images/coque-a55.jpg" },
  { id: 10, name: "Samsung Galaxy A15 128Go",    price: 98000,  oldPrice: null,   category: "neuf",          badge: "⭐ Nouveau", image: "images/samsung-a15.jpg" },
  { id: 11, name: "Batterie externe 20000mAh",   price: 15000,  oldPrice: 19000,  category: "accessoire",    badge: "🔥 Promo",   image: "images/batterie.jpg" },
  { id: 12, name: "iPhone 11 64Go – Recond.",    price: 125000, oldPrice: 160000, category: "reconditionne", badge: "♻️ Recond.", image: "images/iphone11.jpg" }
];

let products = [];

async function loadData() {
  try {
    const res = await fetch("/.netlify/functions/save-products");
    const data = await res.json();
    products = (data && data.length) ? data : [...DEFAULT_PRODUCTS];
  } catch (e) {
    console.error("Erreur chargement produits :", e);
    products = [...DEFAULT_PRODUCTS];
  }
}

async function saveData() {
  try {
    await fetch("/.netlify/functions/save-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products)
    });
  } catch (e) {
    console.error("Erreur sauvegarde produits :", e);
    showAdminToast("⚠️ Erreur de sauvegarde, vérifie ta connexion.");
  }
}

/* ===== NAVIGATION ===== */
function showSection(name) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  const target = document.getElementById(`section-${name}`);
  if (target) target.style.display = "block";
  document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".sidebar-btn").forEach(b => {
    if (b.getAttribute("onclick") && b.getAttribute("onclick").includes(`'${name}'`)) {
      b.classList.add("active");
    }
  });
}

/* ===== LISTE PRODUITS ===== */
function renderAdminProducts() {
  const search    = (document.getElementById("adminSearch")?.value || "").toLowerCase();
  const catFilter = document.getElementById("adminCatFilter")?.value || "all";

  let list = products;
  if (catFilter !== "all") list = list.filter(p => p.category === catFilter);
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search));

  const tbody = document.getElementById("productsTableBody");
  if (!tbody) return;

  tbody.innerHTML = list.length === 0
    ? `<tr><td colspan="7" style="text-align:center;padding:32px;color:#aaa;">Aucun produit trouvé</td></tr>`
    : list.map(p => `
    <tr>
      <td><img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><rect fill=%22%23eee%22 width=%2248%22 height=%2248%22/><text fill=%22%23aaa%22 font-size=%2220%22 x=%2250%25%22 y=%2256%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>📱</text></svg>'" /></td>
      <td><strong>${p.name}</strong></td>
      <td><span class="cat-badge cat-${p.category}">${catLabel(p.category)}</span></td>
      <td class="price-cell">${fmt(p.price)}</td>
      <td class="old-price-cell">${p.oldPrice ? fmt(p.oldPrice) : "—"}</td>
      <td>${p.badge || "—"}</td>
      <td>
        <div class="action-btns">
          <button class="edit-btn" onclick="openProductModal(${p.id})">✏️ Modifier</button>
          <button class="del-btn"  onclick="deleteProduct(${p.id})">🗑 Supprimer</button>
        </div>
      </td>
    </tr>`).join("");

  renderMiniStats();
}

/* ===== MINI STATS ===== */
function renderMiniStats() {
  const total  = products.length;
  const neufs  = products.filter(p => p.category === "neuf").length;
  const recon  = products.filter(p => p.category === "reconditionne").length;
  const acc    = products.filter(p => p.category === "accessoire").length;
  const promos = products.filter(p => p.oldPrice).length;

  const el = document.getElementById("miniStats");
  if (!el) return;
  el.innerHTML = [
    ["📦 Total", total], ["📱 Neufs", neufs], ["♻️ Reconditionnés", recon],
    ["🎧 Accessoires", acc], ["🔥 Promos", promos]
  ].map(([label, val]) =>
    `<div class="stat-chip">${label} : <strong>${val}</strong></div>`
  ).join("");
}

/* ===== STATS PAGE ===== */
function renderStats() {
  const cats = { neuf: 0, reconditionne: 0, accessoire: 0 };
  let minPrice = Infinity, maxPrice = 0, totalVal = 0;
  products.forEach(p => {
    cats[p.category] = (cats[p.category] || 0) + 1;
    if (p.price < minPrice) minPrice = p.price;
    if (p.price > maxPrice) maxPrice = p.price;
    totalVal += p.price;
  });

  const el = document.getElementById("statsGrid");
  if (!el) return;
  el.innerHTML = [
    ["📦 Total produits",      products.length],
    ["📱 Téléphones neufs",    cats.neuf],
    ["♻️ Reconditionnés",      cats.reconditionne],
    ["🎧 Accessoires",         cats.accessoire],
    ["🔥 En promotion",        products.filter(p => p.oldPrice).length],
    ["💰 Prix moyen",          fmt(Math.round(totalVal / (products.length || 1)))],
    ["📉 Prix le plus bas",    fmt(minPrice === Infinity ? 0 : minPrice)],
    ["📈 Prix le plus haut",   fmt(maxPrice)],
  ].map(([label, val]) => `
    <div class="stat-card">
      <div class="stat-value">${val}</div>
      <div class="stat-label">${label}</div>
    </div>`).join("");
}

/* ===== MODAL PRODUIT ===== */

function clearImagePreview() {
  const wrap = document.getElementById("pImagePreviewWrap");
  const img  = document.getElementById("pImagePreview");
  const file = document.getElementById("pImageFile");
  const hidden = document.getElementById("pImage");

  if (img) img.src = "";
  if (wrap) wrap.style.display = "none";

  if (file) file.value = "";
  if (hidden) hidden.value = "";
}

function setImagePreview(data) {
  const wrap = document.getElementById("pImagePreviewWrap");
  const img  = document.getElementById("pImagePreview");
  const hidden = document.getElementById("pImage");

  if (!data) {
    clearImagePreview();
    return;
  }

  if (img) img.src = data;
  if (wrap) wrap.style.display = "block";
  if (hidden) hidden.value = data;
}

(function initImageUpload() {
  const fileInput = document.getElementById("pImageFile");
  if (!fileInput) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      clearImagePreview();
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAdminToast("⚠️ Image trop lourde (max 10MB)." );
      fileInput.value = "";
      clearImagePreview();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  });
})();

function openProductModal(id = null) { 
  const modal = document.getElementById("productModal");
  document.getElementById("modalTitle").textContent = id ? "✏️ Modifier le produit" : "➕ Ajouter un produit";
  document.getElementById("editId").value = id || "";

  if (id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById("pName").value     = p.name;
    document.getElementById("pCategory").value = p.category;
    document.getElementById("pPrice").value    = p.price;
    document.getElementById("pOldPrice").value = p.oldPrice || "";
    document.getElementById("pBadge").value    = p.badge || "";
    document.getElementById("pImage").value    = p.image;

    setImagePreview(p.image);
  } else {
    ["pName","pPrice","pOldPrice","pImage"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("pCategory").value = "neuf";
    document.getElementById("pBadge").value    = "";

    const fileInput = document.getElementById("pImageFile");
    if (fileInput) fileInput.value = "";

    clearImagePreview();
  }

  modal.classList.add("open");
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("open");
}

document.addEventListener("click", (e) => {
  const btn = e.target && e.target.closest && e.target.closest(".image-remove");
  if (btn) {
    clearImagePreview();
  }
});


async function saveProduct() {
  const name     = document.getElementById("pName").value.trim();
  const category = document.getElementById("pCategory").value;
  const price    = parseInt(document.getElementById("pPrice").value);
  const oldPrice = parseInt(document.getElementById("pOldPrice").value) || null;
  const badge    = document.getElementById("pBadge").value || null;
  const image    = (document.getElementById("pImage").value || "").trim() || "images/placeholder.jpg";
  const editId   = parseInt(document.getElementById("editId").value) || null;

  if (!name || !price) { showAdminToast("⚠️ Nom et prix obligatoires !"); return; }

  if (editId) {
    const idx = products.findIndex(p => p.id === editId);
    if (idx > -1) products[idx] = { id: editId, name, category, price, oldPrice, badge, image };
    showAdminToast("✅ Produit modifié !");
  } else {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, name, category, price, oldPrice, badge, image });
    showAdminToast("✅ Produit ajouté !");
  }

  await saveData();
  renderAdminProducts();
  renderStats();
  closeProductModal();
}

async function deleteProduct(id) {
  if (!confirm("Supprimer ce produit ?")) return;
  products = products.filter(p => p.id !== id);
  await saveData();
  renderAdminProducts();
  renderStats();
  showAdminToast("🗑 Produit supprimé.");
}

/* ===== UTILITAIRES ===== */
function fmt(n) { return (n || 0).toLocaleString("fr-FR") + " FCFA"; }

function catLabel(c) {
  return { neuf: "📱 Neuf", reconditionne: "♻️ Recond.", accessoire: "🎧 Accessoire" }[c] || c;
}

function showAdminToast(msg) {
  const t = document.getElementById("adminToast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}
