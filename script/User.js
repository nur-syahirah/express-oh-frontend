// 🔧 Placeholder for API call
async function fetchUserData() {
  return {
    firstName: "john",
    middleName: "michael", // Optional
    lastName: "doe",
    email: "john.doe@example.com",
    address: "123 Roast Lane<br>Brewtown, BT 45678",
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

// Capitalizes a string (first letter uppercase, rest lowercase)
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Returns full name string: First [Middle] Last
function formatFullName(user) {
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  return parts.map(capitalize).join(" ");
}

// Converts order status to badge text and style
function mapStatus(status) {
  const statusMap = {
    delivered: { text: "Delivered", class: "bg-success" },
    processing: { text: "Processing", class: "bg-secondary" },
    cancelled: { text: "Cancelled", class: "bg-danger" },
    refunded: { text: "Refunded", class: "bg-warning text-dark" }
  };
  return statusMap[status] || { text: "Unknown", class: "bg-dark" };
}

// Renders the profile and order info
function renderAccountPage(user) {
  const main = document.getElementById("main");
  main.innerHTML = `
    <div class="bg-white p-4 rounded shadow-sm w-100">
      <h2 class="mb-4">Your Account</h2>
      <div class="row">
        <div class="col-md-6 mb-3">
          <h5 class="fw-semibold d-flex justify-content-between align-items-center">
            Profile Info
            <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editProfileModal">
              <i class="bi bi-pencil"></i> Edit
            </button>
          </h5>
          <p><strong>Name:</strong> ${formatFullName(user)}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Address:</strong><br>${user.address}</p>
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
                  <td><ul class="mb-0">${order.items.map(item => `<li>${item}</li>`).join("")}</ul></td>
                  <td>${order.total}</td>
                  <td><span class="badge ${statusInfo.class}">${statusInfo.text}</span></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
  createEditProfileModal(user);
}

// Creates the edit profile modal form
function createEditProfileModal(user) {
  const modal = document.createElement("div");
  modal.innerHTML = `
    <div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form id="editProfileForm">
            <div class="modal-header">
              <h5 class="modal-title" id="editProfileModalLabel">Edit Profile</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="editFirstName" class="form-label">First Name</label>
                <input type="text" class="form-control" id="editFirstName" value="${capitalize(user.firstName)}" required />
              </div>
              <div class="mb-3">
                <label for="editMiddleName" class="form-label">Middle Name <small class="text-muted">(Optional)</small></label>
                <input type="text" class="form-control" id="editMiddleName" value="${user.middleName ? capitalize(user.middleName) : ''}" />
              </div>
              <div class="mb-3">
                <label for="editLastName" class="form-label">Last Name</label>
                <input type="text" class="form-control" id="editLastName" value="${capitalize(user.lastName)}" required />
              </div>
              <div class="mb-3">
                <label for="editEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="editEmail" value="${user.email}" required />
              </div>
              <div class="mb-3">
                <label for="editAddress" class="form-label">Address</label>
                <textarea class="form-control" id="editAddress" rows="3">${user.address.replace(/<br>/g, "\n")}</textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary">Save Changes</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("editProfileForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedUser = {
      firstName: capitalize(document.getElementById("editFirstName").value.trim()),
      middleName: capitalize(document.getElementById("editMiddleName").value.trim()) || undefined,
      lastName: capitalize(document.getElementById("editLastName").value.trim()),
      email: document.getElementById("editEmail").value.trim(),
      address: document.getElementById("editAddress").value.replace(/\n/g, "<br>"),
      orders: user.orders
    };

    const modalInstance = bootstrap.Modal.getInstance(document.getElementById("editProfileModal"));
    modalInstance.hide();

    renderAccountPage(updatedUser);
  });
}

// 🚀 Initialize
document.addEventListener("DOMContentLoaded", async () => {
  const userData = await fetchUserData();
  renderAccountPage(userData);
});
