import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"
import Home from "./Home.js"
import Footer from "./components/Footer.js"
import SearchedFilm from "./components/SearchedFilm.js"
import Navbar from "./components/Navbar.js"

const App = () => {
  const [token, setToken] = useState("")

  return (
    <React.Fragment>
      <Router>
        <Navbar token={token} setToken={setToken} />
        <Switch>
          <Route exact path="/film/:title" component={SearchedFilm} />
          <Route path="/">
            <Home />
            <Footer />
          </Route>
        </Switch>
      </Router>
    </React.Fragment>
  )
}

export default App
