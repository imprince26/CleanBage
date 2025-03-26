/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { FaRegUser, FaTruck,FaAward } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { IoIosHeart } from "react-icons/io";
import { MdCleaningServices } from "react-icons/md";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form reload
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      console.log(response.data);
      setMessage("Login successful!");
    } catch (error) {
      console.error(error);
      setMessage("Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full h-screen flex bg-[#F0FDF4] relative overflow-hidden ">
      <MdCleaningServices className="absolute text-6xl right-0 fill-[#66BB6A] top-0 -rotate-12 -translate-x-2" />
      <FaTruck className="absolute text-6xl left-0 fill-[#66BB6A] top-0 rotate-12" />
      <IoIosHeart className="absolute text-6xl left-0 fill-[#66BB6A] bottom-0 rotate-12" />
      <FaAward className="absolute text-6xl right-0 fill-[#66BB6A] bottom-0 -rotate-12 -translate-x-2" />

      {/* INPUTS */}
      <div className="form w-1/2 h-full py-20 px-5 flex justify-center items-center text-black flex-col relative overflow-hidden z-[999]">
        <h1 className="text-5xl font-[heavitas] uppercase mb-20">Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col">
          {/* USERNAME INPUT */}
          <div className="username flex border-[1px] justify-center items-center py-2 mb-5">
            <FaRegUser className="ml-5" />
            <input
              type="text"
              placeholder="Enter Username"
              className="outline-none bg-transparent px-5 border-zinc-300 rounded-sm w-72 "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD INPUT */}
          <div className="password username flex border-[1px] justify-center items-center py-2 mb-5">
            <RiLockPasswordLine className="ml-5" />
            <input
              type="password"
              placeholder="Enter Password"
              className="outline-none bg-transparent px-5 border-zinc-300 rounded-sm w-72"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <a href="/" className="text-gray-400 text-sm underline hover:text-blue-400">
          Forgot password?
        </a>

          {/* SUBMIT BUTTON */}
          <input
            type="submit"
            value={loading ? "Logging in..." : "Login"}
            disabled={loading}
            className="bg-[#66BB6A] hover:bg-[#2E7D32]  text-zinc-900 cursor-pointer mt-2 px-10 py-2 w-[20.3rem]"
          />
        </form>

       

        {message && <span className="mt-5 text-red-500">{message}</span>}

       <p className="text-sm mt-2">Dont have an account?  <Link to="/register" className="text-green-900 underline">Register</Link></p>
      </div>



      {/* MIDDLE LINE */}
      <div className="bg-green-900 h-[30rem] w-1 absolute hidden md:block  translate-y-[25%] translate-x-[800px]" />

      {/* IMAGE SECTION */}
      <motion.div
        className="img w-1/2 h-full overflow-hidden z-[999] flex justify-center items-center"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img
          src="src/assets/images/cleanerImg.webp"
          alt="brand"
          className="bg-no-repeat"
        />
      </motion.div>

    </div>
  );
}

export default Login;
