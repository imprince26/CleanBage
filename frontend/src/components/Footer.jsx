const Footer = ({darkMode}) => {
    return (
      <footer className={`text-center py-6 w-full h-[80vh]  ${
        darkMode ? "bg-[#029c70] text-[#D1FAE5]" : "bg-[#D1FAE5] text-[#1E3A24]"
      } rounded-t-2xl `} id="about">
        © {new Date().getFullYear()} CleanBage | All Rights Reserved
      </footer>
    );
  };
  
  export default Footer;
  