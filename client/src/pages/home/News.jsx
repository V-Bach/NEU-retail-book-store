import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import news1 from '../../assets/news/news-1.jpg'
import news2 from '../../assets/news/news-2.jpg'
import news3 from '../../assets/news/news-3.jpg'
import news4 from '../../assets/news/news-4.jpg'
import news5 from '../../assets/news/news-4.jpg'
import { Link } from 'react-router-dom';

const news = [
  {
    "id": 1,
    "title": "Big Data Analytics Transforms Personalized Medicine",
    "description": "Healthcare providers are increasingly adopting big data analytics to tailor treatments for individual patients, improving outcomes and reducing costs in hospitals worldwide.",
    "image": news1
  },
  {
    "id": 2,
    "title": "Zero-Trust Architecture Becomes New Standard in Cybersecurity",
    "description": "As cyber threats evolve, major corporations are shifting from traditional perimeter security to a Zero-Trust model, verifying every user and device inside and outside the network.",
    "image": news2
  },
  {
    "id": 3,
    "title": "Central Banks Explore Digital Currencies to Modernize Economy",
    "description": "Economists debate the impact of Central Bank Digital Currencies (CBDCs) as several nations pilot digital money to streamline cross-border payments and reduce transaction fees.",
    "image": news3
  },
  {
    "id": 4,
    "title": "The Rise of MLOps: Bridging the Gap Between AI and Operations",
    "description": "A surge in Machine Learning Operations (MLOps) tools is helping tech companies deploy AI models faster and more reliably, solving the 'last mile' problem in data science projects.",
    "image": news4
  },
  {
    "id": 5,
    "title": "Tech Giants Agree on Ethical Guidelines for Generative AI",
    "description": "In a historic meeting, leaders from top technology firms have established a voluntary framework to ensure generative AI is developed safely, transparently, and without bias.",
    "image": news5
  }
]

const News = () => {
  return (
    <div className='py-16'>
        <h2 className='text text-3xl font-semibold mb-6'> News </h2>

        <Swiper
        slidesPerView={1}
        spaceBetween={30}
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
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper">

        {
            news.map((item, index) => (
                <SwiperSlide key = {index}>
                    <div className='flex flex-col sm:flex-row sm:justify-between items-center gap-12'>
                        {/*content*/}
                        <div className='py-4'>
                            <Link to ="/">
                                <h3 className='text-lg font-medium hover:text-blue-300 mb-4 '>{item.title}</h3>
                            </Link>

                            <div className='w-12 h-[4px] bg-primary mb-5'> </div>

                            <p className='text-sm text-gray-600'>
                                {item.description}
                            </p>

                        </div>

                        <div className='flex-shrink-0'>
                            <img src = {item.image} alt={item.title} className='w-[123px] h-[156px] object-cover rounded'/>

                        </div>
                    </div>
                </SwiperSlide>
            ))
        }
      </Swiper>
    </div>
  )
}

export default News