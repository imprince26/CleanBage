/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "motion/react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import Footer from "./Footer";

const Landing = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`${
        darkMode ? "bg-[#0A0F0D] text-[#D1FAE5]" : "bg-[#F0FDF4] text-[#1E3A24]"
      } min-h-screen`}
    >
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <HeroSection darkMode={darkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Landing;
