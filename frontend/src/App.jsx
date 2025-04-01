import React from "react";
// import "./styles/input.css";
import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import SignUp from "./components/SignUp";
import Login from "./components/Login";

const routes = [
  { path: "/", element: <Landing /> },
  { path: "/register", element: <SignUp /> },
  { path: "/login", element: <Login /> }
];

const App = () => {
  return (
      <Routes>

        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

      </Routes>
  );
};

export default App;
