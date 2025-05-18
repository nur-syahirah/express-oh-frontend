document.getElementById('modal-confirm-btn').addEventListener('click', () => {
  const modalEl = document.getElementById('addToCartModal');
  const productId = modalEl.querySelector('#modal-product-id').value;
  const quantity = parseInt(modalEl.querySelector('#modal-quantity').value, 10);

  const product = modelController.items.find(item => item.id.toString() === productId);
  if (!product || quantity < 1) return;

  // Get or initialize cart
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Check if item exists in cart
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += quantity; // Update quantity
  } else {
    cart.push({ ...product, quantity }); // Add new item
  }

  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Update UI
  updateCartCount(); // From navbar.js

  // Close modal
  bootstrap.Modal.getInstance(modalEl).hide();
});