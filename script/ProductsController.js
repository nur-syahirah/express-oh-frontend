// ModelController class to manage adding, removing, and clearing products
class ModelController {
    constructor() {
      this.items = [...productData]; // Initial products list
    }
  
    addItem(item) {
      this.items.push(item);
      this.render();
    }
  
    removeItem(itemId) {
      this.items = this.items.filter(item => item.id !== itemId);
      this.render();
    }
  
    clear() {
      this.items = [];
      this.render();
    }
  
    // Render the product list on the DOM
    render() {
      const productListDiv = document.getElementById("product-list");
      productListDiv.innerHTML = ''; // Clear current products
  
      // Loop through items and create card elements
      this.items.forEach(item => {
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
        
        productListDiv.appendChild(productCard); // Append the new card to the div
      });
    }
  }
  
  // Create an instance of ModelController
  const modelController = new ModelController();
  
  // Render the initial product list
  modelController.render();
  
  // Example usage of functions
  // To add a new item
  // modelController.addItem(newProduct);
  
  // To remove an item (e.g., item with id 1)
  // modelController.removeItem(1);
  
  // To clear all items
  // modelController.clear();
  