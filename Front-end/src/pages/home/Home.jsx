import React, { useEffect, useState } from 'react'
import { Banner } from './Banner'
import TopSeller from './Topseller'
import Recommended from './Recommended'
import News from './News'
import api from '../../utils/api' 

const Home = () => {
    const [reminders, setReminders] = useState([]);

    // Gọi API lấy thông báo nhắc nhở khi vào trang chủ
    useEffect(() => {
        const fetchReminders = async () => {
            try {
                // Chỉ gọi nếu đã đăng nhập (có token)
                if (localStorage.getItem('token')) {
                    const response = await api.get('/loans/reminders');
                    setReminders(response.data.reminders);
                }
            } catch (error) {
                console.error("Không thể lấy thông báo nhắc nhở:", error);
            }
        };
        fetchReminders();
    }, []);

    return (
        <>
            {/* PHẦN THÔNG BÁO CHỦ ĐỘNG */}
            {reminders.length > 0 && (
                <div className="space-y-2 mb-6">
                    {reminders.map((item, index) => (
                        <div 
                            key={index} 
                            className={`p-4 rounded-lg border-l-4 flex justify-between items-center ${
                                item.alert_type === 'DANGER' ? 'bg-red-100 border-red-500 text-red-700' : 
                                item.alert_type === 'WARNING' ? 'bg-orange-100 border-orange-500 text-orange-700' : 
                                'bg-blue-100 border-blue-500 text-blue-700'
                            }`}
                        >
                            <div>
                                <p className="font-bold">{item.display_message}</p>
                                <p className="text-sm">Sách: {item.books.join(', ')} (Hạn: {item.due_date})</p>
                            </div>
                            <button className="underline text-sm font-semibold">Trả sách ngay</button>
                        </div>
                    ))}
                </div>
            )}

            <Banner/>
            {/* cần vào các file này để sửa logic lấy data từ API */}
            <TopSeller/>
            <Recommended/>
            <News/>
        </>
    )
}

export default Home