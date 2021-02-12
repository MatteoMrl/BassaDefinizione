'use strict'
const thumbsUp = document.querySelector('.fa-thumbs-up')
const thumbsDown = document.querySelector('.fa-thumbs-down')
const filmName = document.querySelector('#title').innerHTML
const vote = document.querySelector('#vote')
const serverResponse = document.querySelector('#serverResponse')

//cerca di mettere i due casi in una unica funzione

const sendVote = (rating) => {
  fetch(`/vote?film=${encodeURIComponent(filmName)}&vote=${rating}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Bearer ' + token
    },
    method: 'GET'
  })
    .then((response) => {
      return response.json()
    })
    .then(({ vote }) => {
      if (vote) {
        serverResponse.innerHTML = "<i class='far fa-check-circle'></i>"
      } else {
        serverResponse.innerHTML = "<i class='far fa-times-circle'></i>"
      }
      serverResponse.style.backgroundColor = 'green'
    })
}

thumbsUp.addEventListener('click', () => sendVote(1))

thumbsDown.addEventListener('click', () => sendVote(0))

if (token !== '') {
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
      if (data.username) {
        vote.style.display = 'block'
      } else {
        vote.style.display = 'none'
      }
    })
} else {
  vote.style.display = 'none'
}
