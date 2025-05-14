/*--------------------------------------------------------------------------------
  LOCAL STORAGE HANDLING (Admin)
  - For flavors and products; product form image preview remains empty on reload.
--------------------------------------------------------------------------------*/
/*------------------
  SALES ORDERS CHART
--------------------*/
// Define the sales data for the chart
const salesData = {
  labels: ["January", "February", "March", "April", "May", "June"], // X-axis labels (months)
  orders: [25, 50, 75, 300, 189], // Corresponding order counts for each month
};

// Get the canvas context for rendering the chart
const adminCtx = document.getElementById("adminSalesChart").getContext("2d");

// Create a new Chart.js line chart with the sales data
const salesChart = new Chart(adminCtx, {
  type: "line", // Specifies the chart type as a line chart
  data: {
    labels: salesData.labels, // Assign X-axis labels
    datasets: [
      {
        label: "Orders", // Name of the dataset that will be displayed in the legend
        data: salesData.orders, // Y-axis data points (order count)
        borderColor: "#808080", // Line color (grey theme)
        backgroundColor: "rgba(128,128,128,0.1)", // Color fill for area under the line
        fill: true, // Enables area fill beneath the line
        tension: 0.4, // Adds slight curvature to the line for smoother appearance
      },
    ],
  },
  options: {
    responsive: true, // Ensures the chart scales to fit different screen sizes
    maintainAspectRatio: false, // Allows chart resizing without maintaining strict aspect ratio
    scales: { y: { beginAtZero: true } }, // Ensures Y-axis starts from zero instead of an arbitrary value
  },
});

/*----------------
  UPON PAGE LOAD
-----------------*/
// Initialize the products array.
window.addEventListener("load", function () {
  // Removes any saved image from localStorage to prevent unintended preloaded images
  document.getElementById("adminImagePreview").src = "";
  localStorage.removeItem("adminSavedImage");

  // Retrieve stored flavors from localStorage (if available)
  const storedFlavors = localStorage.getItem("adminFlavorOptions");
  selectedFlavors = []; // Always start with an empty array for selected flavors to ensure a fresh selection
  if (storedFlavors) {
    // If flavors exist in localStorage, parse them into an array for use
    flavorOptions = JSON.parse(storedFlavors);
  }
  renderFlavorOptions();
  updateFlavorsButtonText();

  // Check if products exist in local storage.
  const storedProducts = localStorage.getItem("adminProducts");
  if (storedProducts) {
    // If stored products exist, load them into the products array
    products = JSON.parse(storedProducts);
  } else {
    // If no stored products, initialize with productData from product.js
    products = productData;
    localStorage.setItem("adminProducts", JSON.stringify(products));
  }
  renderProducts();
});

// Dynamically generate and display a list of flavor options—each represented as a checkbox with a label and a remove button in the dropdown menu
function renderFlavorOptions() {
  const container = document.getElementById("adminDropdownFlavorOptions");
  if (!container) return;

  // Clear previous options before injecting new ones
  container.innerHTML = "";

  flavorOptions.forEach((flavor) => {
    const li = document.createElement("li"); // Ensure flavors are rendered as <li>
    li.classList.add("mb-1");
    li.dataset.flavor = flavor;

    const div = document.createElement("div");
    div.classList.add("d-flex", "align-items-center", "justify-content-between");

    const checkboxContainer = document.createElement("div");
    checkboxContainer.classList.add("form-check");

    const checkbox = document.createElement("input");
    checkbox.classList.add("form-check-input", "flavor-checkbox");
    checkbox.type = "checkbox";
    checkbox.value = flavor;
    checkbox.id = `adminChk-${flavor}`;

    const label = document.createElement("label");
    label.classList.add("form-check-label");
    label.setAttribute("for", `adminChk-${flavor}`);
    label.innerText = flavor;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.classList.add("btn", "btn-sm", "remove-flavor");
    removeBtn.innerHTML = "&times;";
    removeBtn.style.cssText = "margin-left:5px; background: none; border: none; color: #6c757d;";
    removeBtn.onclick = (event) => removeFlavorOption(flavor, event);

    div.appendChild(checkboxContainer);
    div.appendChild(removeBtn);
    li.appendChild(div);
    container.appendChild(li);
  });

  document.querySelectorAll(".flavor-checkbox").forEach((chk) => {
    chk.checked = selectedFlavors.includes(chk.value);
    chk.addEventListener("change", updateSelectedFlavors);
  });

  saveFlavorsToLocalStorage();
}

