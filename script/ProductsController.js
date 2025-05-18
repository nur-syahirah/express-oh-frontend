// Function to add a single item card to the DOM
function addItemCard(item) {
  const productListDiv = document.getElementById("product-list");
  
  // Create column wrapper (Bootstrap)
  const columnWrapper = document.createElement('div');
  columnWrapper.classList.add('col', 'col-lg-4', 'col-md-4', 'col-sm-6');

  // Create product card
  const productCard = document.createElement('div');
  productCard.className = "card h-100";
  columnWrapper.appendChild(productCard);

  // Image
  const productCardImage = document.createElement("img");
  productCardImage.src = item.image;
  productCardImage.alt = item.name;
  productCardImage.className = "card-img-top";
  productCard.appendChild(productCardImage);

  // Card body
  const productCardBody = document.createElement("div");
  productCardBody.className = "card-body";
  productCard.appendChild(productCardBody);

  // Title
  const productCardTitle = document.createElement("h5");
  productCardTitle.className = "card-title";
  productCardTitle.innerText = item.name;
  productCardBody.appendChild(productCardTitle);

  // Description
  const productCardInfo = document.createElement("p");
  productCardInfo.className = "card-text";
  productCardInfo.innerText = item.description;
  productCardBody.appendChild(productCardInfo);

  // Price
  const productCardPrice = document.createElement("p");
  productCardPrice.className = "card-text fw-semibold";
  productCardPrice.innerText = `Price: $${item.price.toFixed(2)}`;
  productCardBody.appendChild(productCardPrice);

  // Flavors
  const flavorContainer = document.createElement("div");
  flavorContainer.className = "mb-2";
  item.flavors.forEach(flavor => {
    const flavorButton = document.createElement("button");
    flavorButton.className = "btn btn-outline-secondary btn-sm me-1 m-1 flavor-btn";
    flavorButton.innerText = flavor;
    flavorContainer.appendChild(flavorButton);
  });
  productCardBody.appendChild(flavorContainer);

  // Add button
  const addButton = document.createElement("button");
  addButton.className = "btn btn-primary w-100";
  addButton.type = "button";
  addButton.innerText = "Add";
  addButton.setAttribute("data-bs-toggle", "modal");
  addButton.setAttribute("data-bs-target", "#addToCartModal");
  addButton.setAttribute("data-product-id", item.id);

  // No need for click event here anymore; modal filling done on show event
  productCardBody.appendChild(addButton);

  productListDiv.appendChild(columnWrapper);
}

// ModelController class (unchanged)
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

// Create controller instance
const modelController = new ModelController();

// Listen for Add button clicks inside product-list to set modal dataset (product info)
document.getElementById('product-list').addEventListener('click', (event) => {
  if (event.target && event.target.innerText === "Add") {
    const productId = event.target.getAttribute('data-product-id');
    const product = modelController.items.find(item => item.id.toString() === productId);
    if (!product) return;

    const modalEl = document.getElementById('addToCartModal');
    modalEl.dataset.productId = product.id;
    modalEl.dataset.productName = product.name;
  }
});

// Fill modal content dynamically when it opens
const addToCartModalEl = document.getElementById('addToCartModal');
addToCartModalEl.addEventListener('show.bs.modal', (event) => {
  const modal = event.target;
  const productName = modal.dataset.productName || '';
  const productId = modal.dataset.productId || '';

  modal.querySelector('#modal-product-name').innerText = productName;
  modal.querySelector('#modal-product-id').value = productId;
  modal.querySelector('#modal-quantity').value = 1; // reset quantity
});

// -------------- New: Confirm Add to Cart logic --------------

// Assuming your modal has a Confirm button with id="modal-confirm-btn"
document.getElementById('modal-confirm-btn').addEventListener('click', () => {
  const modalEl = document.getElementById('addToCartModal');
  const productId = modalEl.querySelector('#modal-product-id').value;
  const quantity = parseInt(modalEl.querySelector('#modal-quantity').value, 10);

  const product = modelController.items.find(item => item.id.toString() === productId);
  if (!product) {
    alert("Product not found!");
    return;
  }

  if (quantity < 1 || isNaN(quantity)) {
    alert("Please enter a valid quantity.");
    return;
  }

  // For now, just log the cart addition (or you can add to a cart array here)
  console.log(`Added to cart: ${product.name}, Quantity: ${quantity}`);

  // You can implement your cart logic here, for example:
  // cartController.addItem(product, quantity);

  // Close the modal programmatically
  const bootstrapModal = bootstrap.Modal.getInstance(modalEl);
  bootstrapModal.hide();
});

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