import React from 'react'
import { Link } from 'react-router-dom'
import { HiMiniBars3CenterLeft } from "react-icons/hi2";
import { IoSearch } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { IoIosHeartEmpty } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import avtImg from "../assets/avatar.png";
import { useState } from 'react';

const navigation = [
  {name: "Tổng quan", href: "/dashboard"},
  {name: "Đơn hàng", href: "/orders"},
  {name: "Giỏ hàng", href: "/cart"},
  {name: "Thanh toán", href: "/checkout"},
]

const Navbar = () => {
  const [isdropdownOpen, setisdropdownOpen] = useState(false);
  console.log(isdropdownOpen);

  const currentuser = false;
  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
            {/*Left side*/}
            <div className='flex items-center md:gap-16 gap-4'>
              <Link to = "/"> 
                <HiMiniBars3CenterLeft className='size-6'/> 
              </Link>

              {/*Search icon*/}
              <div className='relative sm:w-72 w-40 space-x-2'> 
                <IoSearch className='absolute inline-block left-3 inset-y-2'/>
                <input type = "text" placeholder='Search fohere' className='bg-[#EAEAEA] w-full py-1 md:px-8 px-6 rounded-md focus: outline-none ' > 
                </input>
              </div>
            </div>

            {/*Right side*/}
            <div className='relative flex items-center md:space-x-2'> 
              <div>
                {
                  currentuser ? <> 
                  <button onClick={() => setisdropdownOpen(!isdropdownOpen)}> 
                    <img src ={avtImg} alt = "User Avatar" className = {`size-7 rounded-full ${currentuser ? 'ring-2 ring-blue-500':''}`}/>
                  </button>
                  {/*show dropdown*/}
                  {
                    isdropdownOpen && (
                      <div className='absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40'> 
                        <ul className='py-2'>
                          {
                            navigation.map((item) => 
                              <li key={item.name} onClick={() => setisdropdownOpen(false)}>
                                <Link to = {item.href} className='block px-4 py-2 text-sm hover:bg-gray-300'>
                                  {item.name}
                                </Link>
                              </li>
                            )
                          }
                        </ul>
                      </div>
                    )
                  }
                  </> : <Link to = "/login"> <FaRegUser className='size-6'/> </Link>
                }
              </div>
              
              <button className='hidden sm:block'>
                <IoIosHeartEmpty className='size-6'/>
              </button>

              <Link to  = "/cart" className='bg-primary p-1 sm:px-6 px-2 flex items-center rounded-sm'> 
                <FiShoppingCart className=''/>
                <span className='text-sm font-semibold sm:ml-1'>
                  0
                </span>
              </Link>
            </div>
        </nav>

    </header>
  )
}

export default Navbar