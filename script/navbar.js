// Start with a base navigation array.
let siteNavigation = [
    { name: "shop", url: "./products.html" },
    { name: "about", url: "./about.html" },
    { name: "login", url: "./loginmain.html" },
    { name: "cart", url: "./cart.html" }
  ];

//const profileURL = "./profile.html";                                                            // * link to userprofile (NEW)

// Retrieve the <nav> element and create an unordered list for navigation items.const nav = document.getElementsByTagName("nav");
const nav = document.getElementsByTagName("nav");
const navbar = nav[0];

// Create an unordered list to insert list items as a menu item
const listofLinks = document.createElement("ul");
navbar.append(listofLinks); 

// TODO
// when covering the topic of User-athentication, a fetch request will be needed to change loggedIn (true/false)
const loggedIn = true;

// Loop through each navigation item and build the menu.
siteNavigation.forEach((navitem) => {
    const itemLink = document.createElement("li");
    const anchor = document.createElement("a");

    // Set the default href attribute based on the navitem.url
    anchor.setAttribute("href", navitem.url);
  
    // Convert nav item name to lowercase for easier comparisons.
    const navItemName = navitem.name.toLowerCase();

    if (navItemName !== "login" && navItemName !== "cart") {
    
        // Display the text; Shop, About
        anchor.textContent = navItemName.charAt(0).toUpperCase() + navItemName.slice(1);
            } else if (navItemName === "login") {

            // For the "login" nav item, check the authentication status.
            const token = isAuthenticated();                                                    // * check if token exists (NEW)
            console.log(token);
            if(token)                                                                               // * if token is found (NEW)
            {
                // User is authenticated.
                const user = decodeUser(token);
                anchor.textContent = "Logout";
                
                // Add tooltip attributes to display the username on hover.
                anchor.setAttribute("data-bs-toggle", "tooltip");
                anchor.setAttribute("data-bs-title", user.username);
                anchor.setAttribute("data-bs-placement", "bottom");

                // Initialize the Bootstrap tooltip.
                new bootstrap.Tooltip(anchor);

                // Add an event listener for logging out.
                anchor.addEventListener("click", (e) => {
                e.preventDefault();

                // Remove the auth token from localStorage.
                localStorage.removeItem("usertoken");

                // Redirect to index.html after logging out.
                window.location.href = "index.html";
                });                                      
        } else{
            // User is not authenticated - display the login icon.
            const icon = document.createElement("ion-icon");
            icon.setAttribute("name", "person-outline");
            anchor.append(icon);
            anchor.setAttribute("href", "./loginmain.html");                                                  // Use text "Log in"
            }

    }else if(navItemName === "cart"){
      // For the cart, display the cart icon and a counter badge.
      const icon = document.createElement("ion-icon");
      icon.setAttribute("name", "cart-outline");
      anchor.append(icon);

      // Create cart counter badge.
      const counter = document.createElement("span");
      counter.className = "cart-counter";
      counter.textContent = "0";
      anchor.append(counter);
    }

    // append the anchor to each list item
    itemLink.append(anchor);

    // append each list item into the unordered list
    listofLinks.append(itemLink);            
});        

// Function to update the displayed cart count.
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Initialize cart counter on page load
// Clear all cart data
// localStorage.removeItem('cart');
updateCartCount();