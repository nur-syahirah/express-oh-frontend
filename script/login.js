function isEmailOrUsername(value) {
  const emailRegex = isEmail(value);
  const usernameRegex = isUsername(value)
  return emailRegex || usernameRegex;
}

// split emailRegex and usernameRegex (where they might be used separately)


document.addEventListener("DOMContentLoaded", () => {
const loginForm = document.querySelector("#login-page form");
if (!loginForm) {
  console.error("Login form not found.");
  return;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

    // Retrieve login and password fields
    const loginInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    if (!loginInput || !passwordInput) {
      alert("Login or password field is missing.");
      return;
    }

    const loginValue = loginInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    
    // Validate login and password fields
    // Check if both fields are filled
    if (loginValue === "" || passwordValue === "") {
      alert("Please fill in both login (email or username) and password fields.");
      return;
    }

    if (!isEmailOrUsername(loginValue)) {
      alert("Please enter a valid email address or username.");
      return;
    }

    const formData = {
      email: loginValue,
      password: passwordValue
    };

    await login(formData);
  });
});