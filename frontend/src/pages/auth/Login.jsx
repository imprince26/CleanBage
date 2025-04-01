import React, { useState } from "react";
import { FaRegUser, FaTruck, FaAward } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { IoIosHeart } from "react-icons/io";
import { MdCleaningServices } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#F0FDF4] relative overflow-hidden">
      {/* Decorative Icons */}
      <MdCleaningServices className="absolute text-4xl md:text-6xl right-0 fill-[#66BB6A] top-0 -rotate-12 -translate-x-2" />
      <FaTruck className="absolute text-4xl md:text-6xl left-0 fill-[#66BB6A] top-0 rotate-12" />
      <IoIosHeart className="absolute text-4xl md:text-6xl left-0 fill-[#66BB6A] bottom-0 rotate-12" />
      <FaAward className="absolute text-4xl md:text-6xl right-0 fill-[#66BB6A] bottom-0 -rotate-12 -translate-x-2" />

      {/* Form Section */}
      <div className="w-full md:w-1/2 min-h-[50vh] md:h-full py-10 md:py-20 px-5 flex justify-center items-center text-black flex-col relative z-[999]">
        <h1 className="text-3xl md:text-5xl font-[heavitas] uppercase mb-10 md:mb-20">Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col w-full max-w-sm">
          {/* Email Input */}
          <div className="username flex border-[1px] justify-center items-center py-2 mb-5">
            <FaRegUser className="ml-3 md:ml-5" />
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              className="outline-none bg-transparent px-3 md:px-5 border-zinc-300 rounded-sm w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Input */}
          <div className="password flex border-[1px] justify-center items-center py-2 mb-5 relative">
            <RiLockPasswordLine className="ml-3 md:ml-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
              className="outline-none bg-transparent px-3 md:px-5 border-zinc-300 rounded-sm w-full pr-10"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 text-gray-500"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>

          <Link 
            to="/forgot-password" 
            className="text-gray-400 text-sm underline hover:text-blue-400 mb-4"
          >
            Forgot password?
          </Link>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#66BB6A] hover:bg-[#2E7D32] text-zinc-900 cursor-pointer px-10 py-2 w-full disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && (
          <span className="mt-5 text-red-500 text-sm">{error}</span>
        )}

        <p className="text-sm mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-green-900 underline">
            Register
          </Link>
        </p>
      </div>

      {/* Middle Line - Hidden on mobile */}
      <div className="bg-green-900 h-[30rem] w-1 absolute hidden md:block translate-y-[25%] translate-x-[50vw]" />

      {/* Image Section */}
      <motion.div
        className="w-full md:w-1/2 min-h-[50vh] md:h-full overflow-hidden z-[999] flex justify-center items-center"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img
          src="/cleanerImg.webp"
          alt="CleanBage"
          className="w-full h-full object-cover md:object-contain"
        />
      </motion.div>
    </div>
  );
}

export default Login;