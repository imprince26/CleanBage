import React from "react";
import { Routes, Route } from "react-router-dom";
import Register from "@/pages/auth/Register";
import Login from "@/pages/auth/Login";
import Home from "@/pages/Home";
import ReportBin from "@/pages/resident/ReportBin";
import Dashboard from "@/pages/resident/Dashboard";

const routes = [
  { path: "/", element: <Home /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  {path: "/resident/report", element: <ReportBin />},
  {path: "/resident", element: <Dashboard />}
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
