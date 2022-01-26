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

export default function App() {

    const [ status, setStatus ] = useState(null)

    client.onHeartBeatFailedOnce = () => {
        setStatus( { time: 3, text: "Lost Connection." } )
    }

    client.onHeartBeatResumed = () => {
        setStatus( { time: 3, text: "Regained Connection." } )
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
                    <Route path="*" element={ <FourZeroFour /> } />
                </Routes>
                <NavBar>
                    <Link to="/b/root"> <NavBarItem type="browse" text="browse" />      </Link>
                    <Link to="/search"> <NavBarItem type="search" text="search" />      </Link>
                    <Link to="/downloads"> <NavBarItem type="download" text="downloads" /> </Link>
                    <Link to="/settings"> <NavBarItem type="settings" text="settings" />  </Link>
                </NavBar>
            </Router>
        </div>
    )
}