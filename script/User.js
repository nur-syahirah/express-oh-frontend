import { capitalizeWords, maskCardNumber, parseJwt } from './utils.js';

async function fetchUserData() {
  console.log("🔍 fetchUserData() called");
  try {
    const token = localStorage.getItem('usertoken');
    let userEmail = null;

    if (token) {
      const payload = parseJwt(token);
      console.log("JWT Payload:", payload); // optional: inspect the token content
      userEmail = payload?.sub || null;
    }

    const response = await fetch('http://localhost:8080/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile from API');
    }

    const profile = await response.json();

    return {
      firstName: profile.firstName || "Not available",
      middleName: profile.middleName || "",
      lastName: profile.lastName || "",
      email: profile.email || userEmail || "Not available",
      address: profile.address || "Not available",
      phone: profile.phone || "Not available",
      cardDetails: profile.cardDetails
        ? {
            cardholderName: profile.cardDetails.cardholderName || "Not available",
            cardNumber: profile.cardDetails.cardNumber || "Not available",
            expiryDate: profile.cardDetails.expiryDate || "Not available",
            cvv: profile.cardDetails.cvv || "Not available"
          }
        : null,
      orders: [
        {
          number: "#10234",
          date: "2025-06-01",
          items: [
            "2x Colombian Medium Roast (250g)",
            "1x Brazil Dark Roast (1kg)"
          ],
          total: "$36.00",
          status: "delivered"
        },
        {
          number: "#10210",
          date: "2025-05-25",
          items: [
            "1x Ethiopian Light Roast (500g)",
            "1x Kenya AA Medium Roast (250g)"
          ],
          total: "$28.50",
          status: "processing"
        }
      ]
    };

  } catch (error) {
    console.error(error);
    return {
      firstName: "Not available",
      middleName: "",
      lastName: "",
      email: "Not available",
      address: "Not available",
      phone: "Not available",
      cardDetails: null,
      orders: [
        {
          number: "#10234",
          date: "2025-06-01",
          items: [
            "2x Colombian Medium Roast (250g)",
            "1x Brazil Dark Roast (1kg)"
          ],
          total: "$36.00",
          status: "delivered"
        },
        {
          number: "#10210",
          date: "2025-05-25",
          items: [
            "1x Ethiopian Light Roast (500g)",
            "1x Kenya AA Medium Roast (250g)"
          ],
          total: "$28.50",
          status: "processing"
        }
      ]
    };
  }
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

const BACKEND_URL = "http://localhost:8080"; // Change this to match your backend port

function renderAccountPage(user) {
  const main = document.getElementById("main");
  const fullName = [user.firstName, user.middleName, user.lastName]
    .filter(n => n && n.trim() !== "")
    .join(" ");

  const cardNumberMasked = user.cardDetails?.cardNumber
    ? maskCardNumber(user.cardDetails.cardNumber)
    : "Not provided";

  const cardholderNameDisplay = user.cardDetails?.cardholderName || "Not provided";
  const expiryDateDisplay = user.cardDetails?.expiryDate || "Not provided";
  const cvvDisplay = user.cardDetails?.cvv ? "•••" : "Not provided";

  main.innerHTML = `
    <div class="bg-white p-4 rounded shadow-sm w-100">
      <h2 class="mb-4">Your Account</h2>
      <div class="row">
        <div class="col-md-6 mb-3">
          <h5 class="fw-semibold">Profile Info</h5>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.phone || "Not provided"}</p>
          <p><strong>Address:</strong><br>${user.address}</p>
          <p><strong>Cardholder Name:</strong> ${cardholderNameDisplay}</p>
          <p><strong>Card Number:</strong> ${cardNumberMasked}</p>
          <p><strong>Expiry Date:</strong> ${expiryDateDisplay}</p>
          <p><strong>CVV:</strong> ${cvvDisplay}</p>
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
              const statusInfo = mapStatus(order.status);
              return `
                <tr>
                  <td>${order.number}</td>
                  <td>${order.date}</td>
                  <td>
                    <ul class="mb-0">
                      ${order.items.map(item => `<li>${item}</li>`).join("")}
                    </ul>
                  </td>
                  <td>${order.total}</td>
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
                <div class="col-md-4">
                  <label for="firstName" class="form-label">First Name *</label>
                  <input type="text" class="form-control text-capitalize" id="firstName" name="firstName" required value="${user.firstName}">
                </div>
                <div class="col-md-4">
                  <label for="middleName" class="form-label">Middle Name (Optional)</label>
                  <input type="text" class="form-control text-capitalize" id="middleName" name="middleName" value="${user.middleName || ''}">
                </div>
                <div class="col-md-4">
                  <label for="lastName" class="form-label">Last Name (Optional)</label>
                  <input type="text" class="form-control text-capitalize" id="lastName" name="lastName" value="${user.lastName || ''}">
                </div>
                <div class="col-md-6">
                  <label for="phone" class="form-label">Phone (local, no area code)</label>
                  <input type="text" class="form-control" id="phone" name="phone" maxlength="8" placeholder="e.g. 91234567" value="${user.phone || ''}">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" value="${user.email}" disabled>
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
                  <input type="text" class="form-control" id="cardNumber" name="cardNumber" maxlength="19" placeholder="1234 5678 9012 3456" value="${user.cardDetails?.cardNumber || ''}">
                </div>
                <div class="col-md-3">
                  <label for="expiryDate" class="form-label">Expiry Date (MM/YY)</label>
                  <input type="text" class="form-control" id="expiryDate" name="expiryDate" maxlength="5" placeholder="MM/YY" value="${user.cardDetails?.expiryDate || ''}">
                </div>
                <div class="col-md-3">
                  <label for="cvv" class="form-label">CVV</label>
                  <input type="text" class="form-control" id="cvv" name="cvv" maxlength="4" placeholder="123" value="${user.cardDetails?.cvv || ''}">
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

  const editProfileForm = document.getElementById("editProfileForm");
  editProfileForm.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(editProfileForm);

    const newCardName = formData.get("cardholderName").trim();
    const newCardNum = formData.get("cardNumber").replace(/\D/g, "");
    const newExp = formData.get("expiryDate").trim();
    const newCVV = formData.get("cvv").trim();

    // Validate CVV format if present
    if (newCVV && !/^\d{3,4}$/.test(newCVV)) {
      console.error("CVV must be 3 or 4 digits.");
      return;
    }

    // Determine if any card details should be sent
    const allCardFieldsEmpty = [newCardName, newCardNum, newExp, newCVV].every(value => value === "");

    const updatedUser = {
      firstName: capitalizeWords(formData.get("firstName").trim()),
      middleName: capitalizeWords(formData.get("middleName").trim() || ""),
      lastName: capitalizeWords(formData.get("lastName").trim() || ""),
      phone: formData.get("phone").trim(),
      address: formData.get("address").trim().replace(/\n/g, "<br>"),
      orders: user.orders // keep this if your frontend UI needs it after response
    };

    // Only include card fields if something was entered
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${errorText}`);
      }

      const savedProfile = await response.json();
      console.log("Saved profile response:", savedProfile);

      const modalElement = document.getElementById("editProfileModal");
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.hide();

      renderAccountPage({
        ...user,
        ...savedProfile
      });
    } catch (error) {
      console.error(error.message);
    }
  });

}

document.addEventListener("DOMContentLoaded", async () => {
  const userData = await fetchUserData();
  console.log("✅ User data:", userData);
  renderAccountPage(userData);
});
