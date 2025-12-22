import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import BookCard from '../books/BookCard'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// import required modules
import { Pagination } from 'swiper/modules';
import { Navigation } from 'swiper/modules';


const Categories = ["Chọn Thể Loại", "Maths", "Technology", "Economics", "Social"]
const TopSeller = () => {
    const [books, setBooks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Chọn Thể Loại");

    useEffect(() => {
        fetch("books.json")
        .then(res => res.json())
        .then(data => setBooks(data))
    }, [])

    const filteredBooks = selectedCategory === "Chọn Thể Loại" ? books: books.filter(books => books.category === selectedCategory.toLocaleLowerCase())
    console.log(filteredBooks)
  return (
    <div className='py-10'>
        <h2 className='text text-3xl font-semibold mb-6'> Top Sellers </h2>

        {/*Categories */}
        <div className='mb-8 flex items-center'>
            <select onChange={(e) => setSelectedCategory(e.target.value)} name='category' id = 'category' className='border bg-[#EAEAEA] border-gray-300 rounded-md px-4 py-2 focus:outline-none'> 
                {
                    Categories.map((category, index)=> (
                        <option key={index} value = {category}> {category} </option>
                    ))
                }
            </select>
        </div>

      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        navigation={true}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 40,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 50,
          },
          1180: {
            slidesPerView: 2,
            spaceBetween: 50
          },
        }}
        modules={[Navigation]}
        className="mySwiper">
          
        {
            filteredBooks.length > 0 && filteredBooks.map((book, index) => (
                <SwiperSlide key = {index}>
                    <BookCard  book={book} />
                </SwiperSlide>
            ))
                
        }

      </Swiper>

        
    </div>
  )
}

export default TopSeller