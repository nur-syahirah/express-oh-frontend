// Function to add a single item card to the DOM
// Function to add a single item card to the DOM
function addItemCard(item) {
  const productListDiv = document.getElementById("product-list");

  const columnWrapper = document.createElement('div');
  columnWrapper.classList.add('col', 'col-lg-4', 'col-md-4', 'col-sm-6');

  const productCard = document.createElement('div');
  productCard.className = "card h-100";
  columnWrapper.appendChild(productCard);

  const productCardImage = document.createElement("img");
  productCardImage.src = item.image;
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
    flavorButton.innerText = flavor;
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
    this.loadFromLocalStorage();
  }

  addItem(item) {
    this.items.push(item);
    this.saveToLocalStorage();
    addItemCard(item);
  }

  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveToLocalStorage();
    this.refreshItemsOnPage();
  }

  clear() {
    this.items = [];
    this.saveToLocalStorage();
    document.getElementById("product-list").innerHTML = '';
  }

  saveToLocalStorage() {
    localStorage.setItem("product-list", JSON.stringify(this.items));
  }

  loadFromLocalStorage() {
    const storedItems = localStorage.getItem("product-list");
    if (storedItems) {
      this.items = JSON.parse(storedItems);
    } else {
      this.items = [...productData]; // fallback to default data
      this.saveToLocalStorage();
    }
    this.refreshItemsOnPage();
  }

  refreshItemsOnPage() {
    document.getElementById("product-list").innerHTML = '';
    this.items.forEach(item => addItemCard(item));
  }
}


const modelController = new ModelController();

// JavaScript Implementation
document.addEventListener('DOMContentLoaded', function() {
  // Initialize modal functionality
  const addToCartModal = document.getElementById('addToCartModal');
  
  // When modal opens
  addToCartModal.addEventListener('show.bs.modal', function(event) {
    const button = event.relatedTarget;
    const productId = button.getAttribute('data-product-id');
    const product = getProductById(productId);
    
    if (!product) {
      console.error('Product not found');
      return;
    }
    
    // Populate modal with product data
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-description').textContent = product.description;
    document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-product-id').value = product.id;
    document.getElementById('modal-quantity').value = 1;
  });
  
  // Add to cart button handler
  document.getElementById('modal-confirm-btn').addEventListener('click', function() {
    const productId = document.getElementById('modal-product-id').value;
    const quantity = parseInt(document.getElementById('modal-quantity').value);
    
    // Validate input
    if (isNaN(quantity) || quantity < 1) {
      alert('Please enter a valid quantity (minimum 1)');
      return;
    }
    
    const product = getProductById(productId);
    if (!product) {
      alert('Product not found');
      return;
    }
    
    // Add to cart
    addToCart(product, quantity);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(addToCartModal);
    modal.hide();
    
    // Update cart counter
    updateCartCount();
  });
  
  // Helper function to find product by ID
  function getProductById(id) {
    return productData.find(product => product.id.toString() === id.toString());
  }
  
  // Add to cart function
  function addToCart(product, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Added to cart:', product.name, quantity);
  }})
  

/* Quick test on web browser

addItemCard({
  id: 99,
  name: "Test Product",
  description: "This is a test item",
  price: 123.45,
  image: "./images/cuphead.png",
  flavors: ["Test", "Demo"]
});

*/

/* To clear localStorage when adding item in product mock data

localStorage.removeItem("product-list");
location.reload(); // reloads the page

*/