function isEmailOrUsername(value) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const usernameRegex = /^(?=.{3,20}$)[a-zA-Z0-9_]+$/;
  return emailRegex.test(value) || usernameRegex.test(value);
}
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
      login: loginValue,
      password: passwordValue
    };

    await login(formData);
  });
});