import React, { useState } from "react";
import { FaRegUser, FaTruck, FaAward, FaMapMarkerAlt } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { IoIosHeart } from "react-icons/io";
import { MdCleaningServices, MdOutlineEmail } from "react-icons/md";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "resident",
    address: "",
    assignedVehicle: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVehicle, setShowVehicle] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'role') {
      setShowVehicle(value === 'garbage_collector');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred during registration");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex bg-[#F0FDF4] relative overflow-hidden">
      {/* Decorative Icons */}
      <MdCleaningServices className="absolute text-6xl right-0 fill-[#66BB6A] top-0 -rotate-12 -translate-x-2" />
      <FaTruck className="absolute text-6xl left-0 fill-[#66BB6A] top-0 rotate-12" />
      <IoIosHeart className="absolute text-6xl left-0 fill-[#66BB6A] bottom-0 rotate-12" />
      <FaAward className="absolute text-6xl right-0 fill-[#66BB6A] bottom-0 -rotate-12 -translate-x-2" />

      {/* Form Section */}
      <div className="form w-1/2 h-full py-20 px-5 flex justify-center items-center text-black flex-col relative overflow-hidden z-[999]">
        <h1 className="text-5xl font-[Heavitas] uppercase mb-20">Register</h1>

        <form onSubmit={handleSignup} className="flex flex-col">
          {/* Name Input */}
          <div className="username flex border-[1px] justify-center items-center py-2 mb-5">
            <FaRegUser className="ml-5" />
            <input
              type="text"
              name="name"
              placeholder="Enter Full Name"
              className="outline-none bg-transparent px-5 border-zinc-300 rounded-sm w-72"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Input */}
          <div className="email flex border-[1px] justify-center items-center py-2 mb-5">
            <MdOutlineEmail className="ml-5" />
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              className="outline-none bg-transparent px-5 border-zinc-300 rounded-sm w-72"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Input */}
          <div className="password flex border-[1px] justify-center items-center py-2 mb-5">
            <RiLockPasswordLine className="ml-5" />
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              className="outline-none bg-transparent px-5 border-zinc-300 rounded-sm w-72"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {/* Role Selection */}
          <div className="role flex border-[1px] justify-center items-center py-2 mb-5">
            <FaRegUser className="ml-5" />
            <select
              name="role"
              className="outline-none bg-transparent px-5 border-zinc-300 rounded-sm w-72"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="resident">Resident</option>
              <option value="garbage_collector">Garbage Collector</option>
            </select>
          </div>

          {/* Address Input (for residents) */}
          {formData.role === 'resident' && (
            <div className="address flex border-[1px] justify-center items-center py-2 mb-5">
              <FaMapMarkerAlt className="ml-5" />
              <input
                type="text"
                name="address"
                placeholder="Enter Address"
                className="outline-none bg-transparent px-5 border-zinc-300 rounded-sm w-72"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Vehicle Input (for garbage collectors) */}
          {formData.role === 'garbage_collector' && (
            <div className="vehicle flex border-[1px] justify-center items-center py-2 mb-5">
              <FaTruck className="ml-5" />
              <input
                type="text"
                name="assignedVehicle"
                placeholder="Enter Vehicle Number"
                className="outline-none bg-transparent px-5 border-zinc-300 rounded-sm w-72"
                value={formData.assignedVehicle}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#66BB6A] hover:bg-[#2E7D32] text-zinc-900 cursor-pointer mt-2 px-10 py-2 w-[20.3rem] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {error && (
          <span className="mt-5 text-red-500 text-sm">{error}</span>
        )}

        <p className="text-sm mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-green-900 underline">
            Login
          </Link>
        </p>
      </div>

      {/* Middle Line */}
      <div className="bg-green-900 h-[30rem] w-1 absolute hidden md:block translate-y-[25%] translate-x-[800px]" />

      {/* Image Section */}
      <motion.div
        className="img w-1/2 h-full overflow-hidden z-[999] flex justify-center items-center"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img
          src="/cleanerImg.webp"
          alt="CleanBage"
          className="bg-no-repeat"
        />
      </motion.div>
    </div>
  );
}

export default SignUp;