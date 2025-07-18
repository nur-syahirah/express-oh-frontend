import { capitalizeWords, maskCardNumber, parseJwt } from './utils.js';

const BACKEND_URL = "http://localhost:8080";

async function fetchUserProfile() {
  const token = localStorage.getItem('usertoken');
  console.log("[fetchUserProfile] Sending request...");
  try {
    const profileResponse = await fetch(`${BACKEND_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!profileResponse.ok) throw new Error('Failed to fetch profile');

    const profile = await profileResponse.json();
    console.log("[fetchUserProfile] Profile received:", profile);

    return {
      firstName: profile.firstName || "Not available",
      lastName: profile.lastName || "",
      email: profile.email || null,
      address: profile.address || "Not available",
      phone: profile.phone || "Not available",
    };
  } catch (error) {
    console.error(error);
    return {
      firstName: "Not available",
      lastName: "",
      email: "Not available",
      address: "Not available",
      phone: "Not available"
    };
  }
}

async function fetchUserCardDetails() {
  const token = localStorage.getItem('usertoken');
  console.log("[fetchUserCardDetails] Sending request...");
  try {
    const cardResponse = await fetch(`${BACKEND_URL}/api/user/profile/cardinfo`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!cardResponse.ok) throw new Error('Failed to fetch card details');
    const cardData = await cardResponse.json();
    console.log("[fetchUserCardDetails] Card data received:", cardData);
    return {
      cardholderName: cardData.cardName || "Not available",
      cardNumber: cardData.maskedCardNumber || "Not available",
      expiryDate: cardData.expiryDate || "Not available",
      cvv: "•••"
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchUserOrders() {
  const token = localStorage.getItem('usertoken');
  console.log("[fetchUserOrders] Sending request...");
  try {
    const ordersResponse = await fetch(`${BACKEND_URL}/api/user/profile/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
    const orders = await ordersResponse.json();
    console.log("[fetchUserOrders] Raw orders data:", orders);

    // Map backend order structure to frontend structure and flatten products
    const mappedOrders = orders.map(order => {
      const items = (order.products || []).map(product =>
        product.quantity && product.productName
          ? `${product.quantity} x ${product.productName}`
          : product.productName || "Unknown item"
      );
      const mappedOrder = {
        orderId: order.orderId,
        orderDate: order.orderDate,
        totalCost: order.totalCost,
        products: order.products || [],
        items,  // flattened items list
        status: order.status || "unknown"
      };
      console.log("[fetchUserOrders] Mapped order:", mappedOrder);
      return mappedOrder;
    });

    return mappedOrders;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function fetchUserData() {
  console.log("[fetchUserData] Fetching profile, card details, and orders in parallel...");
  const [profile, cardDetails, orders] = await Promise.all([
    fetchUserProfile(),
    fetchUserCardDetails(),
    fetchUserOrders()
  ]);

  const combinedData = {
    ...profile,
    cardDetails,
    orders
  };
  console.log("[fetchUserData] Combined user data:", combinedData);
  return combinedData;
}

function mapStatus(status) {
  const statusMap = {
    delivered: { text: "Delivered", class: "bg-success" },
    processing: { text: "Processing", class: "bg-secondary" },
    cancelled: { text: "Cancelled", class: "bg-danger" },
    refunded: { text: "Refunded", class: "bg-warning text-dark" }
  };
  return statusMap[status] || { text: "Unknown", class: "bg-dark" };
}

function renderAccountPage(user) {
  console.log("[renderAccountPage] Rendering with user data:", user);

  const main = document.getElementById("main");
  const fullName = [user.firstName, user.lastName]
    .filter(n => n && n.trim() !== "")
    .join(" ");

  const cardholderNameDisplay = user.cardDetails?.cardholderName || "Not provided";
  const cardNumberMasked = user.cardDetails?.cardNumber
    ? user.cardDetails.cardNumber
    : "Not provided";
  const expiryDateDisplay = user.cardDetails?.expiryDate || "Not provided";

  main.innerHTML = `
    <div class="bg-white p-4 rounded shadow-sm w-100">
      <h2 class="mb-4">Your Account</h2>
      <div class="row">
        <div class="col-md-6 mb-3">
          <h5 class="fw-semibold">Profile Info</h5>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${user.email || "Not provided"}</p>
          <p><strong>Phone:</strong> ${user.phone || "Not provided"}</p>
          <p><strong>Address:</strong><br>${user.address}</p>
          <p><strong>Cardholder Name:</strong> ${cardholderNameDisplay}</p>
          <p><strong>Card Number:</strong> ${cardNumberMasked}</p>
          <p><strong>Expiry Date:</strong> ${expiryDateDisplay}</p>
          <button id="editProfileBtn" class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#editProfileModal">Edit Profile</button>
        </div>
      </div>

      <hr class="my-4" />

      <h5 class="fw-semibold mb-3">Order History</h5>
      <div class="table-responsive">
        <table class="table table-striped table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th scope="col">Order #</th>
              <th scope="col">Date</th>
              <th scope="col">Items</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            ${user.orders.map(order => {
              // Using the flattened items list for display
              const itemsList = order.items.map(item => `<li>${item}</li>`).join("");

              const statusInfo = mapStatus(order.status);
              return `
                <tr>
                  <td>${order.orderId}</td>
                  <td>${new Date(order.orderDate).toLocaleString()}</td>
                  <td><ul class="mb-0">${itemsList}</ul></td>
                  <td>${order.totalCost.toFixed(2)}</td>
                  <td><span class="badge ${statusInfo.class}">${statusInfo.text}</span></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editProfileModalLabel">Edit Profile</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editProfileForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">First Name *</label>
                  <input type="text" class="form-control text-capitalize" id="firstName" name="firstName" required value="${user.firstName}">
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Last Name (Optional)</label>
                  <input type="text" class="form-control text-capitalize" id="lastName" name="lastName" value="${user.lastName || ''}">
                </div>
                <div class="col-md-6">
                  <label for="phone" class="form-label">Phone</label>
                  <input type="text" class="form-control" id="phone" name="phone" maxlength="8" value="${user.phone || ''}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" value="${user.email || ''}" disabled>
                </div>
                <div class="col-12">
                  <label for="address" class="form-label">Address *</label>
                  <textarea class="form-control" id="address" name="address" rows="3" required>${user.address.replace(/<br>/g, "\n")}</textarea>
                </div>
              </div>

              <hr>

              <h6>Card Details (Optional)</h6>
              <div class="row g-3">
                <div class="col-md-3">
                  <label for="cardholderName" class="form-label">Cardholder Name</label>
                  <input type="text" class="form-control text-capitalize" id="cardholderName" name="cardholderName" value="${user.cardDetails?.cardholderName || ''}">
                </div>
                <div class="col-md-3">
                  <label for="cardNumber" class="form-label">Card Number</label>
                  <input type="text" class="form-control" id="cardNumber" name="cardNumber" maxlength="19" value="${user.cardDetails?.cardNumber || ''}">
                </div>
                <div class="col-md-3">
                  <label for="expiryDate" class="form-label">Expiry Date</label>
                  <input type="text" class="form-control" id="expiryDate" name="expiryDate" maxlength="5" value="${user.cardDetails?.expiryDate || ''}">
                </div>
                <div class="col-md-3">
                  <label for="cvv" class="form-label">CVV</label>
                  <input type="text" class="form-control" id="cvv" name="cvv" maxlength="4" value="${user.cardDetails?.cvv || ''}">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" form="editProfileForm" class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("editProfileForm").addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const updatedUser = {
      firstName: capitalizeWords(formData.get("firstName").trim()),
      lastName: capitalizeWords(formData.get("lastName").trim() || ""),
      phone: formData.get("phone").trim(),
      address: formData.get("address").trim().replace(/\n/g, "<br>")
    };

    const newCardName = formData.get("cardholderName").trim();
    const newCardNum = formData.get("cardNumber").replace(/\D/g, "");
    const newExp = formData.get("expiryDate").trim();
    const newCVV = formData.get("cvv").trim();
    const allCardFieldsEmpty = [newCardName, newCardNum, newExp, newCVV].every(v => v === "");

    if (!allCardFieldsEmpty) {
      updatedUser.cardName = newCardName;
      updatedUser.cardNumber = newCardNum;
      updatedUser.cardExpiry = newExp;
      updatedUser.cardCvv = newCVV;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("usertoken") || ""}`
        },
        body: JSON.stringify(updatedUser)
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const modalElement = document.getElementById("editProfileModal");
      bootstrap.Modal.getOrCreateInstance(modalElement).hide();

      const newUserData = await fetchUserData();
      renderAccountPage(newUserData);

    } catch (error) {
      console.error("❌", error);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[DOMContentLoaded] Initializing user data fetch and render...");
  const userData = await fetchUserData();
  renderAccountPage(userData);
});
