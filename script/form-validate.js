// Function to validate email using regex 
function isEmail(value){
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
}

function isUsername(value){
    const usernameRegex = /^(?=.{3,20}$)[a-zA-Z0-9_]+$/;
    return usernameRegex.test(value);
}

// Function to validate empty values
function isEmpty(value){
    var regex = new RegExp(/^(?=\s*$)/g);
    return (!value || regex.test(value));
}

// Function only allows specific characters (as described in the regex)
function isValidMsg(value){
    const msgRegex = /^[a-zA-Z0-9\s.,!?'"-]*$/;     // reject special characters that may allow code injections scripts / sql injections
    return msgRegex.test(value);
}