import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./App.css"
import FourZeroFour from "./pages/404"
import Login from "./pages/login"
import Register from "./pages/register"
import Browse from "./pages/browse"
import { OkapiClient } from "./lib/client.js"

const client = new OkapiClient("http://localhost:3000")

export { client };

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Browse />} />
                <Route path="*" element={ <FourZeroFour /> } />
            </Routes>
        </Router>
    )
}