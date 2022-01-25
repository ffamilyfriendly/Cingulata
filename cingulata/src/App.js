import React, { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./App.css"
import FourZeroFour from "./pages/404"
import Login from "./pages/login"
import Register from "./pages/register"
import Browse from "./pages/browse"
import { OkapiClient } from "./lib/client.js"
import StatusBar from "./components/status/status"

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
                    <Route path="*" element={ <FourZeroFour /> } />
                </Routes>
            </Router>
        </div>
    )
}