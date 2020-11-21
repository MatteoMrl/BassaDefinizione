const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const button = document.querySelector("button");
const html = document.querySelector("html");
const logo = document.querySelector("#imgLogo");
let validUsername = false;
let validPassword = false;
button.disabled = true;

if (localStorage.getItem("mode")) {
  if (localStorage.getItem("mode") === "light") {
    html.setAttribute("data-theme", "light");
    logo.setAttribute("src", "/img/lgLogo.jpg");
  } else {
    html.setAttribute("data-theme", "dark");
    logo.setAttribute("src", "/img/dkLogo.jpg");
  }
} else {
  localStorage.setItem("mode", "dark");
}

checkUsername = () => {
  const regex = /^(?=.{3,14}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
  if (usernameInput.value.match(regex)) {
    validUsername = true;
    usernameInput.classList.remove("invalid");
    usernameInput.classList.add("valid");
  } else {
    validUsername = false;
    usernameInput.classList.remove("valid");
    usernameInput.classList.add("invalid");
  }
};

checkPassword = () => {
  const regex = /^[A-Za-z]\w{5,13}$/;
  if (passwordInput.value.match(regex)) {
    validPassword = true;
    passwordInput.classList.remove("invalid");
    passwordInput.classList.add("valid");
  } else {
    validPassword = false;
    passwordInput.classList.remove("valid");
    passwordInput.classList.add("invalid");
  }
};

validButton = () => {
  if (validUsername === true && validPassword === true) {
    button.disabled = false;
    button.style.backgroundColor = "white";
  } else {
    button.disabled = true;
    button.style.backgroundColor = "red";
  }
};

usernameInput.addEventListener("keydown", () => {
  checkUsername();
  validButton();
});
usernameInput.addEventListener("change", () => {
  checkUsername();
  validButton();
});

passwordInput.addEventListener("keydown", () => {
  checkPassword();
  validButton();
});
passwordInput.addEventListener("change", () => {
  checkPassword(passwordInput.value);
  validButton();
});

button.addEventListener("mouseover", () => {
  button.style.backgroundColor = "green";
});
button.addEventListener("mouseout", () => {
  button.style.backgroundColor = "white";
});
button.addEventListener("click", async (e) => {
  fetch("/login", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + token,
    },
    method: "POST",
    body: `username=${usernameInput.value}&password=${passwordInput.value}`,
  });
});
