// ---------------------
// Cart Helper Functions
// ---------------------

export function getCartItems() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

export function saveCartItems(cartItems) {
  localStorage.setItem('cart', JSON.stringify(cartItems));
}

export function addToCart(product, quantity = 1) {
  const cart = getCartItems();
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCartItems(cart);
}

export function updateCartItem(productId, newQuantity) {
  let cart = getCartItems();
  cart = cart.map(item =>
    item.id === productId ? { ...item, quantity: newQuantity } : item
  );
  saveCartItems(cart);
}

export function removeFromCart(productId) {
  const cart = getCartItems().filter(item => item.id !== productId);
  saveCartItems(cart);
}

export function clearCart() {
  localStorage.removeItem('cart');
}

export function calculateTotal() {
  const cart = getCartItems();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// ---------------------
// DOM Rendering Logic
// ---------------------

export function renderCart() {
  const cartItems = getCartItems();
  const cartContainer = document.getElementById('cart-items');
  const emptyMessage = document.getElementById('empty-cart-message');
  const totalEl = document.getElementById('cart-total');

  cartContainer.innerHTML = '';

  if (cartItems.length === 0) {
    emptyMessage.style.display = 'block';
    totalEl.textContent = '0.00';
    return;
  } else {
    emptyMessage.style.display = 'none';
  }

  cartItems.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-md-6';

    col.innerHTML = `
      <div class="card cart-item p-2">
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" class="me-3" />
          <div>
            <h5>${item.name}</h5>
            <p>$${item.price.toFixed(2)}</p>
            <div class="d-flex align-items-center">
              <label class="me-2">Qty:</label>
              <input type="number" min="1" value="${item.quantity}" class="form-control form-control-sm w-auto me-2 qty-input" data-id="${item.id}" />
              <button class="btn btn-danger btn-sm remove-btn" data-id="${item.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    cartContainer.appendChild(col);
  });

  // Update total
  totalEl.textContent = calculateTotal().toFixed(2);

  // Event listeners for quantity inputs
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const id = input.getAttribute('data-id');
      const newQty = parseInt(e.target.value);
      if (newQty > 0) {
        updateCartItem(id, newQty);
        renderCart();
      }
    });
  });

  // Event listeners for remove buttons
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', e => {
      const id = button.getAttribute('data-id');
      removeFromCart(id);
      renderCart();
    });
  });
}

// ---------------------
// Checkout Button Handler
// ---------------------

export function checkout() {
  if (getCartItems().length === 0) {
    alert('Your cart is empty!');
    return;
  }

  alert('Checkout successful!');
  clearCart();
  renderCart();
}

// ---------------------
// Load cart on page load
// ---------------------

document.addEventListener('DOMContentLoaded', renderCart);
