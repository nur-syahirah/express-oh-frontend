import {
  getCartItems,
  updateCartItem,
  removeFromCart,
  calculateTotal,
  clearCart
} from './cart.js';
  
document.addEventListener('DOMContentLoaded', () => {
  console.log('Cart page loaded. Cart:', JSON.parse(localStorage.getItem('cart')));

  const cartContainer = document.getElementById('cart-items');
  const totalElement = document.getElementById('cart-total');
  const checkoutButton = document.getElementById('checkout-btn');

  renderCart();

  function renderCart() {
    const cartItems = getCartItems();
    cartContainer.innerHTML = '';

    if (cartItems.length === 0) {
      cartContainer.innerHTML = '<p class="text-center">Your cart is empty.</p>';
      totalElement.textContent = '$0.00';
      checkoutButton.disabled = true;
      return;
    }

    cartItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'row align-items-center border-bottom py-3';

      row.innerHTML = `
        <div class="col-md-2 text-center">
          <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" style="max-height: 80px;">
        </div>
        <div class="col-md-3 text-center fw-semibold">${item.name}</div>
        <div class="col-md-2 text-center">$${item.price.toFixed(2)}</div>
        <div class="col-md-2 text-center">
          <input type="number" class="form-control quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
        </div>
        <div class="col-md-2 text-center fw-semibold">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="col-md-1 text-center">
          <button class="btn btn-sm btn-outline-danger remove-btn" data-id="${item.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      cartContainer.appendChild(row);
    });

    totalElement.textContent = `$${calculateTotal().toFixed(2)}`;
    checkoutButton.disabled = false;
  }

  // Update quantity
  cartContainer.addEventListener('input', e => {
    if (e.target.classList.contains('quantity-input')) {
      const productId = parseInt(e.target.dataset.id);
      const newQuantity = parseInt(e.target.value);

      if (!isNaN(newQuantity) && newQuantity > 0) {
        updateCartItem(productId, newQuantity);
        renderCart();
      }
    }
  });

  // Remove item
  cartContainer.addEventListener('click', e => {
    if (e.target.closest('.remove-btn')) {
      const productId = parseInt(e.target.closest('.remove-btn').dataset.id);
      removeFromCart(productId);
      renderCart();
    }
  });

  // Checkout modal logic
  const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
  const summaryList = document.getElementById('checkout-summary');
  const summaryTotal = document.getElementById('checkout-total');
  const checkoutForm = document.getElementById('checkout-form');
  // const checkoutButton already declared above

  // Open modal on checkout button click
  checkoutButton.addEventListener('click', () => {
    const cartItems = getCartItems();
    summaryList.innerHTML = '';

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    cartItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `${item.name} × ${item.quantity}<span>$${(item.price * item.quantity).toFixed(2)}</span>`;
      summaryList.appendChild(li);
    });

    summaryTotal.textContent = calculateTotal().toFixed(2);
    checkoutModal.show();
  });

  // Handle form submission - Send order to backend
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable submit button to prevent duplicates
    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing order...';

    const name = document.getElementById('checkout-name').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    const cardNumber = document.getElementById('card-number').value.trim();
    const cardExpiry = document.getElementById('card-expiry').value.trim();
    const cardCVC = document.getElementById('card-cvc').value.trim();

    if (!name || !email || !address || !cardNumber || !cardExpiry || !cardCVC) {
      alert('Please fill in all required fields.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
      return;
    }

    const cartItems = getCartItems();

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
      return;
    }

    const orderPayload = {
      products: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const token = localStorage.getItem('usertoken');

      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order failed: ${errorText}`);
      }

      alert(`Thank you for your purchase, ${name}! Your order was placed successfully.`);
      clearCart();
      checkoutModal.hide();
      renderCart();
      checkoutForm.reset();

    } catch (error) {
      alert(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  });
});
