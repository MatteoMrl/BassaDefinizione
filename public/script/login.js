"use strict"
const usernameInput = document.querySelector("#username")
const passwordInput = document.querySelector("#password")
const button = document.querySelector("button")
const html = document.querySelector("html")
const logo = document.querySelector("#imgLogo")
let validUsername = false
let validPassword = false
button.disabled = true

function checkUsername() {
  const regex = /^(?=.{3,14}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
  if (usernameInput.value.match(regex)) {
    validUsername = true
    usernameInput.classList.remove("invalid")
    usernameInput.classList.add("valid")
  } else {
    validUsername = false
    usernameInput.classList.remove("valid")
    usernameInput.classList.add("invalid")
  }
}

function checkPassword() {
  const regex = /^[A-Za-z]\w{5,13}$/
  if (passwordInput.value.match(regex)) {
    validPassword = true
    passwordInput.classList.remove("invalid")
    passwordInput.classList.add("valid")
  } else {
    validPassword = false
    passwordInput.classList.remove("valid")
    passwordInput.classList.add("invalid")
  }
}

function validButton() {
  if (validUsername === true && validPassword === true) {
    button.disabled = false
    button.style.backgroundColor = "white"
  } else {
    button.disabled = true
    button.style.backgroundColor = "red"
  }
}

usernameInput.addEventListener("keydown", () => {
  checkUsername()
  validButton()
})
usernameInput.addEventListener("change", () => {
  checkUsername()
  validButton()
})

passwordInput.addEventListener("keydown", () => {
  checkPassword()
  validButton()
})
passwordInput.addEventListener("change", () => {
  checkPassword(passwordInput.value)
  validButton()
})

button.addEventListener("mouseover", () => {
  button.style.backgroundColor = "green"
})
button.addEventListener("mouseout", () => {
  button.style.backgroundColor = "white"
})
button.addEventListener("click", () => {
  const loginUser = async ({ username, password }, res) => {
    try {
      const users = await dbQuery(
        `SELECT * FROM users WHERE username = '${username}'`
      )
      userData = users[0]
      if (!userData || !(await bcrypt.compare(password, userData.password))) {
        res.render("login", { message: "Incorrect username or password" })
      } else {
        createToken(userData.id, res)
      }
    } catch (err) {
      console.log(err)
      res.render("login", {
        message: "An error has occurred. Please try again"
      })
    }
  // }
})
