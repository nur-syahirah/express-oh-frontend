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
        anchor.textContent = navItemName.charAt(0).toUpperCase() + navItemName.slice(1);        // Set the text and the link

    }else if(navItemName === "login"){                                                          // If the navitem.name === "User"        
        
        if(loggedIn)                                                                            //  If loggedIn === true
        {
            const icon = document.createElement("ion-icon");                                    // Use graphical icon "person-outline"
            icon.setAttribute("name", "person-outline");
            anchor.append(icon);
        }
        else{
            anchor.text = navitem.name;                                                         // Use text "Log in"
        }
    }else if(navItemName === "cart"){
        const icon = document.createElement("ion-icon");                                        // Use graphical icon "cart-outline"
        icon.setAttribute("name", "cart-outline");
        anchor.append(icon);
    }

    // append the anchor to each list item
    itemLink.append(anchor);

    // append each list item into the unordered list
    listofLinks.append(itemLink);            
});        