/* eslint-disable no-unused-vars */
import { motion } from "motion/react";
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md";
import { Link } from "react-scroll";

const Navbar = ({ darkMode, setDarkMode }) => {
  return (
    <motion.nav
      className={`flex justify-around items-center py-3 px-6 shadow-md ${
        darkMode ? "bg-[#065F46] text-[#D1FAE5]" : "bg-[#D1FAE5] text-[#1E3A24]"
      } sticky top-0 z-10`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-xl font-bold">CleanBage</h1>
      </div>
      <div className="flex gap-8">
        <div className="flex gap-4">
          <Link to="home" smooth={true} duration={500} offset={-50}> Home</Link>
          <Link to="services" smooth={true} duration={500} offset={-50}> Services</Link>
          <Link to="about" smooth={true} duration={500} offset={-50}> About</Link>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="font-semibold text-sm"
        >
          {darkMode ? (
            <MdOutlineLightMode className="text-lg" />
          ) : (
            <MdDarkMode className="text-lg" />
          )}
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
