'use strict'
const usernameInput = document.querySelector('#username')
const usernameHelp = document.querySelector('#usernameHelp')
const mailInput = document.querySelector('#mail')
const mailHelp = document.querySelector('#emailHelp')
const passwordInput = document.querySelector('#password')
const passwordHelp = document.querySelector('#passwordHelp')
const button = document.querySelector('button')
const html = document.querySelector('html')
const logo = document.querySelector('#imgLogo')
let validUsername = false
let validMail = false
let validPassword = false
let changeColor = false
button.disabled = true

if (localStorage.getItem('mode')) {
  if (localStorage.getItem('mode') === 'light') {
    html.setAttribute('data-theme', 'light')
    logo.setAttribute('src', '/img/lgLogo.jpg')
  } else {
    html.setAttribute('data-theme', 'dark')
    logo.setAttribute('src', '/img/dkLogo.jpg')
  }
} else {
  localStorage.setItem('mode', 'dark')
}

function checkUsername() {
  const regex = /^(?=.{3,14}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
  if (usernameInput.value.match(regex)) {
    validUsername = true
    usernameHelp.style.color = 'green'
    usernameInput.classList.remove('invalid')
    usernameInput.classList.add('valid')
  } else {
    validUsername = false
    usernameHelp.style.color = 'red'
    usernameInput.classList.remove('valid')
    usernameInput.classList.add('invalid')
  }
}

function checkMail() {
  const regex = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/
  if (mailInput.value.match(regex)) {
    mailHelp.innerHTML = '<i class="fas fa-info"></i> Valid email'
    mailHelp.style.color = 'green'
    validMail = true
    mailInput.classList.remove('invalid')
    mailInput.classList.add('valid')
  } else {
    mailHelp.innerHTML = '<i class="fas fa-info"></i> Invalid email'
    mailHelp.style.color = 'red'
    validMail = false
    mailInput.classList.remove('valid')
    mailInput.classList.add('invalid')
  }
}

function checkPassword() {
  const regex = /^[A-Za-z]\w{5,13}$/
  if (passwordInput.value.match(regex)) {
    passwordHelp.style.color = 'green'
    validPassword = true
    passwordInput.classList.remove('invalid')
    passwordInput.classList.add('valid')
  } else {
    passwordHelp.style.color = 'red'
    validPassword = false
    passwordInput.classList.remove('valid')
    passwordInput.classList.add('invalid')
  }
}

function validButton() {
  if (validUsername === true && validMail === true && validPassword === true) {
    button.disabled = false
    button.style.backgroundColor = 'white'
  } else {
    button.disabled = true
    button.style.backgroundColor = 'red'
  }
}

usernameInput.addEventListener('keydown', () => {
  checkUsername()
  validButton()
})
usernameInput.addEventListener('change', () => {
  checkUsername()
  validButton()
})

mailInput.addEventListener('keydown', () => {
  checkMail()
  validButton()
})
mailInput.addEventListener('change', () => {
  checkMail()
  validButton()
})

passwordInput.addEventListener('keydown', () => {
  checkPassword()
  validButton()
})
passwordInput.addEventListener('change', () => {
  checkPassword(passwordInput.value)
  validButton()
})

button.addEventListener('mouseover', () => {
  button.style.backgroundColor = 'green'
})
button.addEventListener('mouseout', () => {
  button.style.backgroundColor = 'white'
})
