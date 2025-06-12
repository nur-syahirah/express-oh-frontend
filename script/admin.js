/*--------------------------------------------------------------------------------
  API COMMUNICATION SETUP
--------------------------------------------------------------------------------*/
const API_BASE_URL = 'http://localhost:8080/api/admin'; // Replace with your actual API URL
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/products`;

// Helper function for API requests
async function makeApiRequest(url, method = 'GET', body = null, headers = {}) {
  const token = localStorage.getItem("usertoken");
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };

  const config = {
    method,
    headers: { ...defaultHeaders, ...headers },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/*------------------
  SALES ORDERS CHART
--------------------*/
// (Keep your existing chart code, but you might want to fetch real data from API)
// ...

/*----------------
  UPON PAGE LOAD
-----------------*/
window.addEventListener("load", async function () {
  // Initialize selected flavors and flavor options
  selectedFlavors = [];
  flavorOptions = [];

  // Try to load flavor options from localStorage
  const storedFlavors = localStorage.getItem("adminFlavorOptions");
  if (storedFlavors) {
    flavorOptions = JSON.parse(storedFlavors);
  }

  // Render flavor checkboxes in dropdown
  renderFlavorOptions();
  updateFlavorsButtonText();

  // Load products from backend API
  try {
    products = await fetchProducts();
    renderProducts();
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to load products from server",
      icon: "error"
    });
    products = [];
  }
});

/**
 * Dynamically renders flavor options into the dropdown list.
 */
function renderFlavorOptions() {
  const flavorOptionsContainer = document.getElementById("adminDropdownFlavorOptions");
  if (!flavorOptionsContainer) return;

  flavorOptionsContainer.innerHTML = ""; // Clear previous entries

  if (Array.isArray(flavorOptions) && flavorOptions.length > 0) {
    flavorOptions.forEach(flavor => {
      const flavorName = typeof flavor === 'string' ? flavor : flavor.name;
      const flavorId = typeof flavor === 'string' ? flavor : flavor.id;

      const li = document.createElement("li");
      li.classList.add("form-check");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("form-check-input");
      checkbox.id = `flavorCheckbox-${flavorId}`;
      checkbox.value = flavorName;
      checkbox.checked = selectedFlavors.includes(flavorName);

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          if (!selectedFlavors.includes(flavorName)) {
            selectedFlavors.push(flavorName);
          }
        } else {
          selectedFlavors = selectedFlavors.filter(f => f !== flavorName);
        }
        updateFlavorsButtonText();
      });

      const label = document.createElement("label");
      label.classList.add("form-check-label");
      label.htmlFor = checkbox.id;
      label.textContent = flavorName;

      li.appendChild(checkbox);
      li.appendChild(label);
      flavorOptionsContainer.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No flavors available";
    flavorOptionsContainer.appendChild(li);
  }
}

/**
 * Updates the dropdown button text to show selected flavors count.
 */
function updateFlavorsButtonText() {
  const button = document.getElementById("adminFlavorsDropdownButton");
  if (!button) return;

  if (selectedFlavors.length === 0) {
    button.textContent = "Select Flavors";
  } else {
    button.textContent = `${selectedFlavors.length} Flavor(s) Selected`;
  }
}


/*-------------------------
  PRODUCT API FUNCTIONS
-------------------------*/
async function fetchProducts() {
  return await makeApiRequest(PRODUCTS_ENDPOINT);
}

async function createProduct(productData) {
  return await makeApiRequest(PRODUCTS_ENDPOINT, 'POST', productData);
}

async function updateProduct(productId, productData) {
  return await makeApiRequest(`${PRODUCTS_ENDPOINT}/${productId}`, 'PUT', productData);
}

async function deleteProductFromServer(productId) {
  return await makeApiRequest(`${PRODUCTS_ENDPOINT}/${productId}`, 'DELETE');
}

/*-------------------------
  PRODUCT LISTING HANDLING
-------------------------*/
// Modified renderProducts to work with API data
function renderProducts() {
  const tbody = document.getElementById("adminProductTableBody");
  tbody.replaceChildren();

  products.forEach((product) => {
    const tr = document.createElement("tr");

    // Image
    const imageTd = document.createElement("td");
    const img = document.createElement("img");
    img.src = product.image || "https://via.placeholder.com/80";
    img.alt = "Product Image";
    img.style.height = "60px";
    imageTd.appendChild(img);
    tr.appendChild(imageTd);

    // Name
    const nameTd = document.createElement("td");
    nameTd.textContent = product.name;
    tr.appendChild(nameTd);

    // Description
    const descTd = document.createElement("td");
    descTd.textContent = product.description;
    tr.appendChild(descTd);

    // Price
    const priceTd = document.createElement("td");
    priceTd.textContent = `$${product.price.toFixed(2)}`;
    tr.appendChild(priceTd);

    // Quantity
    const qtyTd = document.createElement("td");
    qtyTd.textContent = product.inventoryCount ?? product.quantity ?? "N/A";
    tr.appendChild(qtyTd);

    // Flavors
    const flavorTd = document.createElement("td");
    if (Array.isArray(product.flavors) && product.flavors.length > 0) {
      // Handle if flavors are objects or strings
      const flavorNames = product.flavors.map(f => typeof f === 'string' ? f : f.name);
      flavorTd.textContent = flavorNames.join(", ");
    } else {
      flavorTd.textContent = "None";
    }
    tr.appendChild(flavorTd);

    // Actions
    const actionTd = document.createElement("td");
    
    const editBtn = document.createElement("button");
    editBtn.classList.add("btn", "action-btn", "btn-sm", "btn-outline-primary", "me-1");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editProduct(product.id ?? product._id);
    actionTd.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "action-btn", "btn-sm", "btn-outline-danger");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteProduct(product.id ?? product._id);
    actionTd.appendChild(deleteBtn);

    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });
}


/*-------------------
  PRODUCT MANAGEMENT 
--------------------*/
// Modified delete function to work with API
async function deleteProduct(productId) {
  Swal.fire({
    title: "Are you sure you want to delete this product?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteProductFromServer(productId);
        products = products.filter(p => p._id !== productId);
        renderProducts();
        Swal.fire("Deleted!", "The product has been removed.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete product.", "error");
      }
    }
  });
}

/*-------------------------------------
    PRODUCT FORM (ADD/EDIT) HANDLING
--------------------------------------*/
document.getElementById("adminProductForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // (Keep your existing validation code)
  
  const name = document.getElementById("adminProductName").value.trim();
  const description = document.getElementById("adminProductDescription").value.trim();
  const price = parseFloat(document.getElementById("adminProductPrice").value.trim());
  const quantity = parseInt(document.getElementById("adminProductQuantity").value.trim());
  const productId = document.getElementById("adminProductIndex").value;

  const productData = {
    name,
    description,
    price,
    quantity,
    flavors: selectedFlavors,
    // image will be handled separately for file upload
  };

  try {
    let result;
    if (productId && productId !== "-1") {
      // Editing existing product
      result = await updateProduct(productId, productData);
      const index = products.findIndex(p => p._id === productId);
      if (index !== -1) {
        products[index] = result;
      }
    } else {
      // Adding new product
      result = await createProduct(productData);
      products.push(result);
    }

    // Handle image upload if a file was selected
    const fileInput = document.getElementById("adminProductImage");
    if (fileInput.files[0]) {
      await uploadProductImage(result._id, fileInput.files[0]);
      // Refresh the product to get updated image URL
      const updatedProduct = await fetchProduct(result._id);
      const index = products.findIndex(p => p._id === result._id);
      if (index !== -1) {
        products[index] = updatedProduct;
      }
    }

    renderProducts();
    resetProductForm();
    Swal.fire("Success!", `Product ${productId ? 'updated' : 'added'} successfully.`, "success");
  } catch (error) {
    Swal.fire("Error!", `Failed to ${productId ? 'update' : 'add'} product.`, "error");
  }
});

async function uploadProductImage(productId, imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const token = localStorage.getItem("usertoken");
  const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}/image`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }
  return await response.json();
}

