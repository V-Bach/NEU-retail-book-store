import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiMiniBars3CenterLeft } from "react-icons/hi2";
import { IoSearch } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { IoIosHeartEmpty } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import avtImg from "../assets/avatar.png";
import { useSelector } from 'react-redux';

// Đã xóa "Quản lý mượn" khỏi danh sách điều hướng
const navigation = [
  {name: "Lịch sử mượn", href: "/orders"},
  {name: "Giỏ mượn", href: "/cart"},
]

const Navbar = () => {
  const [isdropdownOpen, setisdropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const cartItems = useSelector(state => state.cart.cartItems);
  const navigate = useNavigate();

  // Lấy thông tin user thực tế từ localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const handleLogOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setisdropdownOpen(false);
    navigate("/login");
  }

  // XỬ LÝ TÌM KIẾM
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); 
    }
  }

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
            {/* Left side */}
            <div className='flex items-center md:gap-16 gap-4'>
              <Link to="/"> 
                <HiMiniBars3CenterLeft className='size-6'/> 
              </Link>

              {/* Ô TÌM KIẾM */}
              <form onSubmit={handleSearch} className='relative sm:w-72 w-40 space-x-2'> 
                <IoSearch className='absolute inline-block left-3 inset-y-2 text-gray-400 cursor-pointer' onClick={handleSearch}/>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Tìm kiếm sách từ Google...' 
                  className='bg-[#EAEAEA] w-full py-1 md:px-8 px-6 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400' 
                /> 
              </form>
            </div>

            {/* Right side */}
            <div className='relative flex items-center md:space-x-2'> 
              <div>
                {
                  currentUser ? (
                    <div className="relative">
                      <button onClick={() => setisdropdownOpen(!isdropdownOpen)} className="flex items-center"> 
                        <img src={avtImg} alt="User Avatar" className={`size-7 rounded-full ring-2 ring-blue-500`}/>
                      </button>
                      {
                        isdropdownOpen && (
                          <div className='absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50 border border-gray-100'> 
                            <ul className='py-2'>
                              <li className="px-4 py-2 text-xs text-gray-500 border-b">
                                Chào, {currentUser.first_name || currentUser.username || 'Bạn'}
                              </li>
                              {
                                navigation.map((item) => (
                                  <li key={item.name} onClick={() => setisdropdownOpen(false)}>
                                    <Link to={item.href} className='block px-4 py-2 text-sm hover:bg-blue-50 transition-colors'>
                                      {item.name}
                                    </Link>
                                  </li>
                                ))
                              }
                              <li>
                                <button 
                                  onClick={handleLogOut}
                                  className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors'
                                >
                                  Đăng xuất
                                </button>
                              </li>
                            </ul>
                          </div>
                        )
                      }
                    </div>
                  ) : (
                    <Link to="/login" className="hover:text-blue-600 transition-colors"> 
                      <FaRegUser className='size-6'/> 
                    </Link>
                  )
                }
              </div>
              
              <button className='hidden sm:block hover:text-red-500 transition-colors'>
                <IoIosHeartEmpty className='size-6'/>
              </button>

              <Link to="/cart" className='bg-primary p-1 sm:px-6 px-2 flex items-center rounded-sm hover:opacity-90 transition-all'> 
                <FiShoppingCart className=''/>
                <span className='text-sm font-semibold sm:ml-1'>
                  {cartItems.length > 0 ? cartItems.length : 0}
                </span>
              </Link>
            </div>
        </nav>
    </header>
  )
}

export default Navbar