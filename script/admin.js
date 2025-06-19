/*--------------------------------------------------------------------------------
  API COMMUNICATION SETUP
--------------------------------------------------------------------------------*/
const API_BASE_URL = 'http://localhost:8080/api/admin';
const API_IMAGE_URL = 'http://localhost:8080';
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/products`;
const IMG_PLACEHOLDER = "../images/cuphead.jpeg";
const token = localStorage.getItem("usertoken");


// Helper function for API requests
async function makeApiRequest(url, method = 'GET', body = null, headers = {}) {
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

/*-----------------
  FLAVORS HANDLING (Database Integration)
------------------*/
// Global arrays for flavor options and selected flavors
let flavorOptions = []; // Will be fetched from the database (each flavor is an object with { id, name })
let selectedFlavors = []; // Always start with no selected flavors!

// Function to fetch flavor options from the database
async function loadFlavorOptionsFromAPI() {
  try {
    const response = await fetch('http://localhost:8080/api/admin/flavor', {
      method: "GET",
      headers: {
         'Content-Type': 'application/json',
         'Authorization': token ? `Bearer ${token}` : ''
      }
  });
    // Expect an array of flavor objects, e.g., [{ id: 1, name: "Vanilla" }, { id: 2, name: "Chocolate" }, ...]
    flavorOptions = await response.json();
  } catch (error) {
    console.error("Error fetching flavors from DB:", error);
    // Optional: Provide default flavors if the API call fails
    flavorOptions = [
      { id: 1, name: "Vanilla" },
      { id: 2, name: "Chocolate" },
      { id: 3, name: "Caramel" },
      { id: 4, name: "Hazelnut" }
    ];
  }
}

document.getElementById("adminProductImage").addEventListener("change", function(e) {
  
  const imageFile = e.target.files[0];
  
  // Reference: https://www.shecodes.io/athena/368129-how-to-upload-and-preview-an-image-in-html-using-javascript
  // Create a FileReader object
  const reader = new FileReader();

  // Set up the reader's onload event handler
  reader.onload = function(e) {
    // Get the image data URL
    const imageDataUrl = e.target.result;

    // Display the uploaded image
    const imagePreview = document.getElementById("adminImagePreview");
    imagePreview.src = imageDataUrl;
  };

  // Read the selected file as Data URL
  reader.readAsDataURL(imageFile);
});

// Function to add a new flavor into the database
async function addFlavorToDatabase(newFlavorName) {
  try {

    // Prepare the payload as an array since your controller expects a List<Flavor>
    const response = await fetch('http://localhost:8080/api/admin/flavor/save', {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ name: newFlavorName }])
    });
    if (!response.ok) {
      throw new Error(`Failed to add flavor: ${response.status}`);
    }
   
    const savedFlavors = await response.json();

    const newFlavor = savedFlavors[0];
    flavorOptions.push(newFlavor);

    selectedFlavors.push(newFlavor.name);
    return newFlavor;
  } catch (error) {
    console.error("Error adding new flavor:", error);
    return null;
  }
}

// Function to remove a flavor from the database
async function removeFlavorFromDatabase(flavor) {
  try {
    console.log("Removing flavor:", flavor);
    console.log("Flavor ID:", flavor.id);
    const response = await fetch(`http://localhost:8080/api/admin/flavor/${flavor.id}`, {
      method: 'DELETE',
      headers: {
    'Authorization': token ? `Bearer ${token}` : ''
  }
    });
    if (!response.ok) {
      throw new Error(`Failed to delete flavor: ${response.status}`);
    }
    // On successful deletion, remove the flavor from our local variables!!!!
    flavorOptions = flavorOptions.filter(f => f.id !== flavor.id);
    selectedFlavors = selectedFlavors.filter(name => name !== flavor.name);
  } catch (error) {
    console.error("Error deleting flavor:", error);
  }
}