async function fetchProduct(productId) {
  return await makeApiRequest(`${PRODUCTS_ENDPOINT}/${productId}`);
}

// Modified edit function to fetch product from API
async function editProduct(productId) {
  try {
    const product = await fetchProduct(productId);
    
    // Fill form with product details
    document.getElementById("adminProductName").value = product.name;
    document.getElementById("adminProductDescription").value = product.description;
    document.getElementById("adminProductPrice").value = product.price;
    document.getElementById("adminProductQuantity").value = product.quantity;
    document.getElementById("adminImagePreview").src = product.image;
    document.getElementById("adminProductIndex").value = product._id;

    // Update form labels
    document.getElementById("adminFormTitle").innerText = "Edit Product";
    document.getElementById("adminSubmitButton").innerText = "Update";

    // Handle flavors
    product.flavors.forEach((flavor) => {
      if (!flavorOptions.includes(flavor)) {
        flavorOptions.push(flavor);
      }
      if (!selectedFlavors.includes(flavor)) {
        selectedFlavors.push(flavor);
      }
    });

    renderFlavorOptions();
    document.querySelectorAll(".flavor-checkbox").forEach((chk) => {
      chk.checked = selectedFlavors.includes(chk.value);
    });
    updateFlavorsButtonText();
    document.getElementById("adminProductForm").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    Swal.fire("Error!", "Failed to load product for editing.", "error");
  }
}