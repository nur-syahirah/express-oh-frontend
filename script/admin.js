/*-------------------------
  LOCAL STORAGE HANDLING (Admin)
  - For tags and products; product form image preview remains empty on reload.
-------------------------*/
window.addEventListener("load", function() {
    // Clear the admin product form image preview on load.
    document.getElementById("adminImagePreview").src = "";
    localStorage.removeItem("adminSavedImage");
  
    // Load stored admin tags.
    const storedTags = localStorage.getItem("adminTagOptions");
    const storedSelected = localStorage.getItem("adminSelectedTags");
    if (storedTags) {
      tagOptions = JSON.parse(storedTags);
    }
    if (storedSelected) {
      selectedTags = JSON.parse(storedSelected);
    }
    renderTagOptions();
    updateTagsButtonText();
    
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
    TAGS HANDLING (Admin)
  -------------------------*/
  let tagOptions = JSON.parse(localStorage.getItem("adminTagOptions")) || ["Tag 1", "Tag 2", "Tag 3", "Tag 4"];
  let selectedTags = []; // Always start with no selected tags
  
  function saveTagsToLocalStorage() {
    localStorage.setItem("adminTagOptions", JSON.stringify(tagOptions));
    localStorage.setItem("adminSelectedTags", JSON.stringify(selectedTags));
  }
  function renderTagOptions() {
    const container = document.getElementById("adminDropdownTagOptions");
    container.innerHTML = "";
    tagOptions.forEach(tag => {
      const li = document.createElement("li");
      li.className = "mb-1";
      li.innerHTML = `
        <div class="d-flex align-items-center justify-content-between">
          <div class="form-check">
            <input class="form-check-input tag-checkbox" type="checkbox" value="${tag}" id="adminChk-${tag}">
            <label class="form-check-label" for="adminChk-${tag}">${tag}</label>
          </div>
          <button type="button" class="btn btn-sm remove-tag" onclick="removeTagOption('${tag}')" style="margin-left:5px; background: none; border: none; color: #6c757d;">&times;</button>
        </div>
      `;
      container.appendChild(li);
    });
    document.querySelectorAll(".tag-checkbox").forEach(chk => {
      if (selectedTags.includes(chk.value)) {
        chk.checked = true;
      }
      chk.addEventListener("change", updateSelectedTags);
    });
    saveTagsToLocalStorage();
  }
  
  function updateSelectedTags() {
    selectedTags = [];
    document.querySelectorAll(".tag-checkbox").forEach(chk => {
      if (chk.checked) {
        selectedTags.push(chk.value);
      }
    });
    updateTagsButtonText();
    saveTagsToLocalStorage();
  }
  
  function updateTagsButtonText() {
    const btn = document.getElementById("adminTagsDropdownButton");
    btn.innerText = selectedTags.length ? selectedTags.join(", ") : "Select Tags";
  }
  
  document.getElementById("adminNewTagInput").addEventListener("keydown", function(e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag !== "" && !tagOptions.includes(newTag)) {
        tagOptions.push(newTag);
        selectedTags.push(newTag);
      }
      renderTagOptions();
      updateTagsButtonText();
      e.target.value = "";
      saveTagsToLocalStorage();
    }
  });
  
  function removeTagOption(tag) {
    const index = tagOptions.indexOf(tag);
    if (index > -1) {
      tagOptions.splice(index, 1);
    }
    const sIndex = selectedTags.indexOf(tag);
    if (sIndex > -1) {
      selectedTags.splice(sIndex, 1);
    }
    updateTagsButtonText();
    renderTagOptions();
    saveTagsToLocalStorage();
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
    { image: "https://via.placeholder.com/50", name: "Coffee 1", tags: ["Tag 1", "Tag 2", "Tag 3"], price: 7.00, quantity: 100 },
    { image: "https://via.placeholder.com/50", name: "Coffee 2", tags: ["Tag 1", "Tag 7", "Tag 9"], price: 8.80, quantity: 300 },
    { image: "https://via.placeholder.com/50", name: "Coffee 3", tags: ["Tag 3", "Tag 4"], price: 6.50, quantity: 237 },
    { image: "https://via.placeholder.com/50", name: "Coffee 4", tags: ["Tag 2", "Tag 3", "Tag 8"], price: 6.50, quantity: 106 }
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
        <td>${product.tags.join(", ")}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.quantity}</td>
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
  
  /*-------------------------
    ADMIN PRODUCT FORM (ADD/EDIT) HANDLING
  -------------------------*/
  function resetProductForm() {
    document.getElementById("adminProductForm").reset();
    document.getElementById("adminImagePreview").src = "";
    document.getElementById("adminProductIndex").value = "-1";
    document.getElementById("adminFormTitle").innerText = "Add Product";
    document.getElementById("adminSubmitButton").innerText = "Add";
    selectedTags = [];
    updateTagsButtonText();
    renderTagOptions();
  }
  
  document.getElementById("adminProductForm").addEventListener("reset", function() {
    resetProductForm();
  });
  
  document.getElementById("adminProductForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const idx = document.getElementById("adminProductIndex").value;
    const editMode = idx !== "-1" && idx !== "";
    const name = document.getElementById("adminProductName").value;
    const price = parseFloat(document.getElementById("adminProductPrice").value);
    const quantity = parseInt(document.getElementById("adminProductQuantity").value);
    if (!name || isNaN(price) || isNaN(quantity) || selectedTags.length === 0) {
      alert("Please fill in all fields correctly and select at least one tag.");
      return;
    }
    const fileInput = document.getElementById("adminProductImage");
    const file = fileInput.files[0];
  
    function updateOrAddProduct(imageSrc) {
      if (editMode) {
        products[idx] = {
          ...products[idx],
          image: imageSrc,
          name: name,
          tags: [...selectedTags],
          price: price,
          quantity: quantity
        };
      } else {
        products.push({
          image: imageSrc,
          name: name,
          tags: [...selectedTags],
          price: price,
          quantity: quantity
        });
      }
      renderProducts();
      resetProductForm();
    }
  
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        updateOrAddProduct(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      if (editMode) {
        updateOrAddProduct(products[idx].image);
      } else {
        updateOrAddProduct("https://via.placeholder.com/50");
      }
    }
  });
  
  function editProduct(index) {
    const product = products[index];
    document.getElementById("adminProductName").value = product.name;
    document.getElementById("adminProductPrice").value = product.price;
    document.getElementById("adminProductQuantity").value = product.quantity;
    document.getElementById("adminImagePreview").src = product.image;
    document.getElementById("adminProductIndex").value = index;
    document.getElementById("adminFormTitle").innerText = "Edit Product";
    document.getElementById("adminSubmitButton").innerText = "Update";
    product.tags.forEach(tag => {
      if (!tagOptions.includes(tag)) { tagOptions.push(tag); }
      if (!selectedTags.includes(tag)) { selectedTags.push(tag); }
    });
    renderTagOptions();
    document.querySelectorAll(".tag-checkbox").forEach(chk => {
      chk.checked = selectedTags.includes(chk.value);
    });
    updateTagsButtonText();
  }