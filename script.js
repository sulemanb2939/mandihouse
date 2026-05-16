/**
 * MANDI HOUSE – script.js
 * Price Calculation Engine + Cart + WhatsApp Integration + Order ID
 * Vanilla JS — No frameworks, no dependencies
 */

'use strict';

/* ============================================================
   1. STATE
   ============================================================ */
const state = {
  mandi: {
    size: 'half',   // 'half' | 'full'
    qty: 1,
    prices: { half: 700, full: 1300 }
  },
  rice: {
    size: 'none',   // 'none' | 'half' | 'full'
    qty: 1,
    prices: { none: 0, half: 200, full: 400 }
  },
  extras: {
    raita: { enabled: false, qty: 1, price: 30 },
    salad: { enabled: false, qty: 1, price: 50 },
    sauce: { enabled: false, qty: 1, price: 50 }
  },
  drinks: {
    'coke-1l': { enabled: false, qty: 1, price: 170, name: 'Coca Cola 1L' },
    'sprite-1l': { enabled: false, qty: 1, price: 170, name: 'Sprite 1L' },
    'next-1l': { enabled: false, qty: 1, price: 150, name: 'Next Cola 1L' },
    'fizup-1l': { enabled: false, qty: 1, price: 150, name: 'Fizup 1L' },
    'coke-1.5l': { enabled: false, qty: 1, price: 200, name: 'Coca Cola 1.5L' },
    'sprite-1.5l': { enabled: false, qty: 1, price: 200, name: 'Sprite 1.5L' },
    'next-1.5l': { enabled: false, qty: 1, price: 170, name: 'Next Cola 1.5L' },
    'fizup-1.5l': { enabled: false, qty: 1, price: 170, name: 'Fizup 1.5L' },
    'coke-reg': { enabled: false, qty: 1, price: 100, name: 'Coca Cola Regular' },
    'sprite-reg': { enabled: false, qty: 1, price: 100, name: 'Sprite Regular' },
    'next-reg': { enabled: false, qty: 1, price: 100, name: 'Next Cola Regular' },
    'water-1.5l': { enabled: false, qty: 1, price: 100, name: 'Water 1.5L' },
    'water-0.5l': { enabled: false, qty: 1, price: 50, name: 'Water 0.5L' }
  },
  deliveryCharge: 100
};

/* ============================================================
   2. PRICE CALCULATION ENGINE
   ============================================================ */
function calculateTotal() {
  const mandiCost = state.mandi.prices[state.mandi.size] * state.mandi.qty;

  const riceCost = state.rice.size !== 'none'
    ? state.rice.prices[state.rice.size] * state.rice.qty
    : 0;

  let extrasCost = 0;
  for (const key in state.extras) {
    const ex = state.extras[key];
    if (ex.enabled) extrasCost += ex.price * ex.qty;
  }

  let drinksCost = 0;
  for (const key in state.drinks) {
    const dr = state.drinks[key];
    if (dr.enabled) drinksCost += dr.price * dr.qty;
  }

  const deliveryCost = state.deliveryCharge;

  return {
    mandiCost,
    riceCost,
    extrasCost,
    drinksCost,
    deliveryCost,
    total: mandiCost + riceCost + extrasCost + drinksCost + deliveryCost
  };
}

/* ============================================================
   3. UI UPDATE
   ============================================================ */