// Dynamically generate and display a list of flavor options from the database
function renderFlavorOptions() {
  const container = document.getElementById("adminDropdownFlavorOptions");
  if (!container) {
    console.error("Flavor dropdown container not found.");
    return;
  }

  // Clear previous options before injecting new ones to avoid duplicates
  container.innerHTML = "";

  // Loop through the flavorOptions array and create elements for each flavor
  flavorOptions.forEach((flavor) => {
    const flavorName = flavor.name;
    const flavorId = flavor.id;

    const li = document.createElement("li");
    li.classList.add("mb-1");
    li.dataset.flavorId = flavorId;

    // Create a flex container to align checkbox/label and remove button in one row
    const div = document.createElement("div");
    div.classList.add("d-flex", "align-items-center", "justify-content-between");

    // Create a container for the checkbox and its label
    const checkboxContainer = document.createElement("div");
    checkboxContainer.classList.add("form-check");

    // Create the checkbox input element
    const checkbox = document.createElement("input");
    checkbox.classList.add("form-check-input", "flavor-checkbox");
    checkbox.type = "checkbox";

    // Set the underlying value to the flavorId
    checkbox.value = flavorId;
    checkbox.id = `adminChk-${flavorId}`;

    // Create a label element for the checkbox
    const label = document.createElement("label");
    label.classList.add("form-check-label");

    // Shows the flavor name to the user, not the id.
    label.setAttribute("for", `adminChk-${flavorId}`);
    label.innerText = flavorName;

    // Append the checkbox and label into the checkbox container
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    // Create a remove button to allow deletion of the flavor option
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.classList.add("btn", "btn-sm", "remove-flavor");
    removeBtn.innerHTML = "&times;";
    removeBtn.style.cssText = "margin-left:5px; background: none; border: none; color: #6c757d;";
    removeBtn.onclick = async (event) => {
      event.stopPropagation(); // Prevent the dropdown from closing
      await removeFlavorFromDatabase(flavor);
      renderFlavorOptions();
      updateFlavorsButtonText();
    };

    // Append the checkbox container and remove button to the flex container
    div.appendChild(checkboxContainer);
    div.appendChild(removeBtn);

    // Append the flex container to the list item
    li.appendChild(div);

    // Append the list item to the main container
    container.appendChild(li);
  });

  // Ensure checkboxes reflect selected flavors and bind change events to update selections
  document.querySelectorAll(".flavor-checkbox").forEach((chk) => {
    chk.checked = selectedFlavors.includes(parseInt(chk.value)); 
    chk.addEventListener("change", updateSelectedFlavors);
  });
}

// Updates the selected flavors based on checkbox selections.
function updateSelectedFlavors() {
  selectedFlavors = []; // Reset the selected flavors
  document.querySelectorAll(".flavor-checkbox").forEach((chk) => {
    if (chk.checked) {
      selectedFlavors.push(chk.value);
    }
  });
  updateFlavorsButtonText();
}

// Updates the text of the flavors dropdown button.
function updateFlavorsButtonText() {
  const btn = document.getElementById("adminFlavorsButton");
  if (btn) {
    // Map selected flavor IDs to their names
    const flavorNames = selectedFlavors.map(id => {
      const flavor = flavorOptions.find(f => f.id === id);
      return flavor ? flavor.name : id;
    });
    btn.innerText = flavorNames.length > 0 
      ? flavorNames.join(', ')
      : "Select flavors";
  }
}

// Add a new flavor when the user presses "Enter" 
document
  .getElementById("adminNewFlavorInput")
  .addEventListener("keydown", async function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const newFlavorName = e.target.value.trim();
      if (newFlavorName !== "" && !flavorOptions.some(f => f.name === newFlavorName)) {
        await addFlavorToDatabase(newFlavorName);
      }
      renderFlavorOptions();
      updateFlavorsButtonText();
      e.target.value = "";
    }
  });

