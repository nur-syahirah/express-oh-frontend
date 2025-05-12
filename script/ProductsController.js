  // Function to add a single item card to the DOM
  function addItemCard(item) {
  const productListDiv = document.getElementById("product-list");
  
  // Create column wrapper (for Bootstrap layout)
  const columnWrapper = document.createElement('div');
  columnWrapper.classList.add('col', 'col-lg-4', 'col-md-4', 'col-sm-6');

  // Create product card
  const productCard = document.createElement('div');
  productCard.className = "card h-100";
  columnWrapper.appendChild(productCard); // Append card to column

  // Create image element
  const productCardImage = document.createElement("img");
  productCardImage.src = item.image;
  productCardImage.alt = item.name; // Use alt instead of name
  productCardImage.className = "card-img-top";
  productCard.appendChild(productCardImage);

  // Create body container for card
  const productCardBody = document.createElement("div");
  productCardBody.className = "card-body";
  productCard.appendChild(productCardBody);

  // Create card title for card
  const productCardTitle = document.createElement("h5");
  productCardTitle.className = "card-title";
  productCardTitle.innerText = item.name;
  productCardBody.appendChild(productCardTitle);

  // Create card description
  const productCardInfo = document.createElement("p");
  productCardInfo.className = "card-text";
  productCardInfo.innerText = item.description;
  productCardBody.appendChild(productCardInfo);

  // Create price info for card
  const productCardPrice = document.createElement("p");
  productCardPrice.className = "card-text fw-semibold";
  productCardPrice.innerText = `Price: $${item.price.toFixed(2)}`;
  productCardBody.appendChild(productCardPrice);

  // Create flavor tags for card
  const flavorContainer = document.createElement("div");
  flavorContainer.className = "mb-2";
  item.flavors.forEach(flavor => {
    const flavorButton = document.createElement("button");
    flavorButton.className = "btn btn-outline-secondary btn-sm me-1 flavor-btn";
    flavorButton.innerText = flavor;
    flavorContainer.appendChild(flavorButton);
  });
  productCardBody.appendChild(flavorContainer);

  // Create add button for card
  const addButton = document.createElement("button");
  addButton.className = "btn btn-primary w-100";
  addButton.type = "button";
  addButton.innerText = "Add";
  productCardBody.appendChild(addButton);

  // Append the full column to the product list
  productListDiv.appendChild(columnWrapper);
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

/* To clear localStorage when adding item in product mock data

localStorage.removeItem("product-list");
location.reload(); // reloads the page

*/
