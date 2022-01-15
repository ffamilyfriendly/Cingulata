import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import FourZeroFour from "./pages/404";

function Test() {
  return (
    <div>
      <h1>gaming</h1>
      <p>gaming is fun</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Test />} />
        <Route path="*" element={<FourZeroFour />} />
      </Routes>
    </Router>
  );
}
