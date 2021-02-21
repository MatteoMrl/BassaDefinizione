import fetch from "node-fetch"
import React, { useState, useEffect, useRef } from "react"
import "../css/index.css"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useParams
} from "react-router-dom"

const Navbar = ({ token, setToken }) => {
  const tokenIsValid = (username) => {
    userButton.current.href = `/user/${username}`
    userButton.current.innerHTML = `<i class="fa fa-user"></i> ${username}`
    userButton.current.style["border-radius"] = "10px 0 0 10px"
    logoutButton.current.style.display = "inline"
  }

  const tokenNotValid = () => {
    userButton.current.href = "/login"
    userButton.current.innerHTML = `<i class="fa fa-user"></i> GET STARTED`
    userButton.current.style["border-radius"] = "10px"
    logoutButton.current.style.display = "none"
  }

  const checkAccess = () => {
    if (token !== "") {
      fetch("/token", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + token
        },
        method: "POST"
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          const { username, auth } = data
          auth ? tokenIsValid(username) : tokenNotValid()
        })
        .catch(function (err) {
          tokenNotValid()
        })
    } else {
      tokenNotValid()
    }
  }

  const deleteToken = () => {
    document.cookie =
      "jwt=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setToken("")
  }

  const [input, setInput] = useState("")
  const [results, setResults] = useState([])

  useEffect(() => {
    checkAccess()
  })

  useEffect(() => {
    const timeoutSearch = setTimeout(() => {
      if (input) {
        fetch(`/search?s=${input}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.Response) {
              setResults(data.Search)
            } else {
              setResults([])
            }
          })
          .catch(() => {
            setResults([])
          })
      }
    }, 300)
    return () => {
      clearTimeout(timeoutSearch)
    }
  }, [input])

  const userButton = useRef()
  const logoutButton = useRef()

  return (
    <header>
      <a href="/">
        <img src="/img/dkLogo.jpg" alt="" id="logo" />
      </a>

      <form
        id="searchFilm"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <i className="fas fa-film"></i>
        <input
          className="input-field"
          spellCheck="false"
          autoComplete="off"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          id="inputFilm"
          name="title"
          placeholder="Search for a movie..."
        />
        <button id="searchButton">
          <i className="fa fa-search"></i>
        </button>
        <div id="suggestions">
          {input.length === 0 || results === undefined ? (
            <span></span>
          ) : (
            <Router>
              <ul>
                {results.map((film, index) => {
                  return (
                    <li key={index}>
                      <a href={`/film/${film.Title}`}>
                        <p>{film.Title}</p>{" "}
                        <i className="fas fa-arrow-right"></i>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </Router>
          )}
        </div>
      </form>

      <div id="userInteraction">
        <a href="/login" id="userButton" ref={userButton}>
          <i className="far fa-user"></i> GET STARTED
        </a>
        <button id="logoutButton" ref={logoutButton} onClick={deleteToken}>
          <i className="fas fa-sign-out-alt"></i> LOGOUT
        </button>
      </div>
    </header>
  )
}

export default Navbar
