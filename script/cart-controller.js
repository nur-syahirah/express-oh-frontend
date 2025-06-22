import { 
  getCartItems, 
  saveCartItems, 
  clearCart 
} from './cart.js';

const BACKEND_URL = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutModalEl = document.getElementById('checkoutModal');
  const checkoutModal = new bootstrap.Modal(checkoutModalEl);

  const checkoutSummary = document.getElementById('checkout-summary');
  const checkoutTotal = document.getElementById('checkout-total');

  // Customer info inputs
  const firstNameInput = document.getElementById('checkout-first-name');
  const lastNameInput = document.getElementById('checkout-last-name');
  const checkoutEmailInput = document.getElementById('checkout-email');
  const checkoutAddressInput = document.getElementById('checkout-address');

  // Card inputs
  const cardNameInput = document.getElementById('cardholder-name');
  const cardNumberInput = document.getElementById('card-number');
  const cardExpiryInput = document.getElementById('card-expiry');
  const cardCvcInput = document.getElementById('card-cvc');

  let cart = getCartItems();

  // Safely ensure global updateCartCount exists (fallback)
  window.updateCartCount = window.updateCartCount || function() {
    console.warn('updateCartCount() is not defined.');
  };

  function renderCart() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      document.getElementById('empty-cart-message').style.display = 'block';
      checkoutBtn.disabled = true;
      cartTotalEl.textContent = '0.00';
      window.updateCartCount();
      return;
    } else {
      document.getElementById('empty-cart-message').style.display = 'none';
      checkoutBtn.disabled = false;
    }

    let total = 0;
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const itemHtml = `
        <div class="col-12 cart-item d-flex align-items-center gap-3 border p-3 rounded align-items-center">
          <img src="${item.image}" alt="${item.name}" class="img-thumbnail" style="max-width: 80px;" />
          <div class="flex-grow-1">
            <h5>${item.name}</h5>
            <label for="qty-${item.id}" class="form-label mb-1">Quantity:</label>
            <input 
              type="number" 
              id="qty-${item.id}" 
              class="form-control form-control-sm quantity-input" 
              value="${item.quantity}" 
              min="1" 
              style="width: 70px;"
            />
            <p class="mt-2 mb-1">Price: $${item.price.toFixed(2)}</p>
          </div>
          <div class="fw-bold fs-5">$${itemTotal.toFixed(2)}</div>
          <button class="btn btn-danger btn-sm remove-btn" data-id="${item.id}">Remove</button>
        </div>
      `;
      cartItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
    cartTotalEl.textContent = total.toFixed(2);

    // Remove button handlers
    document.querySelectorAll('.remove-btn').forEach(button => {
      button.addEventListener('click', () => {
        const productId = parseInt(button.getAttribute('data-id'));
        removeFromCart(productId);
        renderCart();
        window.updateCartCount();
      });
    });

    // Quantity input change handlers
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const newQty = parseInt(e.target.value);
        const productId = parseInt(e.target.id.replace('qty-', ''));

        if (isNaN(newQty) || newQty < 1) {
          alert('Quantity must be at least 1');
          e.target.value = 1;
          return;
        }

        updateCartItemQuantity(productId, newQty);
        renderCart();
        window.updateCartCount();
      });
    });
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartItems(cart);
    console.log(`Removed product ID ${productId} from cart.`);
  }

  function updateCartItemQuantity(productId, newQuantity) {
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity = newQuantity;
      saveCartItems(cart);
      console.log(`Updated quantity for product ID ${productId} to ${newQuantity}`);
    }
  }

  async function fetchUserProfile() {
    try {
      const token = localStorage.getItem('usertoken');
      if (!token) return null;
      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async function fetchCardInfo() {
    try {
      const token = localStorage.getItem('usertoken');
      if (!token) return null;
      const response = await fetch(`${BACKEND_URL}/api/user/profile/cardinfo`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async function prepareCheckoutModal() {
    checkoutSummary.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.textContent = `${item.name} x${item.quantity}`;
      const span = document.createElement('span');
      span.className = 'badge bg-primary rounded-pill';
      span.textContent = `$${itemTotal.toFixed(2)}`;
      li.appendChild(span);
      checkoutSummary.appendChild(li);
    });

    checkoutTotal.textContent = total.toFixed(2);

    const profile = await fetchUserProfile();

    if (profile) {
      firstNameInput.value = profile.firstName || '';
      lastNameInput.value = profile.lastName || '';
      checkoutEmailInput.value = profile.email || '';
      checkoutAddressInput.value = profile.address || '';
    } else {
      firstNameInput.value = '';
      lastNameInput.value = '';
      checkoutEmailInput.value = '';
      checkoutAddressInput.value = '';
    }

    const cardInfo = await fetchCardInfo();
    if (cardInfo && cardInfo.maskedCardNumber) {
      addCardOptionToggle(cardInfo);
    } else {
      clearCardInputs();
      enableCardInputs(true);
      removeCardOptionToggle();
    }
  }

  function addCardOptionToggle(cardInfo) {
    removeCardOptionToggle();

    const container = document.createElement('div');
    container.id = 'card-option-container';
    container.className = 'mb-3';
    container.innerHTML = `
      <label class="form-label">Payment Method</label>
      <div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="cardOption" id="useSavedCard" value="saved" checked>
          <label class="form-check-label" for="useSavedCard">
            Use Saved Card (${cardInfo.maskedCardNumber} - Exp: ${cardInfo.expiryDate})
          </label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="cardOption" id="useNewCard" value="new">
          <label class="form-check-label" for="useNewCard">Use Different Card</label>
        </div>
      </div>
    `;
    const cardNumberFormGroup = cardNumberInput.closest('.mb-3');
    cardNumberFormGroup.parentNode.insertBefore(container, cardNumberFormGroup);

    enableCardInputs(false);

    document.getElementById('useSavedCard').addEventListener('change', () => enableCardInputs(false));
    document.getElementById('useNewCard').addEventListener('change', () => enableCardInputs(true));
  }

  function removeCardOptionToggle() {
    const existing = document.getElementById('card-option-container');
    if (existing) existing.remove();
  }

  function enableCardInputs(enable) {
    cardNameInput.disabled = !enable;
    cardNumberInput.disabled = !enable;
    cardExpiryInput.disabled = !enable;
    cardCvcInput.disabled = !enable;

    if (!enable) {
      cardNameInput.value = '';
      cardNumberInput.value = '';
      cardExpiryInput.value = '';
      cardCvcInput.value = '';
    }
  }

  function clearCardInputs() {
    cardNameInput.value = '';
    cardNumberInput.value = '';
    cardExpiryInput.value = '';
    cardCvcInput.value = '';
  }

  renderCart();

  checkoutBtn.addEventListener('click', async () => {
    await prepareCheckoutModal();
    checkoutModal.show();
  });

  document.getElementById('checkout-form').addEventListener('submit', async e => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      checkoutModal.hide();
      return;
    }

    const customerInfo = {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: checkoutEmailInput.value.trim(),
      address: checkoutAddressInput.value.trim(),
    };

    if (!customerInfo.firstName || !customerInfo.email || !customerInfo.address) {
      alert("Please fill in all required customer information.");
      return;
    }

    const useSavedCard = document.getElementById('useSavedCard')?.checked ?? false;

    let paymentInfo = null;
    if (useSavedCard) {
      paymentInfo = { savedCard: true };
    } else {
      const cardName = cardNameInput.value.trim();
      const cardNum = cardNumberInput.value.trim();
      const expiry = cardExpiryInput.value.trim();
      const cvc = cardCvcInput.value.trim();

      if (!cardNum || !expiry || !cvc || !cardName) {
        alert("Please fill in all card details.");
        return;
      }

      paymentInfo = {
        savedCard: false,
        cardNumber: cardNum,
        expiryDate: expiry,
        cvc: cvc,
        cardName: cardName
      };
    }

    const products = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    const token = localStorage.getItem('usertoken');
    if (!token) {
      alert("You must be logged in to place an order.");
      return;
    }

    const profilePayload = {
      ...customerInfo,
      ...(paymentInfo.savedCard ? {} : {
        cardName: paymentInfo.cardName,
        cardNumber: paymentInfo.cardNumber,
        cardExpiry: paymentInfo.expiryDate,
        cardCvv: paymentInfo.cvc
      })
    };

    try {
      await fetch(`${BACKEND_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profilePayload)
      });
    } catch (err) {
      console.warn("Profile update failed:", err);
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products })
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Order failed: ${errorText}`);
        return;
      }

      alert("Order placed successfully!");
      cart = [];
      clearCart();
      renderCart();
      checkoutModal.hide();

    } catch (error) {
      alert(`Order submission error: ${error.message}`);
    }
  });
});
