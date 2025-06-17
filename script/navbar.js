// Start with a base navigation array.
let siteNavigation = [
    { name: _PRODUCT_TITLE, url:  _PRODUCT_URL },
    { name: _ABOUT_TITLE, url: _ABOUT_URL },
    { name: _LOGIN_TITLE, url: _LOGIN_URL },
    { name: _LOGOUT_TITLE, url: "" },
    { name: _CART_TITLE, url: _CART_URL }
  ];

//const profileURL = "./profile.html";                                                            // * link to userprofile (NEW)

// Retrieve the <nav> element and create an unordered list for navigation items.const nav = document.getElementsByTagName("nav");
const nav = document.getElementsByTagName("nav");
const navbar = nav[0];

// Create an unordered list to insert list items as a menu item
const listofLinks = document.createElement("ul");
navbar.append(listofLinks); 

// For the "login" nav item, check the authentication status.
const token = isAuthenticated();                                                                // * check if token exists (NEW)

// Loop through each navigation item and build the menu.
siteNavigation.forEach((navitem) => {
    
    let itemLink = null;                                                                        // * set itemLink as null first
    let anchor = null;                                                                          // * set anchor as null first
  
    // Convert nav item name to lowercase for easier comparisons.
    const navItemName = navitem.name.toLowerCase();

    if (navItemName !== "login" && navItemName !== "logout" && navItemName !== "cart") {
            
        itemLink = document.createElement("li");
        anchor = document.createElement("a");
        anchor.setAttribute("href", navitem.url);                                               
        anchor.textContent = navItemName.charAt(0).toUpperCase() + navItemName.slice(1);
        
    } else if (navItemName === "login") {

        itemLink = document.createElement("li");
        anchor = document.createElement("a");
        anchor.setAttribute("href", navitem.url);                                               

        if(token)                                                                               // * if token is found
        {
            // User is authenticated.
            const user = decodeUser(token);
            
            // Add tooltip attributes to display the username on hover.
            anchor.setAttribute("data-bs-toggle", "tooltip");
            anchor.setAttribute("data-bs-title", user.email);
            anchor.setAttribute("data-bs-placement", "bottom");
            
            // Initialize the Bootstrap tooltip.
            new bootstrap.Tooltip(anchor);
            
            // User is authenticated - display the login icon.
            const icon = document.createElement("ion-icon");
            icon.setAttribute("name", "person-outline");
            anchor.append(icon);
            anchor.setAttribute("href", _PROFILE_URL);                                          // Use text "Log in"
            
        }else{
            // User is NOT authenticated - show login link
            anchor.textContent = navItemName.charAt(0).toUpperCase() + navItemName.slice(1);
        }
    }else if (navItemName === "logout"){

        // if an authenticated token exists, display logout and add an eventlistener to call auth.js > logout()
        if(token){

            itemLink = document.createElement("li");
            anchor = document.createElement("a");
            anchor.setAttribute("href", navitem.url);  

            // Display the text; logout
            anchor.textContent = navItemName.charAt(0).toUpperCase() + navItemName.slice(1);
    
            // Add an event listener for logging out.
            anchor.addEventListener("click", (e) => {

                e.preventDefault();
                
                logout();

            }); 
        }

    }else if(navItemName === "cart"){

        itemLink = document.createElement("li");
        anchor = document.createElement("a");
        anchor.setAttribute("href", navitem.url);  

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
    if(anchor) itemLink.append(anchor);

    // append each list item into the unordered list
    if(itemLink) listofLinks.append(itemLink);            
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