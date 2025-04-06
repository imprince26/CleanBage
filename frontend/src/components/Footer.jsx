import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { useTheme } from '@/context/ThemeContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const darkMode = useTheme();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Careers', path: '/careers' },
      { name: 'Privacy Policy', path: '/privacy' },
    ],
    services: [
      { name: 'Waste Collection', path: '/services/collection' },
      { name: 'Recycling', path: '/services/recycling' },
      { name: 'Smart Bins', path: '/services/smart-bins' },
      { name: 'Track Collection', path: '/services/tracking' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'FAQs', path: '/faqs' },
      { name: 'Report Issue', path: '/report' },
      { name: 'Download App', path: '/download' },
    ],
  };

  const socialLinks = [
    { icon: <FaFacebookF />, url: 'https://facebook.com' },
    { icon: <FaTwitter />, url: 'https://twitter.com' },
    { icon: <FaInstagram />, url: 'https://instagram.com' },
    { icon: <FaLinkedinIn />, url: 'https://linkedin.com' },
  ];

  return (
    <footer className={`w-full bg-[#F0FDF4] text-[#1E3A24] dark:bg-[#081C15] dark:text-[#D1FAE5]`}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <img src="/logo.svg" alt="CleanBage" className="h-8 w-8" />
              <span className="text-2xl font-bold text-[#2D6A4F] dark:text-[#95D5B2]">
                CleanBage
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              Revolutionizing waste management through smart technology and sustainable practices for a cleaner, greener future.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#2D6A4F] dark:bg-[#95D5B2] 
                           text-white dark:text-[#081C15] flex items-center justify-center
                           hover:bg-[#95D5B2] dark:hover:bg-[#2D6A4F] transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-[#2D6A4F] dark:text-[#95D5B2] mb-4 capitalize">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-600 dark:text-gray-300 hover:text-[#2D6A4F] 
                               dark:hover:text-[#95D5B2] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <MdEmail className="text-[#2D6A4F] dark:text-[#95D5B2] text-xl" />
            <a href="mailto:contact@cleanbage.com" className="hover:underline">
              contact@cleanbage.com
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <MdPhone className="text-[#2D6A4F] dark:text-[#95D5B2] text-xl" />
            <a href="tel:+1234567890" className="hover:underline">
              +1 (234) 567-890
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <MdLocationOn className="text-[#2D6A4F] dark:text-[#95D5B2] text-xl" />
            <span>123 Green Street, Eco City, EC 12345</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className={`border-t ${darkMode ? "border-gray-800" : "border-gray-200"
        }`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © {currentYear} CleanBage. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-300">
              <Link to="/terms" className="hover:underline">Terms of Service</Link>
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link to="/cookies" className="hover:underline">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;