/*-----------------
  FLAVORS HANDLING
------------------*/
// Retrieve stored flavors from localStorage or use default options
let flavorOptions = JSON.parse(localStorage.getItem("adminFlavorOptions")) || [
  "Vanilla",
  "Chocolate",
  "Caramel",
  "Hazelnut",
];
let selectedFlavors = []; // Always start with no selected flavors

// Saves current flavor options and selected flavors into localStorage
function saveFlavorsToLocalStorage() {
  localStorage.setItem("adminFlavorOptions", JSON.stringify(flavorOptions));
  localStorage.setItem("adminSelectedFlavors", JSON.stringify(selectedFlavors));
}

// Updates the selected flavors based on checkbox selections.
function updateSelectedFlavors() {
  selectedFlavors = []; // Reset the selected flavors array
  document.querySelectorAll(".flavor-checkbox").forEach((chk) => {
    if (chk.checked) {
      selectedFlavors.push(chk.value); // Add checked flavor to the array
    }
  });
  updateFlavorsButtonText(); // Update dropdown button text
  saveFlavorsToLocalStorage(); // Store selected flavors in localStorage
}

//Updates the text of the flavors dropdown button.
function updateFlavorsButtonText() {
  const btn = document.getElementById("adminFlavorsDropdownButton");
  btn.innerText = selectedFlavors.length
    ? selectedFlavors.join(", ")
    : "Select Flavors"; // Show flavors or default text
}

// Adds a new flavor upon user presses "Enter" in the input field.
document
  .getElementById("adminNewFlavorInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      // Checks if the Enter key was pressed
      e.preventDefault(); // Add a new flavor dynamically rather than submit the entire form
      const newFlavor = e.target.value.trim(); // Remove extra spaces
      if (newFlavor !== "" && !flavorOptions.includes(newFlavor)) {
        flavorOptions.push(newFlavor); // Add new flavor to options
        selectedFlavors.push(newFlavor); // Automatically select newly added flavor
      }
      renderFlavorOptions(); // Refresh the flavor options dropdown
      updateFlavorsButtonText(); // Update dropdown button text
      e.target.value = ""; // Clear input field
      saveFlavorsToLocalStorage(); // Save updated flavors to localStorage
    }
  });

// Removes a flavor from the available options and selected flavors.
function removeFlavorOption(flavor, event) {
  event.stopPropagation(); // Prevents dropdown from closing when clicking the remove button

  // Remove the flavor from the array
  flavorOptions = flavorOptions.filter(f => f !== flavor);
  selectedFlavors = selectedFlavors.filter(f => f !== flavor);

  // Instantly remove the flavor element from the dropdown
  const itemToRemove = document.querySelector(`li[data-flavor="${flavor}"]`);
  if (itemToRemove) {
    itemToRemove.remove();
  }

  updateFlavorsButtonText();
  saveFlavorsToLocalStorage();
}

/*-------------------------
  PRODUCT LISTING HANDLING
  -------------------------*/
// Render the product listing table dynamically based on stored product data
function renderProducts() {
  const tbody = document.getElementById("adminProductTableBody");

  // Clear existing rows efficiently
  tbody.replaceChildren();

  // Loop through products and create new table rows dynamically
  products.forEach((product, index) => {
    const tr = document.createElement("tr");

    // Create table data for image
    const tdImage = document.createElement("td");
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.classList.add("img-fluid");
    img.width = 50;
    tdImage.appendChild(img);

    // Create table data for name
    const tdName = document.createElement("td");
    tdName.textContent = product.name;

    // Create table data for description
    const tdDescription = document.createElement("td");
    tdDescription.textContent = product.description;

    // Create table data for price
    const tdPrice = document.createElement("td");
    tdPrice.textContent = `$${product.price.toFixed(2)}`;

    // Create table data for quantity
    const tdQuantity = document.createElement("td");
    tdQuantity.textContent = product.quantity;

    // Create table data for flavors
    const tdFlavors = document.createElement("td");
    tdFlavors.textContent = Array.isArray(product.flavors)
      ? product.flavors.join(", ")
      : "No flavors";

    // Create table data for actions (Edit & Delete buttons)
    const tdActions = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.classList.add("btn", "action-btn");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editProduct(index); // Attach event

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "action-btn");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteProduct(index); // Attach event

    tdActions.appendChild(editBtn);
    tdActions.appendChild(deleteBtn);

    // Append all table data elements to the row
    tr.appendChild(tdImage);
    tr.appendChild(tdName);
    tr.appendChild(tdDescription);
    tr.appendChild(tdPrice);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdFlavors);
    tr.appendChild(tdActions);

    // Append the row to the table body
    tbody.appendChild(tr);
  });

  // Store the updated product list in localStorage for persistence
  localStorage.setItem("adminProducts", JSON.stringify(products));
}