function updateUI() {
  const { mandiCost, riceCost, extrasCost, drinksCost, deliveryCost, total } = calculateTotal();

  // Mandi price display
  animatePrice('mandi-price-display', mandiCost);

  // Rice price badge
  const riceBadge = document.getElementById('rice-price-badge');
  if (state.rice.size === 'none') {
    document.getElementById('rice-price-display').textContent = '0';
    riceBadge.style.opacity = '0.4';
  } else {
    animatePrice('rice-price-display', riceCost);
    riceBadge.style.opacity = '1';
  }

  // Extras price badge
  const extBadge = document.getElementById('extras-price-badge');
  if (extrasCost > 0) {
    animatePrice('extras-price-display', extrasCost);
    extBadge.style.opacity = '1';
  } else {
    document.getElementById('extras-price-display').textContent = '0';
    extBadge.style.opacity = '0.4';
  }

  // Drinks price badge
  const drinkBadge = document.getElementById('drinks-price-badge');
  if (drinkBadge) {
    if (drinksCost > 0) {
      animatePrice('drinks-price-display', drinksCost);
      drinkBadge.style.opacity = '1';
    } else {
      document.getElementById('drinks-price-display').textContent = '0';
      drinkBadge.style.opacity = '0.4';
    }
  }

  // Totals
  updateElement('desktop-total', formatPKR(total));
  updateElement('mobile-total', formatPKR(total));
  updateElement('modal-total', formatPKR(total));

  // Summary lines
  updateSummary({ mandiCost, riceCost, extrasCost, drinksCost, deliveryCost, total });
}

function animatePrice(elId, value) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = formatPKR(value);
  el.classList.remove('price-pulse');
  void el.offsetWidth; // reflow
  el.classList.add('price-pulse');
}

