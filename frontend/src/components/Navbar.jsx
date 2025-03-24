/* eslint-disable no-unused-vars */
import { motion } from "motion/react";

const Navbar = ({ darkMode, setDarkMode }) => {
  return (
    <motion.nav
    className={`flex justify-between items-center py-4 px-6 shadow-md ${
      darkMode ? "bg-[#065F46] text-[#D1FAE5]" : "bg-[#D1FAE5] text-[#1E3A24]"
    }`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h1 className="text-2xl font-bold">CleanBage</h1>
    <button onClick={() => setDarkMode(!darkMode)} className="font-semibold">
      {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  </motion.nav>
  );
};

export default Navbar;
