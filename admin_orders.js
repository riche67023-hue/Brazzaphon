/* Orders management for admin.html */

(function () {
  const STATUS = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    delivered: 'Livrée'
  };

  const ordersTableBody = () => document.getElementById('ordersTableBody');
  const ordersEmpty = () => document.getElementById('ordersEmpty');

  function getOrders() {
    // prefers shared API
    if (window.bpOrders && typeof window.bpOrders.getAll === 'function') {
      return window.bpOrders.getAll();
    }
    // fallback
    try {
      const raw = localStorage.getItem('bpOrders');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setOrders(orders) {
    if (window.bpOrders && typeof window.bpOrders.saveAll === 'function') {
      return window.bpOrders.saveAll(orders);
    }
    localStorage.setItem('bpOrders', JSON.stringify(Array.isArray(orders) ? orders : []));
  }

  function fmt(n) {
    return (n || 0).toLocaleString('fr-FR') + ' FCFA';
  }

  function fmtDate(iso) {
    try {
      const d = iso ? new Date(iso) : new Date();
      return d.toLocaleString('fr-FR');
    } catch {
      return iso || '';
    }
  }

  function renderOrders() {
    const list = getOrders();
    const tbody = ordersTableBody();
    const emptyEl = ordersEmpty();

    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    tbody.innerHTML = list.map(o => {
      const items = (o.items || []).map(it => `${it.name} x${it.qty}`).join('<br/>');
      const status = o.status || 'pending';

      return `
        <tr>
          <td>${escapeHtml(fmtDate(o.createdAt))}</td>
          <td>${escapeHtml(o.buyerName || '—')}</td>
          <td>${escapeHtml(o.buyerPhone || '—')}</td>
          <td>${escapeHtml(o.buyerAddress || '—')}</td>
          <td>${items}</td>
          <td style="font-weight:900;color:#FF6A00;">${escapeHtml(fmt(o.total))}</td>
          <td>
            <label style="display:none;">Changer statut</label>
            <select onchange="window.bpOrdersAdmin && window.bpOrdersAdmin.updateStatus('${escapeAttr(o.id)}', this.value)">
              <option value="pending" ${status==='pending'?'selected':''}>En attente</option>
              <option value="confirmed" ${status==='confirmed'?'selected':''}>Confirmée</option>
              <option value="delivered" ${status==='delivered'?'selected':''}>Livrée</option>
            </select>

          </td>
          <td>
            <button class="del-btn" onclick="window.bpOrdersAdmin && window.bpOrdersAdmin.deleteOrder('${escapeAttr(o.id)}')">🗑 Supprimer</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','<')
      .replaceAll('>','>')
      .replaceAll('"','"')
      .replaceAll("'",'&#039;');
  }

  function escapeAttr(s) {
    return String(s).replaceAll('"','').replaceAll("'",'');
  }

  function updateStatus(orderId, newStatus) {
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    orders[idx].status = newStatus;
    setOrders(orders);
    renderOrders();
  }

  function deleteOrder(orderId) {
    if (!confirm('Supprimer cette commande ?')) return;
    const orders = getOrders();
    setOrders(orders.filter(o => o.id !== orderId));
    renderOrders();
  }

  // Expose API admin
  window.bpOrdersAdmin = {
    render: renderOrders,
    updateStatus,
    deleteOrder
  };

  // initial render (si la section orders est chargée)
  document.addEventListener('DOMContentLoaded', () => {
    renderOrders();
  });

})();