function updateElement(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function formatPKR(value) {
  return value.toLocaleString('en-PK');
}

function updateSummary({ mandiCost, riceCost, extrasCost, drinksCost, deliveryCost, total }) {
  const mandiLabel = `Mandi (${state.mandi.size === 'half' ? 'Half' : 'Full'}) × ${state.mandi.qty}`;
  let lines = [{ name: mandiLabel, price: mandiCost }];

  if (state.rice.size !== 'none') {
    const riceLabel = `Rice (${state.rice.size === 'half' ? 'Half' : 'Full'}) × ${state.rice.qty}`;
    lines.push({ name: riceLabel, price: riceCost });
  }

  const extraNames = { raita: 'Raita', salad: 'Salad', sauce: 'Mandi Sauce' };
  for (const key in state.extras) {
    const ex = state.extras[key];
    if (ex.enabled) {
      lines.push({ name: `${extraNames[key]} × ${ex.qty}`, price: ex.price * ex.qty });
    }
  }

  for (const key in state.drinks) {
    const dr = state.drinks[key];
    if (dr.enabled) {
      lines.push({ name: `${dr.name} × ${dr.qty}`, price: dr.price * dr.qty });
    }
  }

  // Add delivery charges to summary lines
  lines.push({ name: 'Delivery Charges', price: deliveryCost });

  // Desktop summary
  const desktopEl = document.getElementById('summary-lines');
  if (desktopEl) {
    desktopEl.innerHTML = lines.map(l =>
      `<div class="summary-line">
        <span class="summary-line-name">${l.name}</span>
        <span class="summary-line-price">PKR ${formatPKR(l.price)}</span>
      </div>`
    ).join('');
  }

  // Modal summary
  const modalEl = document.getElementById('modal-summary-lines');
  if (modalEl) {
    modalEl.innerHTML = lines.map(l =>
      `<div class="modal-summary-line">
        <span>${l.name}</span>
        <span>PKR ${formatPKR(l.price)}</span>
      </div>`
    ).join('');
  }
}

/* ============================================================
   4. QUANTITY HANDLERS
   ============================================================ */
function changeQty(item, delta) {
  if (item === 'mandi') {
    state.mandi.qty = Math.max(1, Math.min(10, state.mandi.qty + delta));
    updateElement('mandi-qty', state.mandi.qty);
    bounceElement('mandi-qty');
  } else if (item === 'rice') {
    state.rice.qty = Math.max(1, Math.min(10, state.rice.qty + delta));
    updateElement('rice-qty', state.rice.qty);
    bounceElement('rice-qty');
  } else if (state.extras[item]) {
    state.extras[item].qty = Math.max(1, Math.min(10, state.extras[item].qty + delta));
    updateElement(`${item}-qty`, state.extras[item].qty);
    bounceElement(`${item}-qty`);
  } else if (state.drinks[item]) {
    state.drinks[item].qty = Math.max(1, Math.min(10, state.drinks[item].qty + delta));
    updateElement(`${item}-qty`, state.drinks[item].qty);
    bounceElement(`${item}-qty`);
  }
  updateUI();
}

function bounceElement(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('bounce');
  void el.offsetWidth;
  el.classList.add('bounce');
}

/* ============================================================
   5. EXTRAS TOGGLE
   ============================================================ */
function toggleExtra(key) {
  const checkbox = document.getElementById(`extra-${key}`);
  const isChecked = checkbox.checked;
  state.extras[key].enabled = isChecked;

  // Enable/disable stepper buttons
  const group = document.getElementById(`${key}-qty-group`);
  if (group) {
    const buttons = group.querySelectorAll('.qty-btn');
    buttons.forEach(btn => btn.disabled = !isChecked);
  }

  // Visual active state
  const wrap = document.getElementById(`extra-${key}-wrap`);
  if (wrap) {
    wrap.classList.toggle('is-active', isChecked);
  }

  updateUI();
}

/* ============================================================
   5.5 DRINKS TOGGLE
   ============================================================ */
function toggleDrink(key) {
  const checkbox = document.getElementById(`drink-${key}`);
  const isChecked = checkbox.checked;
  state.drinks[key].enabled = isChecked;

  // Enable/disable stepper buttons
  const group = document.getElementById(`${key}-qty-group`);
  if (group) {
    const buttons = group.querySelectorAll('.qty-btn');
    buttons.forEach(btn => btn.disabled = !isChecked);
  }

  // Visual active state
  const wrap = document.getElementById(`drink-${key}-wrap`);
  if (wrap) {
    wrap.classList.toggle('is-active', isChecked);
  }

  updateUI();
}

/* ============================================================
   6. RADIO CHANGE LISTENERS
   ============================================================ */
function initRadioListeners() {
  // Mandi size
  document.querySelectorAll('input[name="mandi-size"]').forEach(radio => {
    radio.addEventListener('change', function () {
      state.mandi.size = this.value;
      updateUI();
    });
  });

  // Rice size
  document.querySelectorAll('input[name="rice-size"]').forEach(radio => {
    radio.addEventListener('change', function () {
      state.rice.size = this.value;
      const riceQtyGroup = document.getElementById('rice-qty-group');
      if (riceQtyGroup) {
        riceQtyGroup.style.display = (this.value !== 'none') ? '' : 'none !important';
        riceQtyGroup.style.setProperty('display', (this.value !== 'none') ? 'flex' : 'none', 'important');
      }
      updateUI();
    });
  });
}

/* ============================================================
   7. ORDER ID SYSTEM (localStorage)
   ============================================================ */
function getNextOrderId() {
  const key = 'mh_order_counter';
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  const next = current + 1;
  localStorage.setItem(key, next);
  return 'MH-' + String(next).padStart(4, '0');
}

function peekCurrentOrderId() {
  const key = 'mh_order_counter';
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  return 'MH-' + String(current + 1).padStart(4, '0');
}

/* ============================================================
   8. MODAL
   ============================================================ */
function openOrderModal() {
  // Refresh modal summary before showing
  const { total } = calculateTotal();
  updateElement('modal-total', formatPKR(total));
  updateSummary(calculateTotal());

  // Show upcoming order ID (peek, don't increment yet)
  const orderId = peekCurrentOrderId();
  updateElement('order-id-text', orderId);

  // Safely get or create the Bootstrap modal instance
  const modalEl = document.getElementById('orderModal');
  if (!modalEl) return;
  // Use getOrCreateInstance so we never double-init
  const bsModal = window.bootstrap
    ? bootstrap.Modal.getOrCreateInstance(modalEl)
    : null;
  if (bsModal) {
    bsModal.show();
  } else {
    // Fallback: show as visible if Bootstrap JS not yet loaded
    modalEl.style.display = 'block';
    modalEl.classList.add('show');
    document.body.classList.add('modal-open');
  }
}

function closeOrderModal() {
  const modalEl = document.getElementById('orderModal');
  if (!modalEl) return;
  
  // Try Bootstrap hide first
  if (window.bootstrap) {
    const bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) {
      bsModal.hide();
      return;
    }
  }
  
  // Fallback: Manual removal
  modalEl.classList.remove('show');
  modalEl.style.display = 'none';
  document.body.classList.remove('modal-open');
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
}

