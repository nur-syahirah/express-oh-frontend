// Function to authenticate the user via site's JWT token
function isAuthenticated(){

    const token = window.localStorage.getItem(_USERTOKEN);          // Retrieve usertoken from local storage
    
    const expired = isTokenExpired(token);                          // Check the token's expiry 
    
    if(expired)                                                     // If expired, return (false)
        return;

    return token;                                                   // Else return token (usertoken)
}

// Function to check if the token has expired
function isTokenExpired(token) {                                    

    if (!token) return true;                                        // Return true if token passed in is undefined 

    const payload = JSON.parse(atob(token.split('.')[1]));          // Decode the JWT token (a base64-encoded JSON payload)

    const expirationTime = payload.exp;                             // Get the expiration time from the token payload

    const currentTime = Math.floor(Date.now() / 1000);              // Current time in seconds

    return expirationTime < currentTime;                            // Return true ONLY when currentTime is LESS THAN token's expirationTime
}

// Function to decode the user's email from the parameter
function decodeUser(token){                                         
    
    // !! Extract authenticated user's email from the token
    const arrToken = token.split(".");                              
    const decodedToken = JSON.parse(window.atob(arrToken[1]));
    const email = decodedToken.email;
    const username = decodedToken.username;
    const role = decodedToken.role;
    return {email: email, username: username, role: role};

}

// ?? async / await
// ?? Async functions return results wrapped in a resolved Promise; for any errors, a 'rejected' Promise is returned 
// ?? In an async function, await pauses execution for the function until a Promise is resolved/rejected. 

// Funtion to login
async function login(formData = {}){

    if(Object.entries(formData).length === 0)                                               // Return if the object is empty
        return;

    // !! Try/catch block (exception handling) to send data to login enpoint
    try {
        // FETCH requests - send data or retrive data by calling an API endpoint            // TODO: refactor when end-point is available
        /* 
            const response = await fetch(_ENDPOINT_LOGIN, {                                 // Perform an async POST request to process the form data
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData)
            });
        */

        // !! Mock response for testing purposes (remove when endpoint request is available)
        const response = Mock.getMockSuccess();                                            // TODO: remove when endpoint request is available (remove in production env.)  
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));      // TODO: remove delay when endpoint is instated
        await sleep(2000);
        
        if(response.ok){                                                                    // If response is ok
       // Decode both tokens from the mock
        const decodedUser = decodeUser(Mock.mockUserToken);
        const decodedAdmin = decodeUser(Mock.mockAdminToken);
       
        // Check if the login input matches either admin or user credentials
       const loginInput = formData.login.toLowerCase();

        // Initialize a variable to hold the token to use
       let tokenToUse;
       
       // Check if the login matches admin credentials
       if (
         loginInput === decodedAdmin.username.toLowerCase() ||
         loginInput === decodedAdmin.email.toLowerCase()
       ) {
         tokenToUse = Mock.mockAdminToken;
       }
       // Check if the login matches user credentials
       else if (
         loginInput === decodedUser.username.toLowerCase() ||
         loginInput === decodedUser.email.toLowerCase()
       ) {
         tokenToUse = Mock.mockUserToken;
       }
       
       // If no match is found, means unregistered user
       else {
         alert("User not found. Please check your login credentials or register.");
         return;
       }
 
       // Save the selected token to local storage
       window.localStorage.setItem(_USERTOKEN, tokenToUse);
 
       // Decode token to verify the user's details
       const userData = decodeUser(tokenToUse);
 
       // Redirect based on the user's role from the token
       if (userData.role && userData.role.toUpperCase() === "ADMIN") {
         window.location.href = "./admin.html";
       } else {
         window.location.href = "./index.html";
       }
     }
     return;                                                                          // Else return false

    } catch (error) {
        console.log("Exception error gotten is: ", error.message);
        return;
    }
    
}

// Function to logout
function logout(){
    window.localStorage.removeItem(_USERTOKEN);                                             // Store the string in localStorage with the key 'token'
    window.location.href = "./index.html";                                          // Redirect the user to homepage
}
