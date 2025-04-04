import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "@/components/Loader";
import PageWrapper from "@/components/PageWrapper";
import Layout from "./components/Layout";

// Lazy load components
const Home = lazy(() => import("@/pages/Home"));
const Register = lazy(() => import("@/pages/auth/Register"));
const Login = lazy(() => import("@/pages/auth/Login"));
const ReportBin = lazy(() => import("@/pages/resident/ReportBin"));
const Dashboard = lazy(() => import("@/pages/resident/Dashboard"));
const Rewards = lazy(() => import("@/pages/resident/Rewards"));
const Schedule = lazy(() => import("@/pages/resident/Schedule"));


const routes = [
  { path: "/", element: <Home /> },
  { path: "/resident/report", element: <ReportBin /> },
  { path: "/resident", element: <Dashboard /> },
  { path: "/resident/rewards", element: <Rewards /> },
  { path: "/resident/schedule", element: <Schedule /> },
];

const App = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} element={<Layout />}>

          <Route
            key={index}
            path={route.path}
            element={
              <PageWrapper>
                {route.element}
              </PageWrapper>
            }
            />
            </Route>
        ))}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </Suspense>
  );
};

export default App;