/* ============================================================
   9. FORM VALIDATION
   ============================================================ */
function validatePhone(phone) {
  // Accept formats: 03XX-XXXXXXX, 03XXXXXXXXX, +923XXXXXXXXX
  const cleaned = phone.replace(/[\s\-]/g, '');
  return /^(\+92|0092|0)3[0-9]{9}$/.test(cleaned);
}

function validateForm() {
  let valid = true;

  const name = document.getElementById('cust-name');
  const phone = document.getElementById('cust-phone');
  const address = document.getElementById('cust-address');
  const phoneFeedback = document.getElementById('phone-feedback');

  // Reset
  [name, phone, address].forEach(el => el.classList.remove('is-invalid', 'is-valid'));

  // Name
  if (!name.value.trim()) {
    name.classList.add('is-invalid');
    valid = false;
  } else {
    name.classList.add('is-valid');
  }

  // Phone
  if (!validatePhone(phone.value.trim())) {
    phone.classList.add('is-invalid');
    phoneFeedback.textContent = phone.value.trim()
      ? 'Please enter a valid Pakistani number (e.g. 03001234567)'
      : 'Phone number is required.';
    valid = false;
  } else {
    phone.classList.add('is-valid');
  }

  // Address
  if (!address.value.trim()) {
    address.classList.add('is-invalid');
    valid = false;
  } else {
    address.classList.add('is-valid');
  }

  return valid;
}

/* ============================================================
   10. WHATSAPP MESSAGE GENERATION
   ============================================================ */
function generateWhatsAppMessage(orderId, custName, custPhone, custAddress, custNote) {
  const { total, deliveryCost } = calculateTotal();

  let orderLines = [];
  orderLines.push(`* Mandi: ${state.mandi.size === 'half' ? 'Half' : 'Full'} x ${state.mandi.qty}`);

  if (state.rice.size !== 'none') {
    orderLines.push(`* Rice: ${state.rice.size === 'half' ? 'Half' : 'Full'} x ${state.rice.qty}`);
  }

  // Extras
  let extrasLines = [];
  const extraNames = { raita: 'Raita', salad: 'Salad', sauce: 'Mandi Sauce' };
  for (const key in state.extras) {
    const ex = state.extras[key];
    if (ex.enabled) {
      extrasLines.push(`* ${extraNames[key]}: ${ex.qty}`);
    }
  }

  // Drinks
  let drinksLines = [];
  for (const key in state.drinks) {
    const dr = state.drinks[key];
    if (dr.enabled) {
      drinksLines.push(`* ${dr.name} x ${dr.qty}`);
    }
  }

  const msg = [
    `Order ID: ${orderId}`,
    `Customer Name: ${custName}`,
    `Phone: ${custPhone}`,
    `Address: ${custAddress}`,
    ``,
    `Order Details:`,
    ...orderLines,
    ``,
    ...(extrasLines.length > 0 ? [`Extras:`, ...extrasLines, ``] : []),
    ...(drinksLines.length > 0 ? [`Drinks:`, ...drinksLines, ``] : []),
    `Delivery Charges: 100 PKR`,
    ``,
    `Special Instructions:`,
    custNote.trim() ? custNote.trim() : 'None',
    ``,
    `Total Bill: PKR ${formatPKR(total)}`,
    ``,
    `_Sent via Mandi House Online Order_`
  ].join('\n');

  return encodeURIComponent(msg);
}

/* ============================================================
   11. ORDER SUBMIT HANDLER
   ============================================================ */
function handleOrderSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const btn = document.getElementById('submit-order-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Opening WhatsApp...`;

  const custName    = document.getElementById('cust-name').value.trim();
  const custPhone   = document.getElementById('cust-phone').value.trim();
  const custAddress = document.getElementById('cust-address').value.trim();
  const custNote    = document.getElementById('cust-note').value.trim();

  // Increment order ID on actual submit
  const orderId = getNextOrderId();
  updateElement('order-id-text', orderId);

  const encodedMsg = generateWhatsAppMessage(orderId, custName, custPhone, custAddress, custNote);
  const waURL = `https://wa.me/923456788822?text=${encodedMsg}`;

  setTimeout(() => {
    window.open(waURL, '_blank', 'noopener,noreferrer');

    // Hide the modal using getOrCreateInstance
    const modalEl = document.getElementById('orderModal');
    if (modalEl && window.bootstrap) {
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    }

    // Reset form
    document.getElementById('order-form').reset();
    ['cust-name', 'cust-phone', 'cust-address'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-valid', 'is-invalid');
    });

    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-whatsapp me-2"></i>Send Order on WhatsApp`;

    showSuccessToast(orderId);
  }, 600);
}

/* ============================================================
   12. SUCCESS TOAST
   ============================================================ */
function showSuccessToast(orderId) {
  // Create toast dynamically
  const existing = document.getElementById('order-toast');
  if (existing) existing.remove();

  const toastEl = document.createElement('div');
  toastEl.id = 'order-toast';
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.style.cssText = `
    position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
    background: #2E7D32; color: #fff; padding: 14px 24px;
    border-radius: 50px; font-weight: 700; font-size: 0.9rem;
    box-shadow: 0 8px 28px rgba(0,0,0,0.2); z-index: 9999;
    display: flex; align-items: center; gap: 8px;
    animation: slideUp 0.4s ease;
    white-space: nowrap;
  `;
  toastEl.innerHTML = `✅ Order ${orderId} placed! WhatsApp opening...`;
  document.body.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toastEl.remove(), 400);
  }, 3000);
}

/* ============================================================
   13. INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  // Initialize radio listeners
  initRadioListeners();

  // Initialize form submit
  const form = document.getElementById('order-form');
  if (form) form.addEventListener('submit', handleOrderSubmit);

  // Initial UI render
  updateUI();

  // Hide rice quantity group initially (rice is set to 'none')
  const riceQtyGroup = document.getElementById('rice-qty-group');
  if (riceQtyGroup) riceQtyGroup.style.setProperty('display', 'none', 'important');

  // Lazy load hero image (already handled by CSS background, add loading attr to any img tags)
  document.querySelectorAll('img[data-src]').forEach(img => {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

// ===== POS ACCESS SYSTEM =====
let posModalInstance = null;

function openPOSModal() {
  const modalEl = document.getElementById('posAccessModal');
  if (!modalEl) return;
  const bsModal = window.bootstrap
    ? bootstrap.Modal.getOrCreateInstance(modalEl)
    : null;
  
  if (bsModal) {
    bsModal.show();
  } else {
    modalEl.style.display = 'block';
    modalEl.classList.add('show');
    document.body.classList.add('modal-open');
  }

  const codeInput = document.getElementById('pos-access-code');
  if (codeInput) {
    codeInput.value = '';
    codeInput.classList.remove('is-invalid');
    setTimeout(() => {
      codeInput.focus();
    }, 500);
  }
}

function validatePOSAccess() {
  const codeInput = document.getElementById('pos-access-code');
  const code = codeInput.value.trim();
  
  if (code === 'MH2026') {
    codeInput.classList.remove('is-invalid');
    codeInput.classList.add('is-valid');
    setTimeout(() => {
      window.location.href = 'staff-billing.html';
    }, 300);
  } else {
    codeInput.classList.add('is-invalid');
    codeInput.value = '';
    codeInput.focus();
  }
}
