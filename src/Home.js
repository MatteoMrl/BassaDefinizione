import React, { useState, useEffect, useRef } from "react"
import Sidebar from "./components/Sidebar.js"
import Catalog from "./components/Catalog.js"
import Navbar from "./components/Navbar.js"
import Footer from "./components/Footer.js"
import "./css/index.css"

const Home = ({ token, setToken }) => {
  const [currentGenre, setCurrentGenre] = useState("Action")
  const genres = useRef([])
  const [isRendered, setIsRendered] = useState()
  const films = useRef([])

  useEffect(() => {
    fetch("/genres")
      .then((response) => response.json())
      .then((data) => {
        genres.current = data
        setCurrentGenre(data[0].name)
      })
  }, [])

  useEffect(() => {
    fetch(`/films?s=${currentGenre}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .then((response) => response.json())
      .then((data) => {
        films.current = data.listOfFilms
        setIsRendered(true)
      })
  }, [currentGenre])

  return (
    <React.Fragment>
      <Navbar token={token} setToken={setToken} />
      <main className="main-homepage">
        <Sidebar
          genres={genres.current}
          currentGenre={currentGenre} // viene eliminato dalla lista il genere corrente
          setCurrentGenre={setCurrentGenre} // nel momento in cui un genere viene cliccato, diventa il corrente
          setIsRendered={setIsRendered} // con un nuovo genere è necessario un nuovo caricamento
        />
        <Catalog
          films={films.current}
          currentGenre={currentGenre} // per il titolo della section
          setCurrentGenre={setCurrentGenre} // con le mq il menù dei generi passa nel Catalog
          genres={genres.current}
          setIsRendered={setIsRendered} // con un nuovo genere è necessario un nuovo caricamento
          isRendered={isRendered} // effetto loading
        />
      </main>
      <Footer />
    </React.Fragment>
  )
}

export default Home
