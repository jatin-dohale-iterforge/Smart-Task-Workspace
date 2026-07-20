const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

function showToast(message, type = "success") {
    try {
        const toast = document.querySelector("#toast");
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast ${type}`;

        setTimeout(() => {
            toast.classList.add("show");
        }, 10);

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

// Name validation
function validateNameInput() {
    const error = nameInput.parentElement.querySelector(".error");
    if (nameInput.value.trim() === "") {
        error.textContent = "Name is required";
        return false;
    }
    error.textContent = "";
    return true;
}

// Email validation
function validateEmailInput() {
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

// Password validation
function validatePasswordInput() {
    const error = passwordInput.parentElement.querySelector(".error");
    if (passwordInput.value.trim() === "") {
        error.textContent = "Password is required";
        return false;
    }
    if (passwordInput.value.length < 6) {
        error.textContent = "Password must be at least 6 characters";
        return false;
    }
    error.textContent = "";
    return true;
}

function clearNameError() {
    nameInput.parentElement.querySelector(".error").textContent = "";
}

function clearEmailError() {
    emailInput.parentElement.querySelector(".error").textContent = "";
}

function clearPasswordError() {
    passwordInput.parentElement.querySelector(".error").textContent = "";
}

function signup(e) {
    e.preventDefault();
    try {
        const nameValid = validateNameInput();
        const emailValid = validateEmailInput();
        const passwordValid = validatePasswordInput();
        if (!(nameValid && emailValid && passwordValid)) {
            return;
        }
        fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nameInput.value.trim(),
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
            if (result.status !== 201) {
                emailInput.parentElement.querySelector(".error").textContent = result.data.message || "Email already exists";
                return;
            }
            showToast("Account created successfully!");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        })
        .catch(error => {
            console.log("Signup error:", error);
            showToast("Unable to connect server!", "error");
        });
    }
    catch (e) {
        console.log("Signup error:", e);
        showToast("Something went wrong!", "error");
    }
}