/* eslint-disable no-unused-vars */
import { motion } from "motion/react";
import Button from "./Button";
import myImage from "../assets/images/main-img.png";
import Service from "./Service";


const HeroSection = ({ darkMode }) => {
  return (
    <>
      <main className="flex gap-4 h-[95vh] p-4 justify-center items-center border-green-400 border-b-2 " id="home">
        {/* landing page */}
        <section className="flex flex-col items-center justify-center text-center py-20 px-6 h-full ">
          <motion.h1
            className={`${
              darkMode ? "text-[#34D399]" : "text-[#047857]"
            } text-5xl font-bold`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
           Welcome to CLEANBAGE
          </motion.h1>
          <motion.p
            className={`${
              darkMode ? "text-[#D1FAE5]" : "text-[#065F46]"
            } text-lg mt-4 max-w-2xl`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Efficient and effective waste management for a cleaner environment.
          </motion.p>

          <div className="mt-6 flex gap-4">
            <Button text="Get Started" variant="primary" darkMode={darkMode} to="/register" />
            <Button text="Learn More" variant="secondary" darkMode={darkMode} />
          </div>
        </section>
        <div className="h-[90%] w-2 bg-green-700 round"></div>
        <div className="w-1/2 flex justify-center items-center">
          <img
            src={myImage}
            alt="cleaner-img"
            style={{ height: "90%", objectFit: "cover" }}
          />
        </div>
      </main>
            
      <div className="flex flex-col min-h-[95vh] justify-center px-6" id="services">
      <h1 className={`text-5xl text-center ${
              darkMode ? "text-[#34D399]" : "text-[#047857]"
            } mb-8`}>OUR SERVICES</h1>
      <div className="services flex flex-col md:flex-row gap-8  justify-center items-center">
            <Service heading="Admin" imgAlt={"admin-serv-img"} imgSrc={"https://storage.googleapis.com/a1aa/image/LSvUfRjZYpUuIcuNRfKdXqRlwF8Iu3ZGta-HUiXTAeo.jpg"} desc={"Manage users, view reports, and oversee the entire waste management process."} darkMode={darkMode} />
            <Service heading="Household" imgAlt={"admin-serv-img"} imgSrc={"https://storage.googleapis.com/a1aa/image/yWb5EFsvMDpC11rSSCIhyiui8AV0CJtyUy1l9EK6ijc.jpg"} desc={"Schedule waste pickups, view collection history, and manage your account."} darkMode={darkMode} />
            <Service heading="Waste Collectors" imgAlt={"admin-serv-img"} imgSrc={"https://storage.googleapis.com/a1aa/image/qVdcAUQQLIGXDx3vpBAuxxnSFYeqSw2joXA6ZhqS--M.jpg"} desc={"Track collection routes, update statuses, and communicate with the admin."} darkMode={darkMode} />
      </div>
      </div>
    </>
  );
};

export default HeroSection;
