'use script'
const userButton = document.querySelector('#userButton')
const logoutButton = document.querySelector('#logoutButton')

function getCookie(cname) {
  const name = cname + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

const token = getCookie('jwt')

if (token !== '') {
  console.log(token)
  fetch('/token', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Bearer ' + token
    },
    method: 'POST'
  })
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      const { username } = data
      if (username) {
        userButton.href = `/user/${username}`
        userButton.innerHTML = `<i class="fa fa-user"></i> ${username}`
      }
    })
    .catch(function (err) {
      console.log('Something went wrong!', err)
    })
} else {
  userButton.href = '/login'
  userButton.innerHTML = `<i class="fa fa-user"></i> GET STARTED`
  userButton.style['border-radius'] = '10px'
  logoutButton.style.display = 'none'
}

logoutButton.addEventListener('click', () => {
  document.cookie = 'jwt=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
})
