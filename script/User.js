  async function fetchUserData() {
    // 🔧 Placeholder for API call
    // Replace this mock data with an actual fetch call to your backend
    return {
      name: "John Doe",
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

  // 🧩 Maps backend status codes to user-facing labels and Bootstrap classes
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
    const main = document.getElementById("main");
    main.innerHTML = `
      <div class="bg-white p-4 rounded shadow-sm w-100">
        <h2 class="mb-4">Your Account</h2>
        <div class="row">
          <div class="col-md-6 mb-3">
            <h5 class="fw-semibold">Profile Info</h5>
            <p><strong>Name:</strong> ${user.name}</p>
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
    `;
  }

  // 🚀 Initialize
  document.addEventListener("DOMContentLoaded", async () => {
    const userData = await fetchUserData();
    renderAccountPage(userData);
  });