/*-------------------
  PRODUCT MANAGEMENT 
--------------------*/
const initialProducts = [
  // Initialize product data as an array of objects
  {
    id: 1,
    name: "Product 1",
    description: "Description of product 1",
    price: 66.66,
    image: "./images/cuphead.png",
    quantity: 100,
    flavors: ["Vanilla", "Chocolate", "Caramel", "Hazelnut"],
  },
];
let products = []; // Initialize an empty products array (will be populated later)

// TODO -- Preparing for backend integration
// Fetching product data fetching with delay
/* function fetchProducts() {
   return new Promise((resolve) => {
     setTimeout(() => resolve(initialProducts), 500);  // Uses a Promise with a `setTimeout` to delay retrieval by 500ms
   });
 } */

// Dynamically populates the product list inside the table
function renderProducts() {
  const tbody = document.getElementById("adminProductTableBody");

  // Efficiently clear previous entries
  tbody.replaceChildren();

  // Loop through products and create new table rows dynamically
  products.forEach((product, index) => {
    const tr = document.createElement("tr");

    // Create table data for image
    const tdImage = document.createElement("td");
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.classList.add("img-fluid");
    img.width = 50;
    tdImage.appendChild(img);

    // Create table data for name
    const tdName = document.createElement("td");
    tdName.textContent = product.name;

    // Create table data for description
    const tdDescription = document.createElement("td");
    tdDescription.textContent = product.description;

    // Create table data for price
    const tdPrice = document.createElement("td");
    tdPrice.textContent = `$${product.price.toFixed(2)}`;

    // Create table data for quantity
    const tdQuantity = document.createElement("td");
    tdQuantity.textContent = product.quantity;

    // Create table data for flavors
    const tdFlavors = document.createElement("td");
    tdFlavors.textContent = Array.isArray(product.flavors)
      ? product.flavors.join(", ")
      : "No flavors";

    // Create table data for actions (Edit & Delete buttons)
    const tdActions = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.classList.add("btn", "action-btn");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editProduct(index); // Attach event

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "action-btn");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteProduct(index); // Attach event

    tdActions.appendChild(editBtn);
    tdActions.appendChild(deleteBtn);

    // Append all table data elements to the row
    tr.appendChild(tdImage);
    tr.appendChild(tdName);
    tr.appendChild(tdDescription);
    tr.appendChild(tdPrice);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdFlavors);
    tr.appendChild(tdActions);

    // Append the row to the table body
    tbody.appendChild(tr);
  });

  // Store the updated product list in localStorage for persistence
  localStorage.setItem("adminProducts", JSON.stringify(products));
}

// Customized Delete pop up
function deleteProduct(index) {
  Swal.fire({
    title: "Are you sure you want to delete this product?", // Confirmation message for deletion
    icon: "warning", // Displays a warning icon for emphasis
    showCancelButton: true, // Sets cancel button text to "Cancel"
    confirmButtonText: "Yes", // Sets confirmation button text to "Yes"
    cancelButtonText: "Cancel", // Sets abort button text to "Cancel"
    confirmButtonColor: "#d33", // Red --> confirmation button
    cancelButtonColor: "#3085d6", // Blue --> cancel button
  }).then((result) => {
    if (result.isConfirmed) {
      // Checks if the user clicked "Yes"
      products.splice(index, 1); // Remove the selected product from the array
      renderProducts(); // Updates the product list in the UI
      localStorage.setItem("adminProducts", JSON.stringify(products)); // Save changes
      Swal.fire("Deleted!", "The product has been removed.", "success"); // Show deletion completed message
    }
  });
}

/*-------------------------------------
    PRODUCT FORM (ADD/EDIT) HANDLING
--------------------------------------*/
// To reset the form 
function resetProductForm() {
  document.getElementById("adminProductForm").reset(); // Resets all input fields
  document.getElementById("adminImagePreview").src = ""; // Clears the preview image
  document.getElementById("adminProductIndex").value = "-1"; // Resets index for new entries
  document.getElementById("adminFormTitle").innerText = "Add Product"; // Resets form title
  document.getElementById("adminSubmitButton").innerText = "Add"; // Changes button text
  
  selectedFlavors = []; // Clears selected flavors array
  updateFlavorsButtonText(); // Updates the dropdown button text
  renderFlavorOptions(); // Refreshes available flavors list
}

