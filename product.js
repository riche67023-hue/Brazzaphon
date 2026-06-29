  /* Product details page logic */

(function () {
  const params = new URLSearchParams(window.location.search);
  const idRaw = params.get('id');
  const productId = idRaw ? Number(idRaw) : NaN;

  const nameEl = document.getElementById('productName');
  const priceEl = document.getElementById('productPrice');
  const oldPriceEl = document.getElementById('productOldPrice');
  const descEl = document.getElementById('productDescription');
  const categoryEl = document.getElementById('productCategory');
  const idEl = document.getElementById('productId');
  const badgeRow = document.getElementById('badgeRow');
  const breadcrumbs = document.getElementById('breadcrumbs');

  const addBtn = document.getElementById('addToCartBtn');
  const waBtn = document.getElementById('whatsappOrderBtn');
  const shareBtn = document.getElementById('shareProductBtn');


  const galleryMain = document.getElementById('galleryMain');
  const galleryThumbs = document.getElementById('galleryThumbs');

  const similarGrid = document.getElementById('similarGrid');
  const similarCount = document.getElementById('similarCount');

  function getProducts() {
    // script.js met window.PRODUCTS à disposition (et la remplace depuis bpAdminProducts)
    return Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  }

  function badgeHTML(product) {
    if (!product.badge) return '';

    const badgeText = product.badge;
    const cls = product.category === 'reconditionne'
      ? 'green'
      : product.category === 'accessoire'
        ? 'blue'
        : '';

    // Note : dans style.css on a des badges pour les cartes. Ici on fait une variante simple.
    return `<span class="product-badge ${cls}">${badgeText}</span>`;
  }

  function parseImages(product) {
    // Support flexible :
    // - product.images = [ ... ] (option)
    // - product.image = string (actuel)
    if (Array.isArray(product.images) && product.images.length) return product.images;
    if (product.image) return [product.image];
    return [];
  }

  function setGallery(images) {
    if (!images.length) {
      galleryMain.innerHTML = `<div class="img-skeleton"></div>`;
      galleryThumbs.innerHTML = '';
      return;
    }

    const mainImg = images[0];
    galleryMain.innerHTML = `
      <img src="${mainImg}" alt="${escapeHtml(productSafeName())}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%22%23eee%22 width=%22300%22 height=%22300%22/><text fill=%22%23aaa%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>📱</text></svg>'" />
    `;

    galleryThumbs.innerHTML = images.map((src, idx) => {
      const active = idx === 0 ? 'active' : '';
      return `
        <button class="thumb-btn ${active}" type="button" data-src="${src}">
          <img src="${src}" alt="Vignette ${idx + 1}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%2272%22><rect fill=%22%23eee%22 width=%22200%22 height=%2272%22/><text fill=%22%23aaa%22 font-size=%2224%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>📷</text></svg>'" />
        </button>
      `;
    }).join('');

    // Click thumbnails
    galleryThumbs.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        galleryThumbs.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const src = btn.getAttribute('data-src');
        galleryMain.innerHTML = `<img src="${src}" alt="${escapeHtml(productSafeName())}" />`;
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '<')
      .replaceAll('>', '>')
      .replaceAll('"', '"')
      .replaceAll("'", '&#039;');
  }

  let currentProduct = null;
  function productSafeName() {
    return currentProduct?.name || 'Produit';
  }

  function categoryLabel(cat) {
    return { neuf: '📱 Neuf', reconditionne: '♻️ Reconditionné', accessoire: '🎧 Accessoire' }[cat] || cat || '—';
  }

  function fmtPrice(n) {
    // Dépendance minimale : ne pas compter sur window.fmt
    try {
      return Number(n).toLocaleString('fr-FR') + ' FCFA';
    } catch {
      return String(n) + ' FCFA';
    }
  }

  function similarProducts(product) {
    const all = getProducts();
    const sameCat = all.filter(p => p.id !== product.id && p.category === product.category);
    if (sameCat.length >= 4) return sameCat.slice(0, 8);

    // fallback: par proximité de prix
    const byPrice = all
      .filter(p => p.id !== product.id)
      .slice()
      .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price));

    const merged = [...sameCat, ...byPrice.filter(p => !sameCat.some(x => x.id === p.id))];
    return merged.slice(0, 8);
  }

  function renderSimilar(list) {
    similarGrid.innerHTML = '';
    similarCount.textContent = list.length ? `${list.length} produit(s)` : '';

    if (!list.length) {
      similarGrid.innerHTML = `<div style="color:var(--gray);padding:18px 0;">Aucun produit similaire.</div>`;
      return;
    }

    similarGrid.innerHTML = list.map(p => {
      const oldPriceHTML = p.oldPrice ? `<span class="product-old-price">${fmtPrice(p.oldPrice)}</span>` : '';
      const badgeClass = p.category === 'reconditionne'
        ? 'badge-reconditionne'
        : p.category === 'accessoire'
          ? 'badge-accessoire'
          : '';
      const badgeHTML = p.badge ? `<span class="product-badge ${badgeClass}">${p.badge}</span>` : '';

      // On redirige vers la page produit
      return `
        <div class="product-card" role="button" tabindex="0" onclick="location.href='product.html?id=${p.id}'">
          ${badgeHTML}
          <div class="product-img-wrap">
            <img src="${p.image}" alt="${escapeHtml(p.name)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23eee%22 width=%22200%22 height=%22200%22/><text fill=%22%23aaa%22 font-size=%2240%22 x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>📱</text></svg>'" />
          </div>
          <div class="product-info">
            <span class="product-category-tag">${categoryLabel(p.category)}</span>
            <p class="product-name">${escapeHtml(p.name)}</p>
            ${oldPriceHTML}
            <p class="product-price">${fmtPrice(p.price)}</p>
          </div>
          <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id})">🛒 Ajouter au panier</button>
        </div>
      `;
    }).join('');
  }

  function setWhatsApp(product) {
    const qty = 1;
    const url = `product.html?id=${product.id}`;
    const lines = [
      `🛒 Produit : ${product.name}`,
      `💰 Prix : ${fmtPrice(product.price)}`,
      product.oldPrice ? `↘️ Ancien prix : ${fmtPrice(product.oldPrice)}` : '',
      `📦 Quantité : ${qty}`,
      `📍 Livraison : Brazzaville – Centre-ville`,
      `🔗 Lien : ${url}`
    ].filter(Boolean);


    const msg = encodeURIComponent(
      `Bonjour, je souhaite commander :\n\n${lines.join('\n')}\n\nMerci.`
    );

    // Utilise WHATSAPP_NUMBER de script.js si présent
    const waNumber = (typeof window.WHATSAPP_NUMBER !== 'undefined') ? window.WHATSAPP_NUMBER : '242xxxxxxxx';
    const clean = String(waNumber).replaceAll(/\s+/g, '');

    waBtn.href = `https://wa.me/${clean}?text=${msg}`;
  }

  function setPage(product) {
    // setShare button (partage WhatsApp)
    if (shareBtn) {
      shareBtn.onclick = () => {
        const url = `product.html?id=${product.id}`;
        const msg = encodeURIComponent(
          `Bonjour, voici un produit que je vous recommande :\n\n` +
          `🛒 ${product.name}\n` +
          `💰 Prix : ${fmtPrice(product.price)}\n` +
          `🔗 Lien : ${url}`
        );

        const waNumber = (typeof window.WHATSAPP_NUMBER !== 'undefined') ? window.WHATSAPP_NUMBER : '242xxxxxxxx';
        const clean = String(waNumber).replaceAll(/\s+/g, '');
        window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
      };
    }

    currentProduct = product;

    // breadcrumbs
    breadcrumbs.innerHTML = `
      <a href="index.html">Accueil</a> / <span>${escapeHtml(product.name)}</span>
    `;

    nameEl.textContent = product.name || 'Produit';
    priceEl.textContent = fmtPrice(product.price);
    if (product.oldPrice) {
      oldPriceEl.style.display = 'inline';
      oldPriceEl.textContent = fmtPrice(product.oldPrice);
    } else {
      oldPriceEl.style.display = 'none';
    }

    // Description: si champ product.description existe, sinon fallback
    descEl.textContent = product.description || `Découvrez ${product.name} — un produit idéal pour vos besoins quotidiens.`;

    categoryEl.textContent = categoryLabel(product.category);
    idEl.textContent = product.id;

    badgeRow.innerHTML = badgeHTML(product);

    const images = parseImages(product);
    setGallery(images);

    addBtn.onclick = () => {
      if (typeof window.addToCart === 'function') {
        window.addToCart(product.id);
      } else {
        console.warn('addToCart not found');
      }
    };

    setWhatsApp(product);
  }

  function init() {
    const all = getProducts();

    // Si script.js n’a pas encore appliqué bpAdminProducts, on attend un petit tick.
    setTimeout(() => {
      const list = getProducts();
      currentProduct = list.find(p => p.id === productId) || null;

      if (!Number.isFinite(productId) || !currentProduct) {
        document.body.innerHTML = `<div class="container" style="padding:40px 16px;color:#444;">
          <h1 style="font-family:Poppins,sans-serif;color:#1A1A1A;">Produit introuvable</h1>
          <p>Vérifiez l’ID dans l’URL (ex: product.html?id=3).</p>
          <a href="index.html" style="color:#FF6A00;font-weight:800;">← Retour à la boutique</a>
        </div>`;
        return;
      }

      setPage(currentProduct);

      // Similar
      const sims = similarProducts(currentProduct);
      renderSimilar(sims);

      // Cart UI
      if (typeof window.updateCartUI === 'function') window.updateCartUI();
    }, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

