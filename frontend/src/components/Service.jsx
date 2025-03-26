/* eslint-disable no-unused-vars */
import React from "react";
import {motion} from "motion/react" 

const Service = ({ desc, imgSrc, imgAlt, heading, darkMode }) => {
  return (
    <motion.div
      className={`flex flex-col h-[50vh] p-6 rounded-lg shadow-md min-w-[25vw] max-w-[30vw]: ${
        darkMode
          ? "bg-[#4da952] shadow-[#424242]"
          : "bg-[#7aef80] shadow-[#E0E0E0]"
      } `}

      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <img
        alt={imgAlt}
        className=" h-[200px] object-cover mb-4 rounded"
        src={imgSrc}
      />
      <h2 className="text-2xl font-bold mb-2">{heading}</h2>
      <p className={`${darkMode ? " text-[#E0E0E0]" : "text-[#424242]"} mb-4`}>
        {desc}
      </p>
    </motion.div>
  );
};

export default Service;
