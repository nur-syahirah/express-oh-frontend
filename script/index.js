// Function to add a single item card to the DOM
function addItemCard(item) {
  const productListDiv = document.getElementById("product-list");

  const columnWrapper = document.createElement("div");
  columnWrapper.classList.add("col", "col-lg-4", "col-md-4", "col-sm-6", "mb-4");

  const productCard = document.createElement("div");
  productCard.className = "card product-card h-100";
  columnWrapper.appendChild(productCard);

  const productCardImage = document.createElement("img");
  productCardImage.src = "http://localhost:8080" + item.imageURL;
  productCardImage.alt = item.name;
  productCardImage.className = "card-img-top img-fluid";
  productCard.appendChild(productCardImage);

  const productCardBody = document.createElement("div");
  productCardBody.className = "card-body";
  productCard.appendChild(productCardBody);

  const productCardTitle = document.createElement("h5");
  productCardTitle.className = "card-title product-title text-dark";
  productCardTitle.innerText = item.name;
  productCardBody.appendChild(productCardTitle);

  const productCardInfo = document.createElement("p");
  productCardInfo.className = "card-text product-description";
  productCardInfo.innerText = item.description;
  productCardBody.appendChild(productCardInfo);

  const productCardPrice = document.createElement("div");
  productCardPrice.className = "product-price text-dark";
  productCardPrice.innerText = `$${item.price.toFixed(2)}`;
  productCardBody.appendChild(productCardPrice);

  const flavorContainer = document.createElement("div");
  flavorContainer.className = "product-tags";
  flavorContainer.innerText = "Tags: ";
  item.flavors.forEach((flavor, index) => {
    flavorContainer.innerText += flavor.name;
    if (index < item.flavors.length - 1) {
      flavorContainer.innerText += " | ";
    }
  });
  productCardBody.appendChild(flavorContainer);

  const addButton = document.createElement("button");
  addButton.className = "add-to-cart-btn btn w-100";
  addButton.type = "button";
  addButton.innerText = "Add";
  addButton.setAttribute("data-bs-toggle", "modal");
  addButton.setAttribute("data-bs-target", "#addToCartModal");
  addButton.setAttribute("data-product-id", item.id);
  productCardBody.appendChild(addButton);

  productListDiv.appendChild(columnWrapper);
}

// ModelController for product storage
class ModelController {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
    addItemCard(item);
  }

  clear() {
    this.items = [];
    document.getElementById("product-list").innerHTML = "";
  }

  refreshItemsOnPage() {
    document.getElementById("product-list").innerHTML = "";
    this.items.forEach((item) => addItemCard(item));
  }
}

const modelController = new ModelController();

// Load products (limit to 3 for featured section)
function loadFeaturedProducts() {
  fetch("http://localhost:8080/api/products")
    .then((response) => response.json())
    .then((data) => {
      modelController.clear();
      data.slice(0, 3).forEach((product) => modelController.addItem(product));
    })
    .catch((error) => {
      console.error("Failed to fetch products:", error);
    });
}

// DOM ready
document.addEventListener("DOMContentLoaded", function () {
  loadFeaturedProducts();

  const addToCartModal = document.getElementById("addToCartModal");

  addToCartModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const productId = button.getAttribute("data-product-id");
    const product = modelController.items.find(
      (p) => p.id.toString() === productId.toString()
    );

    if (!product) {
      console.error("Product not found");
      return;
    }

    document.getElementById("modal-product-name").textContent = product.name;
    document.getElementById("modal-product-description").textContent = product.description;
    document.getElementById("modal-product-price").textContent = `$${product.price.toFixed(2)}`;
    document.getElementById("modal-product-id").value = product.id;
    document.getElementById("modal-quantity").value = 1;
  });

  document.getElementById("modal-confirm-btn").addEventListener("click", function () {
    const productId = document.getElementById("modal-product-id").value;
    const quantity = parseInt(document.getElementById("modal-quantity").value);

    if (isNaN(quantity) || quantity < 1) {
      alert("Please enter a valid quantity (minimum 1)");
      return;
    }

    const product = modelController.items.find((p) => p.id.toString() === productId.toString());
    if (!product) {
      alert("Product not found");
      return;
    }

    addToCart(product, quantity);

    const modal = bootstrap.Modal.getInstance(addToCartModal);
    modal.hide();

    if (typeof updateCartCount === "function") {
      updateCartCount(); // optional if function exists
    }
  });
});

// Add product to cart (stored in localStorage)
function addToCart(product, quantity) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageURL,
      quantity: quantity,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  console.log("Added to cart:", product.name, quantity);
}
