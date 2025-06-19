import { 
  getCartItems, 
  saveCartItems, 
  renderCart as helperRenderCart, 
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
  const checkoutNameInput = document.getElementById('checkout-name');
  const checkoutEmailInput = document.getElementById('checkout-email');
  const checkoutAddressInput = document.getElementById('checkout-address');

  // Card inputs
  const cardNumberInput = document.getElementById('card-number');
  const cardExpiryInput = document.getElementById('card-expiry');
  const cardCvcInput = document.getElementById('card-cvc');

  // Initialize local cart variable from helper (normalized & migrated)
  let cart = getCartItems();

  // Render cart UI based on local cart variable
  function renderCart() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      document.getElementById('empty-cart-message').style.display = 'block';
      checkoutBtn.disabled = true;
      cartTotalEl.textContent = '0.00';
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
        <div class="col-12 cart-item d-flex align-items-center gap-3 border p-3 rounded">
          <img src="${item.image}" alt="${item.name}" class="img-thumbnail" />
          <div class="flex-grow-1">
            <h5>${item.name}</h5>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: $${item.price.toFixed(2)}</p>
          </div>
          <div class="fw-bold fs-5">$${itemTotal.toFixed(2)}</div>
        </div>
      `;
      cartItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
    cartTotalEl.textContent = total.toFixed(2);
  }

  // Fetch user profile info to prefill checkout form
  async function fetchUserProfile() {
    try {
      const token = localStorage.getItem('usertoken');
      if (!token) return null;

      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return null;
      const profile = await response.json();
      return profile;
    } catch {
      return null;
    }
  }

  // Fetch saved card info (masked)
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

  // Prepare checkout modal with order summary and user info
  async function prepareCheckoutModal() {
    // Clear previous summary
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

    // Prefill user info if logged in
    const profile = await fetchUserProfile();

    if (profile) {
      checkoutNameInput.value = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
      checkoutEmailInput.value = profile.email || '';
      checkoutAddressInput.value = profile.address || '';
    } else {
      checkoutNameInput.value = '';
      checkoutEmailInput.value = '';
      checkoutAddressInput.value = '';
    }

    // Handle card info option toggle
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

    document.getElementById('useSavedCard').addEventListener('change', () => {
      enableCardInputs(false);
    });
    document.getElementById('useNewCard').addEventListener('change', () => {
      enableCardInputs(true);
    });
  }

  function removeCardOptionToggle() {
    const existing = document.getElementById('card-option-container');
    if (existing) existing.remove();
  }

  function enableCardInputs(enable) {
    cardNumberInput.disabled = !enable;
    cardExpiryInput.disabled = !enable;
    cardCvcInput.disabled = !enable;

    if (!enable) {
      cardNumberInput.value = '';
      cardExpiryInput.value = '';
      cardCvcInput.value = '';
    }
  }

  function clearCardInputs() {
    cardNumberInput.value = '';
    cardExpiryInput.value = '';
    cardCvcInput.value = '';
  }

  // Initial render on page load
  renderCart();

  checkoutBtn.addEventListener('click', async () => {
    await prepareCheckoutModal();
    checkoutModal.show();
  });

  // Checkout form submit handler
  const checkoutForm = document.getElementById('checkout-form');
  checkoutForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      checkoutModal.hide();
      return;
    }

    // Collect customer info
    const customerInfo = {
      name: checkoutNameInput.value.trim(),
      email: checkoutEmailInput.value.trim(),
      address: checkoutAddressInput.value.trim(),
    };

    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      alert("Please fill in all required customer information.");
      return;
    }

    // Payment info
    const useSavedCard = document.getElementById('useSavedCard')?.checked ?? false;

    let paymentInfo = null;
    if (useSavedCard) {
      paymentInfo = { savedCard: true };
    } else {
      const cardNum = cardNumberInput.value.trim();
      const expiry = cardExpiryInput.value.trim();
      const cvc = cardCvcInput.value.trim();

      if (!cardNum || !expiry || !cvc) {
        alert("Please fill in all card details.");
        return;
      }
      paymentInfo = {
        savedCard: false,
        cardNumber: cardNum,
        expiryDate: expiry,
        cvc: cvc,
      };
    }

    // TODO: Send order data (cart, customerInfo, paymentInfo) to backend API

    console.log("Submitting order:", { cart, customerInfo, paymentInfo });

    alert("Order placed successfully!");

    // Clear cart both local variable and localStorage helper
    cart = [];
    clearCart();

    renderCart();
    checkoutModal.hide();
  });
});
