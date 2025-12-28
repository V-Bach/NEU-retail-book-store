import React from 'react'
import bannerImg from '../../assets/banner.png'

export const Banner = () => {
  return (
    <div className='flex flex-col md:flex-row-reverse py-16 justify-between items-center gap-12'>
        <div className='md:w-1/2 w-full flex items-center md:justify-end'>
            <img src = {bannerImg} alt = 'Banner'/>
        </div>

        <div className='md:w-1/2 w-full'>
            <h1 className='md:text-5xl text-2xl font-medium mb-7'> Release This Week </h1>
            <p className='mb-10'> 
                It’s time to refresh your reading list with three indispensable math–tech pillars: Linear Algebra, Discrete Mathematics, and Numerical Methods — foundations that span structured thinking, discrete logic, and numerical computation, and are immediately applicable to Data, AI, and Engineering
            </p>
            <button className='btn-primary'> Subscribe Now! </button>
        </div>

        
    </div>
  )
}

export default Banner
