/*-------------------------
  LOCAL STORAGE HANDLING (Admin)
  - For flavors and products; product form image preview remains empty on reload.
-------------------------*/
window.addEventListener("load", function() {
  // Clear the admin product form image preview on load.
  document.getElementById("adminImagePreview").src = "";
  localStorage.removeItem("adminSavedImage");

  // Load stored admin flavor options (if any)
  const storedFlavors = localStorage.getItem("adminFlavorOptions");
  // Do not restore previous selections; always start with no selected flavors.
  selectedFlavors = [];
  if (storedFlavors) {
    flavorOptions = JSON.parse(storedFlavors);
  }
  renderFlavorOptions();
  updateFlavorsButtonText();
  
  // Load admin products from localStorage if available.
  const storedProducts = localStorage.getItem("adminProducts");
  if (storedProducts) {
    products = JSON.parse(storedProducts);
    renderProducts();
  } else {
    fetchProducts().then(data => {
      products = data;
      localStorage.setItem("adminProducts", JSON.stringify(products));
      renderProducts();
    });
  }
});

/*-------------------------
  IMAGE UPLOAD HANDLER (Admin)
-------------------------*/
document.getElementById("adminProductImage").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      const imageUrl = ev.target.result;
      document.getElementById("adminImagePreview").src = imageUrl;
      localStorage.setItem("adminSavedImage", imageUrl);
    };
    reader.readAsDataURL(file);
  }
});

/*-------------------------
  FLAVORS HANDLING (Admin)
-------------------------*/
let flavorOptions = JSON.parse(localStorage.getItem("adminFlavorOptions")) || ["Vanilla", "Chocolate", "Caramel", "Hazelnut"];
let selectedFlavors = []; // Always start with no selected flavors

function saveFlavorsToLocalStorage() {
  localStorage.setItem("adminFlavorOptions", JSON.stringify(flavorOptions));
  localStorage.setItem("adminSelectedFlavors", JSON.stringify(selectedFlavors));
}

function renderFlavorOptions() {
  const container = document.getElementById("adminDropdownFlavorOptions");
  container.innerHTML = "";
  flavorOptions.forEach(flavor => {
    const li = document.createElement("li");
    li.className = "mb-1";
    li.innerHTML = `
      <div class="d-flex align-items-center justify-content-between">
        <div class="form-check">
          <input class="form-check-input flavor-checkbox" type="checkbox" value="${flavor}" id="adminChk-${flavor}">
          <label class="form-check-label" for="adminChk-${flavor}">${flavor}</label>
        </div>
        <button type="button" class="btn btn-sm remove-flavor" onclick="removeFlavorOption('${flavor}')" style="margin-left:5px; background: none; border: none; color: #6c757d;">&times;</button>
      </div>
    `;
    container.appendChild(li);
  });
  document.querySelectorAll(".flavor-checkbox").forEach(chk => {
    // On reload, ensure checkboxes are unticked.
    chk.checked = false;
    chk.addEventListener("change", updateSelectedFlavors);
  });
  saveFlavorsToLocalStorage();
}

function updateSelectedFlavors() {
  selectedFlavors = [];
  document.querySelectorAll(".flavor-checkbox").forEach(chk => {
    if (chk.checked) {
      selectedFlavors.push(chk.value);
    }
  });
  updateFlavorsButtonText();
  saveFlavorsToLocalStorage();
}

function updateFlavorsButtonText() {
  const btn = document.getElementById("adminFlavorsDropdownButton");
  btn.innerText = selectedFlavors.length ? selectedFlavors.join(", ") : "Select Flavors";
}

document.getElementById("adminNewFlavorInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter" || e.keyCode === 13) {
    e.preventDefault();
    const newFlavor = e.target.value.trim();
    if (newFlavor !== "" && !flavorOptions.includes(newFlavor)) {
      flavorOptions.push(newFlavor);
      selectedFlavors.push(newFlavor);
    }
    renderFlavorOptions();
    updateFlavorsButtonText();
    e.target.value = "";
    saveFlavorsToLocalStorage();
  }
});

function removeFlavorOption(flavor) {
  const index = flavorOptions.indexOf(flavor);
  if (index > -1) {
    flavorOptions.splice(index, 1);
  }
  const sIndex = selectedFlavors.indexOf(flavor);
  if (sIndex > -1) {
    selectedFlavors.splice(sIndex, 1);
  }
  updateFlavorsButtonText();
  renderFlavorOptions();
  saveFlavorsToLocalStorage();
}

/*-------------------------
  SALES ORDERS CHART (Admin - Grey Theme)
-------------------------*/
const salesData = {
  labels: ["April", "May", "June", "July"],
  orders: [25, 50, 75, 100]
};
const adminCtx = document.getElementById("adminSalesChart").getContext("2d");
const salesChart = new Chart(adminCtx, {
  type: "line",
  data: {
    labels: salesData.labels,
    datasets: [{
      label: "Orders",
      data: salesData.orders,
      borderColor: "#808080",
      backgroundColor: "rgba(128,128,128,0.1)",
      fill: true,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } }
  }
});

