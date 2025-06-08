class Mock{

    constructor(){
        // TODO: WIP
    }
    
    // Static variables
    /* ************** */
    
    // !! Mock response 200 SUCCESS (akin to response.status === 200)
    static successResponse = {                                  
        ok: true,                                               // Indicates the response was successful
        status: 200,                                            // HTTP status code for Not Found
        statusText: 'OK',                                       // Corresponding status text
        json: async () => ({ message: 'Success!' }),            // Mocked JSON response
        text: async () => 'Success!',                           // Mocked plain text response
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    };

    // !! Mock response 404 NOT_FOUND (akin to response.status === 400)
    static notFoundResponse = {                                 
        ok: false,                                              // Indicates the response was NOT successful
        status: 404,                                            // HTTP status code for Not Found
        statusText: 'NOT_FOUND',                                // Corresponding status text
        json: async () => ({ error: 'Resource not found' }),    // Mocked JSON response
        text: async () => 'Resource not found',                 // Mocked plain text response
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    };

    // !! Mock response 403 FORBIDDEN (akin to response.status === 403)
    static forbiddenResponse = {                                 
        ok: false,                                              // Indicates the response was forbidden
        status: 403,                                            // HTTP status code for Forbidden
        statusText: 'FORBIDDEN',                                // Corresponding status text
        json: async () => ({ error: 'Forbidden' }),             // Mocked JSON response
        text: async () => 'Forbidden',                          // Mocked plain text response
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    };

    // !! Mock token containing the username (username: momorunner) email (email: martin@example.com), role (role: ADMIN) and Unix Timestamps: issued at (iat: 6st Sept 2024) and expiry (exp: 6st Sept 2025)
    static mockUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NDg4MTI3NzksImV4cCI6MTc4MDM0ODc3OX0.nAsCPO7siSTakY6oBlN77kN7CJ8Jyrf87pPXqVB1dLI";
    static mockAdminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhaGFyYSIsImVtYWlsIjoiaXJhaEBnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NDg4MTI3NzksImV4cCI6MTc4MDM0ODc3OX0.jY2Lu6irUCZDF5V4UNVn-Xw1mhicL0s3afJqxPsPTz8";

    
    // Static methods
    /* ************** */

    static getMockSuccess(){                                    // Returns mock OK status
        return this.successResponse;
    }

    static getMockNotFound(){                                   // Returns mock NOT_FOUND status
        return this.successResponse;
    }

    static getMockForbidden(){                                  // Returns mock FORBIDDEN status
        return this.forbiddenResponse;
    }

    static getToken(status = false){                            // Returns mock NOT_FOUND status
        return status ? this.mockToken : status;
    }
    static getToken(isAdmin = false) {                             // Returns a mock token based on the user's role

        return isAdmin ? this.mockAdminToken : this.mockUserToken; // If isAdmin is true, return the admin token; otherwise, return the user token
    }

}