document.getElementById("adminProductForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent page reload

  // Get trimmed input values to remove unwanted spaces
  const name = document.getElementById("adminProductName").value.trim();
  const description = document.getElementById("adminProductDescription").value.trim();
  const priceInput = document.getElementById("adminProductPrice").value.trim();
  const quantityInput = document.getElementById("adminProductQuantity").value.trim();

  // Convert numeric input values
  const price = parseFloat(priceInput);
  const quantity = parseInt(quantityInput);

  // **NEW: Check for negative values**
  if (price < 0 || quantity < 0) {
    Swal.fire({
      title: "Invalid Input!",
      text: "Price and quantity cannot be negative.",
      icon: "error",
      confirmButtonColor: "#d33"
    });
    return; // Stop execution if values are negative
  }

  // Check if all fields are filled and valid
  if (!name || !description || priceInput === "" || quantityInput === "" || isNaN(price) || isNaN(quantity) || selectedFlavors.length === 0) {
    Swal.fire({
      title: "Incomplete Form!",
      text: "Please fill in all fields and select at least one flavor before adding.",
      icon: "error",
      confirmButtonColor: "#d33"
    });
    return; // Stop further execution
  }

  // Image file selection & validation
  const fileInput = document.getElementById("adminProductImage");
  const file = fileInput.files[0]; // Retrieve selected file

  // Get product index from form input
  const productIndex = document.getElementById("adminProductIndex").value;
  const isEditing = productIndex !== "-1" && productIndex !== "";

  if (!isEditing && !file) {
    Swal.fire({
      title: "Missing Image!",
      text: "Please upload an image before adding the product.",
      icon: "error",
      confirmButtonColor: "#d33"
    });
    return;
  }

  // Function to update or add a product with image data
  function updateOrAddProduct(imageSrc) {
    if (isEditing) {
      products[productIndex] = {
        ...products[productIndex], // Preserve existing properties
        image: imageSrc,
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        flavors: [...selectedFlavors], // Store selected flavors
      };
    } else {
      products.push({
        id: products.length + 1, // Assign a new product ID
        image: imageSrc,
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        flavors: [...selectedFlavors],
      });
    }
    renderProducts(); // Refresh product listing table
    resetProductForm(); // Reset form fields for next entry
  }

  // Handle image selection: Read file as data URL
  if (file) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      updateOrAddProduct(ev.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    updateOrAddProduct(products[productIndex].image);
  }
});


// Function triggers whenever the user selects a file
document
  .getElementById("adminProductImage")
  .addEventListener("change", function (e) {
    const file = e.target.files[0]; // Get the selected file from the input

    if (file) {
      const reader = new FileReader(); // Create a FileReader instance to read the file

      reader.onload = function (ev) {
        // Execute once the file read is completed
        const imageUrl = ev.target.result; // Get the Data URL (base64 encoded image)
        document.getElementById("adminImagePreview").src = imageUrl; // Update the image preview element's source so that the image displays
        localStorage.setItem("adminSavedImage", imageUrl); // Save the Data URL in localStorage under the key "adminSavedImage"
      };
      reader.readAsDataURL(file);
    }
  });

// Edit an existing product by pre-filling the form with its details
// Retrieves product data based on the provided `index`
function editProduct(index) {
  const product = products[index];

  // Fill form with selected product details
  document.getElementById("adminProductName").value = product.name;
  document.getElementById("adminProductDescription").value =
    product.description;
  document.getElementById("adminProductPrice").value = product.price;
  document.getElementById("adminProductQuantity").value = product.quantity;
  document.getElementById("adminImagePreview").src = product.image;
  document.getElementById("adminProductIndex").value = index;

  // Update form labels to indicate edit mode
  document.getElementById("adminFormTitle").innerText = "Edit Product";
  document.getElementById("adminSubmitButton").innerText = "Update";

  product.flavors.forEach((flavor) => {
    if (!flavorOptions.includes(flavor)) {
      flavorOptions.push(flavor);
    }
    if (!selectedFlavors.includes(flavor)) {
      selectedFlavors.push(flavor);
    }
  });

  // Ensuring the flavors are included & selected
  renderFlavorOptions();
  document.querySelectorAll(".flavor-checkbox").forEach((chk) => {
    chk.checked = selectedFlavors.includes(chk.value);
  });
  updateFlavorsButtonText();
  document.getElementById("adminProductForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

//Clear Inputs on Page load/reload 
window.addEventListener("load", function () {
  document.getElementById("adminProductForm").reset(); // Clears input fields
  document.getElementById("adminImagePreview").src = ""; // Clears image preview
});
