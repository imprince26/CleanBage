import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "@/components/Loader";
import PageWrapper from "@/components/PageWrapper";

// Lazy load components
const Home = lazy(() => import("@/pages/Home"));
const Register = lazy(() => import("@/pages/auth/Register"));
const Login = lazy(() => import("@/pages/auth/Login"));
const ReportBin = lazy(() => import("@/pages/resident/ReportBin"));
const Dashboard = lazy(() => import("@/pages/resident/Dashboard"));

const routes = [
  { path: "/", element: <Home /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "/resident/report", element: <ReportBin /> },
  { path: "/resident", element: <Dashboard /> }
];

const App = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <PageWrapper>
                {route.element}
              </PageWrapper>
            }
          />
        ))}
      </Routes>
    </Suspense>
  );
};

export default App;