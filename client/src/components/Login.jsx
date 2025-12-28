import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form"
import api from '../utils/api' // Import cầu nối API
import Swal from 'sweetalert2'

const Login = () => {
  const [message, setMessage] = useState("")
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      // Gọi API login từ backend của bạn
      const response = await api.post('/auth/login', data);
      
      if (response.data.token) {
        // Lưu token và thông tin user để dùng cho các request sau
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          showConfirmButton: false,
          timer: 1500
        });
        
        navigate("/"); // Chuyển về trang chủ
        window.location.reload(); // Reload để Navbar cập nhật trạng thái
      }
    } catch (error) {
      setMessage("Email hoặc mật khẩu không chính xác!");
      console.error("Login error:", error);
    }
  }

  const handleGoogleSignIn = () => {
    alert("Chức năng này đang được phát triển với Firebase/Auth!");
  }

  return (
    <div className='h-[calc(100vh-120px)] flex justify-center items-center'>
      <div className='w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        <h2 className='text-xl font-semibold mb-4 text-center'>Đăng nhập thư viện</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='email'> Email </label>
            <input 
              {...register("email", { required: "Email là bắt buộc" })}
              type="email" id='email' placeholder='Email của bạn' 
              className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline'/>
            {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
          </div>

          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'> Mật khẩu </label>
            <input
              {...register("password", { required: "Mật khẩu là bắt buộc" })}
              type="password" id='password' placeholder='Mật khẩu' 
              className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline'/>
            {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
          </div>

          {message && <p className='text-red-500 text-xs italic mb-3 text-center'> {message} </p>}

          <div>
            <button className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none transition-colors'> 
              Đăng nhập 
            </button>
          </div>
        </form>

        <p className='align-baseline font-medium mt-4 text-sm text-center'>
          Chưa có tài khoản? <Link to="/register" className='text-blue-500 hover:text-blue-700'> Đăng ký ngay </Link>
        </p>
        
        <div className='mt-4 border-t pt-4'>
          <button 
            onClick={handleGoogleSignIn}
            className='w-full flex items-center justify-center bg-gray-800 hover:bg-black text-white font-bold py-2 px-4 rounded focus:outline-none transition-all'>
            <FaGoogle className='mr-2 text-red-500'/>
            Đăng nhập với Google
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login