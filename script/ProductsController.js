// Function to add a single item card to the DOM
function addItemCard(item) {
  const productListDiv = document.getElementById("product-list");
  const productCard = document.createElement('div');
  productCard.classList.add('col', 'col-lg-4', 'col-md-4', 'col-sm-6');
  
  productCard.innerHTML = `
    <div class="card h-100">
      <img src="${item.image}" class="card-img-top" alt="${item.name}">
      <div class="card-body">
        <h5 class="card-title">${item.name}</h5>
        <p class="card-text">${item.description}</p>
        <p class="card-text fw-semibold">Price: $${item.price.toFixed(2)}</p>
        <div class="mb-2">
          ${item.flavors.map(flavor => `<button class="btn btn-outline-secondary btn-sm me-1 flavor-btn">${flavor}</button>`).join('')}
        </div>
        <button class="btn btn-primary w-100" type="button">Add</button>
      </div>
    </div>
  `;

  productListDiv.appendChild(productCard);
}

// Controller class for managing items
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
    this.refreshItemsOnPage(); // manually refresh DOM
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

// Create an instance of the controller
const modelController = new ModelController();

// Optional: add item manually from console for testing
// modelController.addItem({
//   id: 11,
//   name: "New Product",
//   description: "Added from console",
//   price: 49.99,
//   image: "./images/cuphead.png",
//   flavors: ["Vanilla", "Hazelnut"]
// });

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
