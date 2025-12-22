import React from 'react'
import bannerImg from '../../assets/banner.png'

export const Banner = () => {
  return (
    <div className='flex flex-col md:flex-row-reverse py-16 justify-between items-center gap-12'>
        <div className='md:w-1/2 w-full flex items-center md:justify-end'>
            <img src = {bannerImg} alt = 'Banner'/>
        </div>

        <div className='md:w-1/2 w-full'>
            <h1 className='md:text-5xl text-2xl font-medium mb-7'> Mới Ra Lò </h1>
            <p className='mb-10'> 
                Đã đến lúc làm mới reading list với 3 “trụ cột” toán–công nghệ không thể thiếu: Linear Algebra, Discrete Mathematics và Numerical Methods — nền tảng từ tư duy cấu trúc, logic rời rạc đến tính toán số, học là dùng được liền cho Data, AI và Engineering.
            </p>
            <button className='btn-primary'> Đăng ký ngay </button>
        </div>

        
    </div>
  )
}

export default Banner
