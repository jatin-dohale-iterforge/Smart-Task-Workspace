const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

function showToast(message, type = "success") {
    try {
        const toast = document.querySelector("#toast");
        if (!toast) return;
        toast.innerHTML = message;
        toast.className = `toast ${type}`;
        // Trigger toast animation
        setTimeout(() => {
            toast.classList.add("show");
        }, 10);
        // Hide toast after few seconds
        setTimeout(() => {
            toast.classList.remove("show");
        }, 5000);

    } 
    catch (e) {
        console.log("Toast error:", e);
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate email on focus out
function validateEmailInput() {
    try {
        const error = emailInput.parentElement.querySelector(".error");
        if (emailInput.value.trim() === "") {
            error.textContent = "Email is required";
            return false;
        }
        if (!validateEmail(emailInput.value.trim())) {
            error.textContent = "Enter a valid email";
            return false;
        }
        error.textContent = "";
        return true;

    } 
    catch (e) {
        console.log("Email validation error:", e);
        return false;
    }
}


// Validate password on focus out
function validatePasswordInput() {
    try {
        const error = passwordInput.parentElement.querySelector(".error");
        if (passwordInput.value.trim() === "") {
            error.textContent = "Password is required";
            return false;
        }
        error.textContent = "";
        return true;
    } catch (e) {

        console.log("Password validation error:", e);
        return false;

    }
}

function clearEmailError() {
    try {
        const error = emailInput.parentElement.querySelector(".error");
        error.textContent = "";
    }
    catch (e) {
        console.log("Email clear error:", e);
    }
}


function clearPasswordError() {
    try {
        const error = passwordInput.parentElement.querySelector(".error");
        error.textContent = "";
    }
    catch (e) {
        console.log("Password clear error:", e);
    }
}

function login(e) {
    e.preventDefault();
    try {
        const emailValid = validateEmailInput();
        const passwordValid = validatePasswordInput();
        if (!(emailValid && passwordValid)) {
            return;
        }
        // Send login request
        fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailInput.value.trim(),
                password: passwordInput.value
            })
        })
        .then(response => {
            return response.json().then(data => ({
                status: response.status,
                data: data
            }));
        })
        .then(result => {
            const data = result.data;
            if (result.status !== 200 || !data.token) {
                passwordInput.parentElement.querySelector(".error").textContent = "Invalid email or password";
                return;
            }
            localStorage.setItem("token",data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            showToast("Login successful!");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        })
        .catch(error => {
            console.log("Login error:", error);
            showToast("Unable to connect server!", "error");
        });
    } catch (e) {
        console.log("Login error:", e);
        showToast("Something went wrong!", "error");
    }
}