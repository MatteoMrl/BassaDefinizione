import fetch from "node-fetch"
import React, { useState, useEffect, useRef } from "react"
import "../css/index.css"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory
} from "react-router-dom"

const Navbar = ({ token, setToken }) => {
  const getCookie = (cname) => {
    const name = cname + "="
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return ""
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
          const { username } = data
          if (username) {
            userButton.current.href = `/user/${username}`
            userButton.current.innerHTML = `<i class="fa fa-user"></i> ${username}`
          }
        })
        .catch(function (err) {
          console.log("Something went wrong!", err)
        })
    } else {
      userButton.current.href = "/login"
      userButton.current.innerHTML = `<i class="fa fa-user"></i> GET STARTED`
      userButton.current.style["border-radius"] = "10px"
      logoutButton.current.style.display = "none"
    }
  }

  const [input, setInput] = useState("")
  const [results, setResults] = useState([])
  let history = useHistory()

  useEffect(() => {
    setToken(getCookie("jwt"))
    checkAccess()
  }, [])

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
    }, 500)
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
          if (input) {
            history.push(`/film/${input}`)
            setInput("")
            setResults([])
            window.location.reload()
            return false
          }
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
        <a href="/logout" id="logoutButton" ref={logoutButton}>
          <i className="fas fa-sign-out-alt"></i> LOGOUT
        </a>
      </div>
    </header>
  )
}

export default Navbar
