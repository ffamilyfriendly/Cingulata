import React, { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./App.css"
import { OkapiClient } from "./lib/client.js"
import StatusBar from "./components/status/status"
import NavBar from "./components/navbar/NavBar"
import NavBarItem from "./components/navbar/NavBarItem"
import { Link } from "react-router-dom"

/* PAGES */
import FourZeroFour from "./pages/404"
import Login from "./pages/login"
import Register from "./pages/register"
import Browse from "./pages/browse"
import Settings from "./pages/settings"

const client = new OkapiClient(`${window.location.protocol}//${window.location.hostname}:3000`)

export { client };

function InfoScreen() {
    if(!window.settings.toggled("Info Screen")) window.location.href = "/b/root"
    return(
        <div className="center">
            <div>
                <h1>Welcome to Armadillo!</h1>
                
                <br />
                <h3>General Information</h3>
                <ul>
                    <li><b>This client:</b> <a className="text-primary" href="https://github.com/ffamilyfriendly/Cingulata/">Repo</a></li>
                    <li><b>Server:</b> <a className="text-primary" href="https://github.com/ffamilyfriendly/Okapi/">Repo</a></li>
                    <li><b>Donate:</b> <a className="text-primary" href="https://ko-fi.com/ffamilyfriendly">ko-fi</a></li>
                </ul>
                <small>to turn this screen of, disable "Info Screen" in settings</small>
            </div>
        </div>
    )
}

export default function App() {

    const [ status, setStatus ] = useState(null)
    const [ internet, setInternet ] = useState(true)

    client.onHeartBeatFailedOnce = () => {
        setStatus( { time: 3, text: "Lost Connection." } )
        setInternet(false)
    }

    client.onHeartBeatResumed = () => {
        setStatus( { time: 3, text: "Regained Connection." } )
        setInternet(true)
    }

    return (
        <div>
            { status ? <StatusBar setStatus={setStatus} time={status.time} type={status.type} text={status.text} /> : null }
            <Router>
                <Routes>
                    <Route path="/login" element={<Login setStatus={setStatus} />} />
                    <Route path="/register" element={<Register setStatus={setStatus} />} />
                    <Route path="/b/:id" element={<Browse setStatus={setStatus} />} />
                    <Route path="/settings" element={<Settings setStatus={setStatus} />} />
                    <Route path="/" element={ <InfoScreen /> } />
                    <Route path="*" element={ <FourZeroFour /> } />
                </Routes>
                <NavBar>
                    <Link to={ internet ? "/b/root" : "#noInternet" }> <NavBarItem disabled={!internet} type="browse" text="browse" />      </Link>
                    <Link to={ internet ? "/search" : "#noInternet" }> <NavBarItem disabled={!internet} type="search" text="search" />      </Link>
                    <Link to="/downloads"> <NavBarItem type="download" text="downloads" /> </Link>
                    <Link to="/settings"> <NavBarItem type="settings" text="settings" />  </Link>
                </NavBar>
            </Router>
        </div>
    )
}