/*-------------------------
  PRODUCT MANAGEMENT (Admin)
-------------------------*/
const initialProducts = [
  {
    id: 1,
    name: "Product 1",
    description: "Description of product 1",
    price: 66.66,
    image: "./images/cuphead.png",
    quantity: 100,
    flavors: ["Vanilla", "Chocolate", "Caramel", "Hazelnut"]
  }
];
let products = [];

function fetchProducts() {
  return new Promise(resolve => {
    setTimeout(() => resolve(initialProducts), 500);
  });
}

function renderProducts() {
  const tbody = document.getElementById("adminProductTableBody");
  tbody.innerHTML = "";
  products.forEach((product, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${product.image}" alt="${product.name}" class="img-fluid" width="50"></td>
      <td>${product.name}</td>
      <td>${product.description}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.quantity}</td>
      <td>${Array.isArray(product.flavors) ? product.flavors.join(", ") : "No flavors"}</td>
      <td>
        <button class="btn action-btn" onclick="editProduct(${index})">Edit</button>
        <button class="btn action-btn" onclick="deleteProduct(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  localStorage.setItem("adminProducts", JSON.stringify(products));
}

function deleteProduct(index) {
  if (confirm("Are you sure you want to delete this product?")) {
    products.splice(index, 1);
    renderProducts();
  }
}
window.deleteProduct = deleteProduct;

/*-------------------------
  ADMIN PRODUCT FORM (ADD/EDIT) HANDLING
-------------------------*/
function resetProductForm() {
  document.getElementById("adminProductForm").reset();
  document.getElementById("adminImagePreview").src = "";
  document.getElementById("adminProductIndex").value = "-1";
  document.getElementById("adminFormTitle").innerText = "Add Product";
  document.getElementById("adminSubmitButton").innerText = "Add";
  selectedFlavors = [];
  updateFlavorsButtonText();
  renderFlavorOptions();
}

document.getElementById("adminProductForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Get trimmed input values.
  const name = document.getElementById("adminProductName").value.trim();
  const description = document.getElementById("adminProductDescription").value.trim();
  const priceInput = document.getElementById("adminProductPrice").value.trim();
  const quantityInput = document.getElementById("adminProductQuantity").value.trim();
  
  // Convert numeric input values.
  const price = parseFloat(priceInput);
  const quantity = parseInt(quantityInput);

  // Check if all fields are filled and valid.
  if (!name || !description || priceInput === "" || quantityInput === "" ||
      isNaN(price) || isNaN(quantity) || selectedFlavors.length === 0) {
    alert("Please fill in all fields and select at least one flavor before adding a product.");
    return;
  }

  // Get the file input.
  const fileInput = document.getElementById("adminProductImage");
  const file = fileInput.files[0];
  const productIndex = document.getElementById("adminProductIndex").value;
  const isEditing = productIndex !== "-1" && productIndex !== "";

  // If adding a new product, require an image.
  if (!isEditing && !file) {
    alert("Please upload an image before adding the product.");
    return;
  }

  // Function to add or update the product.
  function updateOrAddProduct(imageSrc) {
    if (isEditing) {
      products[productIndex] = {
        ...products[productIndex],
        image: imageSrc,
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        flavors: [...selectedFlavors]
      };
    } else {
      products.push({
        id: products.length + 1, // Simple ID assignment; adjust as needed.
        image: imageSrc,
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        flavors: [...selectedFlavors]
      });
    }
    renderProducts();
    resetProductForm();
  }

  if (file) {
    // Read the file to create a data URL.
    const reader = new FileReader();
    reader.onload = function(ev) {
      updateOrAddProduct(ev.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    // If editing without selecting a new image, use existing one.
    updateOrAddProduct(products[productIndex].image);
  }
});

function editProduct(index) {
  const product = products[index];
  document.getElementById("adminProductName").value = product.name;
  document.getElementById("adminProductDescription").value = product.description;
  document.getElementById("adminProductPrice").value = product.price;
  document.getElementById("adminProductQuantity").value = product.quantity;
  document.getElementById("adminImagePreview").src = product.image;
  document.getElementById("adminProductIndex").value = index;
  document.getElementById("adminFormTitle").innerText = "Edit Product";
  document.getElementById("adminSubmitButton").innerText = "Update";
  product.flavors.forEach(flavor => {
    if (!flavorOptions.includes(flavor)) { flavorOptions.push(flavor); }
    if (!selectedFlavors.includes(flavor)) { selectedFlavors.push(flavor); }
  });
  renderFlavorOptions();
  document.querySelectorAll(".flavor-checkbox").forEach(chk => {
    chk.checked = selectedFlavors.includes(chk.value);
  });
  updateFlavorsButtonText();
}
