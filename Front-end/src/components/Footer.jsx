import React from 'react'
import { FaHome } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import logo_neu from '/Logo_NEU.png'
import { FaFacebook, FaInstagram} from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 px-4">
      {/* Top Section */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left Side - Logo and Nav */}
        <div className="md:w-1/2 w-full">
          <img src={logo_neu} alt="Logo" className="mb-5 w-36" />
          <ul className="flex flex-col md:flex-row gap-4">
            <li><a href="#home" className="hover:text-primary">Home</a></li>
            <li><a href="#services" className="hover:text-primary">Services</a></li>
            <li><a href="#about" className="hover:text-primary">About Us</a></li>
            <li><a href="#contact" className="hover:text-primary">Contact</a></li>
          </ul>
        </div>

        {/* Right Side - Newsletter */}
        <div className="md:w-1/2 w-full">
          <p className="mb-4">
            Mày có ý kiến gì không?
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Cho bố cái địa chỉ email"
              className="w-full px-4 py-2 rounded-l-md text-black"
            />
            <button className="bg-primary px-6 py-2 rounded-r-md hover:bg-primary-dark">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center mt-10 border-t border-gray-700 pt-6">
        {/* Left Side - Privacy Links */}
        <ul className="flex flex-col gap-6 mb-4 md:mb-0">
          <li className="flex items-center gap-3"><FaHome size = {24} /> 207 Giải Phóng, phường Bạch Mai, Hà Nội, Việt Nam</li>
          <li className="flex items-center gap-3"> <FaPhoneAlt size = {24}/> 0876249584 </li>
        </ul>

        {/* Right Side - Social Icons */}
        <div className="flex gap-6">
          <a href="https://www.facebook.com/baocuteeewa" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaFacebook size={24} />
          </a>
          <a href="https://www.instagram.com/_baocutewaa/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaInstagram size={24} />
          </a>
          <a href="https://github.com/V-Bach/NEU-retail-book-store" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <FaGithub size={24} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer