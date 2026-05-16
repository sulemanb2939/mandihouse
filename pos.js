// pos.js

// State management
let billItems = [];
let currentBillId = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  generateBillNumber();
});

// Generate or retrieve bill number from localStorage
function generateBillNumber() {
  let counter = localStorage.getItem('mandi_pos_counter');
  
  if (!counter) {
    counter = 1;
  } else {
    counter = parseInt(counter);
  }

  // Format counter to 3 digits e.g., 001
  const formattedCounter = counter.toString().padStart(3, '0');
  currentBillId = `MH-D${formattedCounter}`;
  
  document.getElementById('bill-id-display').innerText = `ID: ${currentBillId}`;
}

// Increment counter after successful print
function incrementBillCounter() {
  let counter = localStorage.getItem('mandi_pos_counter');
  if (!counter) counter = 1;
  else counter = parseInt(counter);
  
  localStorage.setItem('mandi_pos_counter', counter + 1);
  generateBillNumber();
}

// Add item to bill
function addItemToBill(name, price) {
  // Check if item already exists in bill
  const existingItemIndex = billItems.findIndex(item => item.name === name);

  if (existingItemIndex !== -1) {
    // Increase quantity
    billItems[existingItemIndex].qty += 1;
  } else {
    // Add new item
    billItems.push({
      name: name,
      price: price,
      qty: 1
    });
  }

  updateBill();

  // Highlight effect on total
  const totalEl = document.getElementById('pos-grand-total');
  totalEl.classList.remove('price-pulse');
  void totalEl.offsetWidth; // trigger reflow
  totalEl.classList.add('price-pulse');
}

// Change item quantity
function changeQuantity(index, delta) {
  if (billItems[index]) {
    billItems[index].qty += delta;
    
    // Remove if qty drops to 0
    if (billItems[index].qty <= 0) {
      removeItem(index);
    } else {
      updateBill();
    }
  }
}

// Remove item entirely
function removeItem(index) {
  billItems.splice(index, 1);
  updateBill();
}

// Format currency
function formatCurrency(amount) {
  return amount.toLocaleString('en-PK');
}

// Update Bill UI and calculations
function updateBill() {
  const container = document.getElementById('bill-items-container');
  const btnPrint = document.getElementById('btn-print-bill');
  
  // Clear container
  container.innerHTML = '';

  if (billItems.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted mt-5 pt-5">
        <i class="bi bi-receipt display-1 opacity-25"></i>
        <p class="mt-3">No items in bill yet</p>
      </div>
    `;
    document.getElementById('pos-subtotal').innerText = 'Rs 0';
    document.getElementById('pos-grand-total').innerText = 'Rs 0';
    btnPrint.disabled = true;
    return;
  }

  let subtotal = 0;

  // Render items
  billItems.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    const row = document.createElement('div');
    row.className = 'bill-item-row pop-anim';
    
    // Remove pop anim after it completes so it doesn't replay on re-renders unless new
    setTimeout(() => {
      row.classList.remove('pop-anim');
    }, 300);

    row.innerHTML = `
      <button class="btn-delete-item" onclick="removeItem(${index})" title="Remove">
        <i class="bi bi-x-circle-fill"></i>
      </button>
      <div class="bill-item-top">
        <div class="bill-item-name">${item.name} <span class="text-muted fw-normal ms-1">(@${item.price})</span></div>
      </div>
      <div class="bill-item-bottom">
        <div class="bill-qty-controls">
          <button class="bill-qty-btn" onclick="changeQuantity(${index}, -1)"><i class="bi bi-dash"></i></button>
          <span class="bill-qty-value">${item.qty}</span>
          <button class="bill-qty-btn" onclick="changeQuantity(${index}, 1)"><i class="bi bi-plus"></i></button>
        </div>
        <div class="bill-item-subtotal">Rs ${formatCurrency(itemTotal)}</div>
      </div>
    `;
    
    container.appendChild(row);
  });

  // Calculations
  const discountInput = document.getElementById('pos-discount').value;
  const discount = discountInput ? parseInt(discountInput) : 0;
  
  const grandTotal = Math.max(0, subtotal - discount);

  // Update UI totals
  document.getElementById('pos-subtotal').innerText = `Rs ${formatCurrency(subtotal)}`;
  document.getElementById('pos-grand-total').innerText = `Rs ${formatCurrency(grandTotal)}`;
  
  // Enable print button
  btnPrint.disabled = false;
  
  // Scroll to bottom of items
  container.scrollTop = container.scrollHeight;
}

// Prepare and Trigger Print
function printReceipt() {
  if (billItems.length === 0) return;

  // 1. Get Values
  const tableNum = document.getElementById('table-select').value;
  const now = new Date();
  
  const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const subtotalStr = document.getElementById('pos-subtotal').innerText;
  const grandTotalStr = document.getElementById('pos-grand-total').innerText;
  const discountInput = document.getElementById('pos-discount').value;
  const discount = discountInput ? parseInt(discountInput) : 0;

  // 2. Populate hidden print structure
  document.getElementById('print-bill-id').innerText = currentBillId;
  document.getElementById('print-table-num').innerText = tableNum;
  document.getElementById('print-date').innerText = dateStr;
  document.getElementById('print-time').innerText = timeStr;

  const printBody = document.getElementById('print-items-body');
  printBody.innerHTML = ''; // Clear previous

  billItems.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-item">${item.name}</td>
      <td class="col-qty text-center">${item.qty}</td>
      <td class="col-price text-right">${formatCurrency(item.price * item.qty)}</td>
    `;
    printBody.appendChild(tr);
  });

  document.getElementById('print-subtotal').innerText = subtotalStr;
  document.getElementById('print-grand-total').innerText = grandTotalStr;

  const printDiscountRow = document.getElementById('print-discount-row');
  if (discount > 0) {
    document.getElementById('print-discount').innerText = `Rs ${formatCurrency(discount)}`;
    printDiscountRow.style.display = 'flex';
  } else {
    printDiscountRow.style.display = 'none';
  }

  // 3. Trigger Print
  window.print();

  // 4. Post-print cleanup (assuming they actually printed, we increment)
  // To avoid false increments if they cancel print, we could prompt, but standard POS usually increments.
  incrementBillCounter();
  
  // Clear cart
  billItems = [];
  document.getElementById('pos-discount').value = 0;
  updateBill();
}
