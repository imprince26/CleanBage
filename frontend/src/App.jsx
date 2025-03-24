import React from "react";
import "./styles/input.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
      </Routes>
    </Router>
  );
};

export default App;
