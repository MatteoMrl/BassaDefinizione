import React, { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar.js"
import Catalog from "./components/Catalog.js"

const Home = () => {
  const [currentGenre, setCurrentGenre] = useState("Action")

  const [allGenres, setAllGenres] = useState([])
  const [isRendered, setIsRendered] = useState()
  const [films, setFilms] = useState([])

  useEffect(() => {
    fetch("/genres")
      .then((response) => response.json())
      .then((data) => {
        setAllGenres(data)
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
        setFilms(data.listOfFilms)
        setIsRendered(true)
      })
  }, [currentGenre])

  return (
    <main>
      <Sidebar
        genres={allGenres}
        currentGenre={currentGenre}
        setCurrentGenre={setCurrentGenre}
        setIsRendered={setIsRendered}
      />
      <Catalog
        films={films}
        currentGenre={currentGenre}
        setCurrentGenre={setCurrentGenre}
        genres={allGenres}
        setIsRendered={setIsRendered}
        isRendered={isRendered}
      />
    </main>
  )
}

export default Home
