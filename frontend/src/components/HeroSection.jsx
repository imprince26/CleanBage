/* eslint-disable no-unused-vars */
import { motion } from "motion/react";
import Button from "./Button";

const HeroSection = ({darkMode}) => {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 px-6">
      <motion.h1
        className={`${darkMode ? "text-[#34D399]" : "text-[#047857]"} text-5xl font-bold`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Smart Garbage Collection System
      </motion.h1>
      <motion.p
        className={`${darkMode ? "text-[#D1FAE5]" : "text-[#065F46]"} text-lg mt-4 max-w-2xl`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Join us in making the world cleaner with AI-powered garbage management.
      </motion.p>
      
      <div className="mt-6 flex gap-4">
        <Button text="Get Started" variant="primary" darkMode={darkMode} />
        <Button text="Learn More" variant="secondary" darkMode={darkMode} />
      </div>
    </section>
  );
};

export default HeroSection;
