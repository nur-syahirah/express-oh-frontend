// 6. Challenge:
// a. Create a menu of items based on an array of references
// b. Provide the links from the array of references to the user

// Array of links to display
const siteNavigation = [
    {name: "shop", url: "./shop.html"},
    {name: "about", url: "./about.html"},
    {name: "login", url: "./login.html"},
    {name: "cart", url: "./cart.html"},
];

const profileURL = "./profile.html";                                                            // * link to userprofile (NEW)

// get the navbar
const nav = document.getElementsByTagName("nav");
const navbar = nav[0];

// Create an unordered list to insert list items as a menu item
const listofLinks = document.createElement("ul");
navbar.append(listofLinks); 

// TODO
// when covering the topic of User-athentication, a fetch request will be needed to change loggedIn (true/false)
const loggedIn = true;

// For each navitem in siteNavigation
siteNavigation.forEach(navitem => {
    // Create a list item
    const itemLink = document.createElement("li");

    // Create an anchor on each navitem
    const anchor = document.createElement("a");
    anchor.setAttribute("href", navitem.url);

    const navItemName = navitem.name.toLowerCase();                                             // Set all navitem.names to lowercase
    
   
    if(navItemName !== "login" && navItemName !== "cart")                                       // For links !== "User" and !== "About" (DON'T use graphical icons)
    {
        // list the basic naviation items
        anchor.textContent = navItemName.charAt(0).toUpperCase() + navItemName.slice(1);        // Set the text and the link

    }else if(navItemName === "login"){                                                          // If the navitem.name === "User"        

        const token = isAuthenticated();                                                        // * check if token exists (NEW)
        console.log(token);
        if(token)                                                                               // * if token is found (NEW)
        {

            const user = decodeUser(token);                                                     // * decode the token (NEW)
            const icon = document.createElement("ion-icon");                                    // Use graphical icon "person-outline"
            icon.setAttribute("name", "person-outline");
            anchor.append(icon);
            anchor.setAttribute("href", profileURL);                                            // * allow user to redirect to profile page (NEW)
            anchor.setAttribute("data-bs-toggle", "tooltip");                                   // * show tool tip when mouseover user icon (NEW)
            anchor.setAttribute("data-bs-title", user.username)                                 // * show user when mouseover user icon (NEW)
            anchor.setAttribute("data-bs-placement", "bottom");                                 // * place tooltip at the bottom 
            const tooltipProfile =  new bootstrap.Tooltip(anchor);                              // * pass anchor instance to bootstrap tooltip (NEW)             
        }
        else{
            anchor.text = navitem.name;                                                         // Use text "Log in"
        }

    }else if(navItemName === "cart"){
        const icon = document.createElement("ion-icon");                                        // Use graphical icon "cart-outline"
        icon.setAttribute("name", "cart-outline");
        anchor.append(icon);

         // Create cart counter badge
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

// Update cart counter
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
localStorage.removeItem('cart');
updateCartCount();