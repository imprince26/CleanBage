import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight, FaMapMarkedAlt, FaTruck, FaChartBar } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import cleaningImage from "../assets/images/main-img.png";

const HeroSection = () => {
  const { isAuthenticated, user } = useAuth();

  const getActionButton = () => {
    if (!isAuthenticated) {
      return (
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 rounded-lg
                   bg-[#2D6A4F] text-white hover:bg-[#95D5B2]
                   transition-colors shadow-lg hover:shadow-xl"
        >
          Get Started
          <FaArrowRight className="ml-2" />
        </Link>
      );
    }

    const roleActions = {
      resident: (
        <Link
          to="/resident/report"
          className="inline-flex items-center px-6 py-3 rounded-lg
                   bg-[#2D6A4F] text-white hover:text-[#2D6A4F] dark:hover:text-[#081C15] hover:bg-[#95D5B2]
                   transition-colors  shadow-lg hover:shadow-xl"
        >
          Report Bin
          <FaMapMarkedAlt className="ml-2" />
        </Link>
      ),
      garbage_collector: (
        <Link
          to="/collector/routes"
          className="inline-flex items-center px-6 py-3 rounded-lg
                   bg-[#2D6A4F] text-white hover:text-[#2D6A4F] dark:hover:text-[#081C15] hover:bg-[#95D5B2]
                   transition-colors shadow-lg hover:shadow-xl"
        >
          View Routes
          <FaTruck className="ml-2" />
        </Link>
      ),
      admin: (
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center px-6 py-3 rounded-lg
                   bg-[#2D6A4F] text-white hover:text-[#2D6A4F] dark:hover:text-[#081C15] hover:bg-[#95D5B2]
                   transition-colors shadow-lg hover:shadow-xl"
        >
          Dashboard
          <FaChartBar className="ml-2" />
        </Link>
      )
    };

    return roleActions[user?.role] || null;
  };

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D6A4F] dark:text-[#95D5B2] mb-6">
            Smart Waste Management for a{" "}
            <span className="text-[#95D5B2] dark:text-[#D1FAE5]">
              Cleaner Future
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
            {isAuthenticated 
              ? `Welcome back! Continue managing waste efficiently with our smart solutions.`
              : `Join us in revolutionizing waste management through smart technology,
                 real-time tracking, and sustainable practices.`
            }
          </p>

          <div className="flex flex-wrap gap-4">
            {getActionButton()}
            
            <Link
              to={isAuthenticated ? `/${user?.role}/schedule` : "#features"}
              className="inline-flex items-center px-6 py-3 rounded-lg
                       border-2 border-[#2D6A4F] text-[#2D6A4F]
                       dark:border-[#95D5B2] dark:text-[#95D5B2]
                       hover:bg-[#2D6A4F] hover:text-white
                       dark:hover:bg-[#95D5B2] dark:hover:text-[#081C15]
                       transition-colors"
            >
              {isAuthenticated ? "View Schedule" : "Learn More"}
              <MdDashboard className="ml-2" />
            </Link>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <img
            src={cleaningImage}
            alt="Smart Waste Management"
            className="w-full h-auto rounded-lg shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#2D6A4F]/20 to-transparent rounded-lg" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;