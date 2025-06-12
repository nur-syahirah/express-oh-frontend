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
    const email = decodedToken.sub;
    const roles = decodedToken.roles;
    return {email: email, roles: roles};

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

        // FETCH requests - send data or retrive data by calling an API endpoint 
        const response = await fetch(_ENDPOINT_LOGIN, {                                     // Perform an async POST request to process the form data
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(formData)
        });

        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));      // TODO: remove delay when endpoint is instated
        await sleep(2000);
        
        if(response.ok){                                                                    // If response is ok
          const result = await response.json();
          const token = result.token;                                                   
          const user = decodeUser(token);                                                   // decode the token for the role 
          
          window.localStorage.setItem(_USERTOKEN, token);                                   // Store the string in localStorage with the key 'usertoken'
          
          const adminStatus = user.roles.some(role => role.authority === 'ADMIN');          // !! Find "ADMIN" authority from token's roles
          
          if(adminStatus)                                                                   // !! This example only look for "ADMIN" authority
              window.location = _ADMIN_URL;                                                 // Redirect the user to adminpage
          else                                                                              // !! Other authority will be deemed as "CUSTOMER"
              window.location = _HOME_URL;                                                  // Redirect the user to homepage
     }
     return;                                                                                // Else return false

    } catch (error) {
        console.log("Exception error gotten is: ", error.message);
        return;
    }
    
}

// Function to logout
function logout(){
    window.localStorage.removeItem(_USERTOKEN);                                             // Store the string in localStorage with the key 'token'
    window.location.href = _LOGIN_URL;                                                      // Redirect the user to homepage
}

// Function to register
async function register(formData = {}){

  if(Object.entries(formData).length == 0)
      return;

  /* We are are sending 
      - email
      - password
      - role (it must be passed only by our web site)
      - Spring Boot help us take care of CSRF Cross-site Referece Forgery
  */

  try {
      
      const response = await fetch(_ENDPOINT_REGISTER, {
          method: "POST", 
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(formData)
      })

      const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));      // TODO: remove delay when endpoint is instated
      await sleep(2000);

      if(response.ok){
        return true;
      }

      return;

  } catch (error) {
      console.log("Exception error gotten is:", error.message);
      return;
  }

}