// When the page loads, fetch the flavor options from the database and display them.
window.addEventListener("load", async function () {

  // Clear any previous image preview if needed 
  document.getElementById("adminImagePreview").src = IMG_PLACEHOLDER;

  // Reset selected flavors array
  selectedFlavors = [];

  // Load flavor options from the database
  await loadFlavorOptionsFromAPI();
  
  // Render the flavor checkboxes in the dropdown with the fresh data from the database
  renderFlavorOptions();
  updateFlavorsButtonText();

});


/*------------------
  SALES ORDERS CHART
--------------------*/
// Function to fetch orders data from the backend and build arrays for Chart.js.
async function loadSalesChartData() {
  try {
    const response = await fetch('http://localhost:8080/api/admin/orders/monthly-orders', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Data returned from backend should be in the format
    // { "January": 25, "February": 50, ... }
    const data = await response.json();

      // Array of month names in the proper sequence.
      const monthsInOrder = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
  
      // Map the order counts based on the fixed month order.
      // If the data for a month is missing, default the value to 0.
      const labels = monthsInOrder;
      const orders = monthsInOrder.map(month => data[month] || 0);

    // Create the Chart.js chart using these arrays
    const adminCtx = document.getElementById("adminSalesChart").getContext("2d");
    const salesChart = new Chart(adminCtx, {
      type: "line", // Using a line chart
      data: {
        labels: labels,         // X-axis labels (months)
        datasets: [
          {
            label: "Orders",    // The dataset's label for the legend
            data: orders,       // Y-axis data points (order count for each month)
            borderColor: "#808080", // Grey line
            backgroundColor: "rgba(128,128,128,0.1)", // Light grey fill under the line
            fill: true,           // Enable fill under the line
            tension: 0.4,         // Slight curvature for a smoother line
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
          y: { beginAtZero: true }
        }
      }
    });

  } catch (error) {
    console.error("Error loading sales chart data:", error);
  }
}
// Call the function to load data and render chart
loadSalesChartData();


/*----------------
 LOGOUT FUNCTION
-----------------*/
document.addEventListener("DOMContentLoaded", () => {

  // Select the logout button inside the admin welcome section.
  const logoutButton = document.querySelector("#adminWelcome .logout-container button");

  // Check if the button exists
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {

      // Remove the token from localStorage.
      localStorage.removeItem("usertoken");

      // Redirect to index.html.
      window.location.href = "index.html";
    });
  }
});


