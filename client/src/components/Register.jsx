import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form"
import api from '../utils/api'; // Cầu nối API của bạn
import Swal from 'sweetalert2';

const Register = () => {
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();
  
    const onSubmit = async (data) => {
        try {
            // Gửi dữ liệu đăng ký tới Backend
            // Lưu ý: Backend của bạn có thể cần thêm trường 'username' 
            // Nếu model User yêu cầu username, hãy bổ sung input vào form
            const response = await api.post('/auth/register', {
                email: data.email,
                password: data.password,
                username: data.email.split('@')[0] // Tạm lấy phần trước @ làm username nếu thiếu
            });

            if (response.status === 201 || response.status === 200) {
                Swal.fire({
                    title: "Đăng ký thành công!",
                    text: "Bây giờ bạn có thể đăng nhập để mượn sách.",
                    icon: "success"
                });
                navigate("/login");
            }
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            setMessage(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!");
        }
    }

    const handleGoogleSignIn = () => {
        Swal.fire("Thông báo", "Chức năng đăng nhập Google đang được bảo trì!", "info");
    }

  return (
    <div className='h-[calc(100vh-120px)] flex justify-center items-center'>
      <div className='w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        <h2 className='text-xl font-semibold mb-4'>Đăng ký tài khoản</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='email'>Email</label>
            <input 
                {...register("email", { required: "Email là bắt buộc" })}
                type="email" id='email' placeholder='Địa chỉ email' 
                className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline'
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>Mật khẩu</label>
            <input
                {...register("password", { 
                    required: "Mật khẩu là bắt buộc",
                    minLength: { value: 6, message: "Mật khẩu phải từ 6 ký tự" }
                })}
                type="password" id='password' placeholder='Mật khẩu' 
                className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline'
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>}

          <div>
            <button className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none transition-all'>
                Đăng ký
            </button>
          </div>
        </form>

        <p className='align-baseline font-medium mt-4 text-sm'>
          Đã có tài khoản? <Link to="/login" className='text-blue-500 hover:text-blue-700'>Đăng nhập ngay</Link>
        </p>
        
        <div className='mt-4'>
          <button 
            onClick={handleGoogleSignIn}
            className='w-full flex flex-wrap gap-1 items-center justify-center bg-gray-800 hover:bg-black text-white font-bold py-2 px-4 rounded focus:outline-none'>
            <FaGoogle className='mr-2 text-red-500'/>
            Tiếp tục với Google
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register