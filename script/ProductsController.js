// Function to add a single item card to the DOM
function addItemCard(item) {
  const productListDiv = document.getElementById("product-list");

  const columnWrapper = document.createElement('div');
  columnWrapper.classList.add('col', 'col-lg-4', 'col-md-4', 'col-sm-6');

  const productCard = document.createElement('div');
  productCard.className = "card h-100";
  columnWrapper.appendChild(productCard);

  const productCardImage = document.createElement("img");
  productCardImage.src = "http://localhost:8080" + item.imageURL;
  productCardImage.alt = item.name;
  productCardImage.className = "card-img-top";
  productCard.appendChild(productCardImage);

  const productCardBody = document.createElement("div");
  productCardBody.className = "card-body";
  productCard.appendChild(productCardBody);

  const productCardTitle = document.createElement("h5");
  productCardTitle.className = "card-title";
  productCardTitle.innerText = item.name;
  productCardBody.appendChild(productCardTitle);

  const productCardInfo = document.createElement("p");
  productCardInfo.className = "card-text";
  productCardInfo.innerText = item.description;
  productCardBody.appendChild(productCardInfo);

  const productCardPrice = document.createElement("p");
  productCardPrice.className = "card-text fw-semibold";
  productCardPrice.innerText = `Price: $${item.price.toFixed(2)}`;
  productCardBody.appendChild(productCardPrice);

  const flavorContainer = document.createElement("div");
  flavorContainer.className = "mb-2";
  item.flavors.forEach(flavor => {
    const flavorButton = document.createElement("button");
    flavorButton.className = "btn btn-outline-secondary btn-sm me-1 m-1 flavor-btn";
    flavorButton.innerText = flavor.name;
    flavorContainer.appendChild(flavorButton);
  });
  productCardBody.appendChild(flavorContainer);

  const addButton = document.createElement("button");
  addButton.className = "btn btn-primary w-100";
  addButton.type = "button";
  addButton.innerText = "Add";
  addButton.setAttribute("data-bs-toggle", "modal");
  addButton.setAttribute("data-bs-target", "#addToCartModal");
  addButton.setAttribute("data-product-id", item.id);
  productCardBody.appendChild(addButton);

  productListDiv.appendChild(columnWrapper);
}

// ModelController class
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
    document.getElementById("product-list").innerHTML = '';
  }

  refreshItemsOnPage() {
    document.getElementById("product-list").innerHTML = '';
    this.items.forEach(item => addItemCard(item));
  }
}

const modelController = new ModelController();

// Fetch products from backend
function loadProductsFromAPI() {
  fetch('http://localhost:8080/api/products')
    .then(response => response.json())
    .then(data => {
      modelController.clear();
      data.forEach(product => modelController.addItem(product));
    })
    .catch(error => {
      console.error("Failed to fetch products:", error);
    });
}

// DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Load products from backend API
  loadProductsFromAPI();

  const addToCartModal = document.getElementById('addToCartModal');

  addToCartModal.addEventListener('show.bs.modal', function(event) {
    const button = event.relatedTarget;
    const productId = button.getAttribute('data-product-id');
    const product = modelController.items.find(p => p.id.toString() === productId.toString());

    if (!product) {
      console.error('Product not found');
      return;
    }

    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-description').textContent = product.description;
    document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-product-id').value = product.id;
    document.getElementById('modal-quantity').value = 1;
  });

  document.getElementById('modal-confirm-btn').addEventListener('click', function() {
    const productId = document.getElementById('modal-product-id').value;
    const quantity = parseInt(document.getElementById('modal-quantity').value);

    if (isNaN(quantity) || quantity < 1) {
      alert('Please enter a valid quantity (minimum 1)');
      return;
    }

    const product = modelController.items.find(p => p.id.toString() === productId.toString());
    if (!product) {
      alert('Product not found');
      return;
    }

    addToCart(product, quantity);

    const modal = bootstrap.Modal.getInstance(addToCartModal);
    modal.hide();

    updateCartCount(); // your original cart count function is preserved
  });
});

function addToCart(product, quantity) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageURL,
      quantity: quantity
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Added to cart:', product.name, quantity);
}