window.addEventListener("load", async function () {

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


/*-------------------------
  PRODUCT LISTING HANDLING
-------------------------*/
async function fetchProducts() {
  return await makeApiRequest(PRODUCTS_ENDPOINT);
}

// renderProducts to work with API data
function renderProducts() {
  const tbody = document.getElementById("adminProductTableBody");
  tbody.replaceChildren();

  products.forEach((product) => {
    const tr = document.createElement("tr");

    const imageTd = document.createElement("td");
    const img = document.createElement("img");
    img.classList.add("border", "border-1", "border-secondary-subtle", "rounded-2");
    img.src = product.imageURL ? API_IMAGE_URL.concat(product.imageURL) : IMG_PLACEHOLDER;
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
    qtyTd.textContent = product.inventoryCount ?? "N/A";
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
    editBtn.onclick = () => editProduct(product.id ?? product.id);
    actionTd.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "action-btn", "btn-sm", "btn-outline-danger");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteProduct(product.id ?? product.id);
    actionTd.appendChild(deleteBtn);

    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });
}

async function loadProductsFromAPI() {
  try {
    const token = localStorage.getItem("usertoken");
    const response = await fetch(PRODUCTS_ENDPOINT, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/*-------------------
  PRODUCT MANAGEMENT 
--------------------*/
async function deleteProductFromDatabase(productId) {
  try {
    const token = localStorage.getItem("usertoken");
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }
    // Return true if deletion was successful
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return null;
  }
}

async function deleteProduct(productId) {
  const result = await Swal.fire({
    title: "Are you sure you want to delete this product?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6"
  });

  if (!result.isConfirmed) {
    return null;
  }

  try {
    const deletionSuccess = await deleteProductFromDatabase(productId);
    if (!deletionSuccess) {
      throw new Error("Product deletion failed");
    }
    
    // Re-fetch updated products list from the database
    products = await loadProductsFromAPI();
    
    // Re-render the product table
    renderProducts();
    
    await Swal.fire("Deleted!", "The product has been removed.", "success");
    return true;
  } catch (error) {
    console.error("Error during product deletion:", error);
    await Swal.fire("Error!", "Failed to delete product.", "error");
    return null;
  }
}

/*-------------------------------------
    PRODUCT FORM (ADD/EDIT) HANDLING
--------------------------------------*/
// List of products stored locally needs to be fetched initially from your API.
let products = [];

// TODO - WHETHER WE NEED TO REMOVE
// document.getElementById("adminProductForm").addEventListener("submit", async function (e) {
//   e.preventDefault();

//   try {
//     const productData = collectProductFormData();
//     const productId = document.getElementById("adminProductIndex").value;

//     // Validate required fields
//     if (!productData.name || !productData.price) {
//       throw new Error("Product name and price are required");
//     }
//     let formData = new FormData();
//     formData.append("product", JSON.stringify(productData));
//     console.log("form data is:" , formData);
    
//     const fileInput = document.getElementById("adminProductImage");
    
//     if (fileInput.files[0]) {
//       formData.append("image", fileInput.files[0]);
//     }
    
//     let result;
//     if (productId && productId !== "") {
//       alert("I am edited");
//       result = await updateProduct(productId, productData);
//     } else {
//       alert("I'm being created");
//       result = await createProduct(formData);
//     }

    // Handle image upload if needed
    // const fileInput = document.getElementById("adminProductImage");
    
    // if (fileInput.files[0]) {
    //   await uploadProductImage(result.id, fileInput.files[0]);
    //   // Update product with image URL if needed
    //   await updateProduct(result.id, { imageUrl: `/uploads/products/${fileInput.files[0].name}` });
    // }

//     Swal.fire("Success!", `Product ${productId ? "updated" : "created"} successfully!`, "success");
//     resetProductForm();
//     loadProducts(); // Refresh product list if you have one
    
//   } catch (error) {
//     console.error("Form submission error:", error);
//     Swal.fire({
//       title: "Error!",
//       text: error.message || "Failed to process product",
//       icon: "error"
//     });
//   }
// });

// Function to collect product data
// function collectProductFormData() {
//   return {
//     sku: document.getElementById("adminProductSKU").value.trim(),
//     name: document.getElementById("adminProductName").value.trim(),
//     description: document.getElementById("adminProductDescription").value.trim(),
//     price: parseFloat(document.getElementById("adminProductPrice").value.trim()),
//     inventory: parseInt(document.getElementById("adminProductQuantity").value.trim()), // Changed from inventoryCount
//     imageUrl: "", // Initialize empty, will be updated after image upload
//     flavors: selectedFlavors.map(flavor => ({ id: flavor.id })) // Send just flavor IDs
//   };
// }

// Function to reset the product form
function resetProductForm() {
  document.getElementById("adminProductForm").reset();
  document.getElementById("adminProductIndex").value = ""; // Clear ID completely
  selectedFlavors = [];
  updateFlavorsButtonText();
  
  // Reset image preview
  document.getElementById("adminImagePreview").src = IMG_PLACEHOLDER;
  document.getElementById("adminProductImage").value = "";
  console.log("image src after reset: ", document.getElementById("adminImagePreview").src);
  // Set form to "create" mode
  document.getElementById("adminFormTitle").innerText = "Add New Product";
  document.getElementById("adminSubmitButton").innerText = "Create Product";
}

/*---------------------------
  CREATE PRODUCT API
---------------------------*/
async function createProduct(formData) {
  
  try {
    const token = localStorage.getItem("usertoken");
    
    if (!token) {
      throw new Error("Authentication token missing - please login again");
    }

    const response = await fetch(PRODUCTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    // First check for 403 specifically
    if (response.status === 403) {
      throw new Error("Access denied - you don't have permission");
    }

    // Then check for other errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    // Only try to parse JSON if response has content
    const responseBody = await response.text();
    return responseBody ? JSON.parse(responseBody) : {};

  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
}

/*-------------------------------------
      IMAGE & PRODUCT HELPER FUNCTIONS
--------------------------------------*/
async function uploadProductImage(productId, imageFile) {
  try {
    const token = localStorage.getItem("usertoken");
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}/image`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }
    return await response.json();
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
}

/*---------------------------
  UPDATE PRODUCT API
---------------------------*/

async function updateProduct(productId, formData) {
  try {
    // First validate the productId exists and isn't empty
    if (!productId || productId.trim() === "") {
      throw new Error("Product ID is required for update");
    }

    const token = localStorage.getItem("usertoken");
    
    console.log("Updating product with ID:", productId, "Data:", formData.get("product"));
    console.log("Updating product with ID:", productId, "Data:", formData.get("image"));

    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body:formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update product: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Product updated:", data);

    // Re-fetch updated products list from the database
    products = await loadProductsFromAPI(); 

    // Re-render the product table
    renderProducts();

    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error; // Re-throw to allow calling code to handle it
  }
}

async function fetchProduct(productId) {
  try {
    return await makeApiRequest(`${PRODUCTS_ENDPOINT}/${productId}`);
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function updateProductFlavors(productId, flavorsArray) {
  try {
    console.log("Updating product flavors for product id:", productId, "with flavors:", flavorsArray);
    
    // Retrieve the token from localStorage
    const token = localStorage.getItem("usertoken");
    
    // Make the PUT request to the new endpoint for updating flavors.
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}/flavors`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      // Expecting flavorsArray to be an array of flavor IDs, e.g. [1, 2, 3]
      body: JSON.stringify(flavorsArray)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update product flavors: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Product flavors updated:", data);
    return data;
  } catch (error) {
    console.error("Error updating product flavors:", error);
    throw error;
  }
}

async function editProduct(productId) {
  try {
    // Fetch the basic product details.
    const product = await fetchProduct(productId);
    
    document.getElementById("adminProductSKU").value = product.sku || "";
    document.getElementById("adminProductName").value = product.name || "";
    document.getElementById("adminProductDescription").value = product.description || "";
    document.getElementById("adminProductPrice").value = product.price || "";
    document.getElementById("adminProductQuantity").value = product.inventory ?? product.inventoryCount ?? "";
    document.getElementById("adminImagePreview").src = product.imageURL ? API_IMAGE_URL.concat(product.imageURL) : IMG_PLACEHOLDER;
    document.getElementById("adminProductIndex").value = product.id || product._id || "";
    
    // Update form labels for edit mode.
    document.getElementById("adminFormTitle").innerText = "Edit Product";
    document.getElementById("adminSubmitButton").innerText = "Update";
    
    // Fetch the product's associated flavors
    const fetchedFlavors = await fetchProductFlavors(product.id);
    
    selectedFlavors = [];
    selectedFlavors = fetchedFlavors.map(flavor => flavor.id);
    
    // TODO - please confirm what this condition does
    if (product.flavors && Array.isArray(product.flavors)) {
      product.flavors.forEach(flavor => {
          if (!selectedFlavors.includes(flavor.id)) {
            selectedFlavors.push(flavor.id);
          }
      });
    }

    // Render the flavor dropdown/options.
    renderFlavorOptions();

    // After rendering, looping through the checkboxes and mark the ones that are selected.
    document.querySelectorAll(".form-check-input.flavor-checkbox").forEach(chk => {
      chk.checked = selectedFlavors.includes(parseInt(chk.value));
      console.log("Checkbox value:", chk.value, "Checked:", chk.checked);
    });
   
    // Scroll the form into view.
    document.getElementById("adminProductForm").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  } catch (error) {
    Swal.fire("Error!", "Failed to load product for editing.", "error");
    console.error("Error editing product:", error);
  }
}
//  console.log("Product Data being sent:", productData);
function collectProductFormData() { //TODO
  // Get the basic product fields from the form.
  const sku = document.getElementById("adminProductSKU").value;
  const name = document.getElementById("adminProductName").value;
  const description = document.getElementById("adminProductDescription").value;
  
  // Parse price and inventory as numbers.
  const price = parseFloat(document.getElementById("adminProductPrice").value);
  const inventory = parseInt(document.getElementById("adminProductQuantity").value, 10);
  
  // Get the image URL from the preview. (NOT NEEDED)
  // const imageurl = document.getElementById("adminImagePreview").src;
  
  // Collect the flavor IDs from the checked checkboxes.
  const flavorCheckboxes = document.querySelectorAll(".flavor-checkbox");
  const flavors = Array.from(flavorCheckboxes)
    .filter(chk => chk.checked)
    .map(chk => parseInt(chk.value, 10)); // Convert flavor IDs to numbers.

  console.log("Selected flavors:", flavors);
  // Return the collected data in the desired JSON format.
  return {
    sku: sku,
    name: name,
    description: description,
    price: price,
    inventoryCount: inventory,
    // imageURL: imageurl, (NOT NEEDED)
    flavors: flavors
  };
}

// * DONE ADDING PRODUCT
// When the form is submitted, collect and log the JSON payload.
document.getElementById("adminSubmitButton").addEventListener("click", async (e) => {
  e.preventDefault();
  
  try {
    const productData = collectProductFormData();
    const productId = document.getElementById("adminProductIndex").value;

    // Validate required fields
    if (!productData.name || !productData.price) {
      throw new Error("Product name and price are required");
    }

    // Determine if we're creating or updating
    const isNewProduct = !productId || productId.trim() === "" || productId === "-1";

    // create a FormData object to store "product" (productData) and "image" (image)
    let formData = new FormData();
    formData.append("product", JSON.stringify(productData));

    // Handle image upload if needed
    const fileInput = document.getElementById("adminProductImage");
    formData.append("image", fileInput.files[0]);

    // Check whether there's an adminProductIndex
    const productIndexExists = document.getElementById("adminProductIndex").value;
    let returnedProduct = null;

    if(!productIndexExists)
      // CREATE new product
      returnedProduct = await createProduct(formData);
    else
      // UPDATE existing product
      returnedProduct = await updateProduct(productId, formData);
      
    if (returnedProduct && !productIndexExists) {  
      Swal.fire("Success!", "Product created successfully!", "success");
    } 
    
    if(returnedProduct && productIndexExists){
      Swal.fire("Success!", "Product updated successfully!", "success");
    }
    
    // Reset form and refresh list
    resetProductForm();
    products = await loadProductsFromAPI();
    renderProducts();

  } catch (error) {
    console.error("Product operation failed:", error);
    Swal.fire("Error!", error.message || "Operation failed", "error");
  }
});

/* To fetch product flavors. */
async function fetchProductFlavors(productId) {

  // Retrieve the token from localStorage (or elsewhere as appropriate).
  let token = localStorage.getItem("usertoken");
  
  if (!token || token.trim() === "") {
    throw new Error("JWT token is missing");
  }
  
  // If token starts with "Bearer ", remove that part to ensure consistency.
  token = token.replace("Bearer ", "");

  console.log("Fetching flavors for product id:", productId);
  try {
    const response = await fetch(`http://localhost:8080/api/admin/flavor/product/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch product flavors: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched product flavors:", data);
    return data;
  } catch (error) {
    console.error("Error fetching product flavors:", error);
    return [];
  }
}

