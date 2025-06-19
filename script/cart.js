// ---------------------
// Cart Helper Functions
// ---------------------

const backendUrl = "http://localhost:8080";

// Migrate old cart entries to fix image URLs by prepending backend URL if needed
function migrateCartImages() {
  const cart = localStorage.getItem('cart');
  if (!cart) return;

  let cartItems = JSON.parse(cart);
  let changed = false;

  cartItems = cartItems.map(item => {
    if (item.image && !item.image.startsWith('http')) {
      const normalizedPath = item.image.startsWith('/') ? item.image : `/${item.image}`;
      const newImage = `${backendUrl}${normalizedPath}`;
      if (item.image !== newImage) {
        item.image = newImage;
        changed = true;
      }
    }
    return item;
  });

  if (changed) {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    console.log('Cart image URLs updated with backend URL.');
  }
}

// Run migration immediately on script load
migrateCartImages();

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
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageURL, 
      quantity
    });
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

    // image URL is already fixed by migrateCartImages
    const imageSrc = item.image;

    col.innerHTML = `
      <div class="card cart-item p-2">
        <div class="d-flex align-items-center">
          <img src="${imageSrc}" alt="${item.name}" class="me-3" style="width: 100px; height: auto;" />
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
