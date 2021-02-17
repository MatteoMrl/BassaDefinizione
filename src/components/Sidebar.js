import React, { useEffect } from "react"

const Sidebar = ({ genres, currentGenre, setCurrentGenre, setIsRendered }) => {
  return (
    <aside>
      <div id="genresLegend">
        <h1>GENRES</h1>
      </div>
      <ul>
        {genres
          .filter((genre) => genre.name !== currentGenre)
          .map((genre) => {
            return (
              <li
                key={genre.id}
                onClick={(e) => {
                  setCurrentGenre(e.target.innerText)
                  setIsRendered(false)
                }}
              >
                <span>
                  <span>
                    <span>{genre.name}</span>
                  </span>
                </span>
              </li>
            )
          })}
      </ul>
    </aside>
  )
}

export default Sidebar
