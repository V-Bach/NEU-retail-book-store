import React, { useEffect, useState } from 'react'
import { Banner } from './Banner'
import TopSeller from './TopSeller'
import Recommended from './Recommended'
import News from './News'
import api from '../../utils/api' 

const Home = () => {
    const [reminders, setReminders] = useState([]);

    // Logic lấy thông báo nhắc nhở từ Backend
    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await api.get('/loans/reminders');
                    // Backend của bạn trả về mảng reminders đã được gộp nhóm
                    setReminders(response.data.reminders || []);
                }
            } catch (error) {
                console.error("Lỗi lấy thông báo nhắc nhở:", error);
            }
        };
        fetchReminders();
    }, []);

    return (
        <>
            {/* PHẦN THÔNG BÁO NHẮC NHỞ (Hiển thị nếu có dữ liệu) */}
            {reminders.length > 0 && (
                <div className="max-w-screen-2xl mx-auto px-4 mt-4 space-y-4">
                    {reminders.map((item, index) => (
                        <div 
                            key={index} 
                            className={`p-4 rounded-lg border-l-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center transition-all ${
                                item.alert_type === 'DANGER' 
                                ? 'bg-red-50 border-red-500 text-red-900' 
                                : item.alert_type === 'WARNING' 
                                ? 'bg-orange-50 border-orange-500 text-orange-900' 
                                : 'bg-blue-50 border-blue-500 text-blue-900'
                            }`}
                        >
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">
                                    {item.alert_type === 'DANGER' ? '🚨 Quá hạn trả sách!' : '📅 Thông báo mượn sách'}
                                </h3>
                                <p className="font-medium">{item.display_message}</p>
                                <p className="text-sm mt-1">
                                    <span className="font-semibold">Sách:</span> {item.books.join(', ')}
                                </p>
                            </div>
                            
                            <div className="mt-3 md:mt-0 flex gap-2">
                                <button className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm font-semibold">
                                    Chi tiết
                                </button>
                                <button 
                                    className={`px-4 py-2 rounded text-white text-sm font-bold shadow-md transition-transform hover:scale-105 ${
                                        item.alert_type === 'DANGER' ? 'bg-red-600' : 'bg-blue-600'
                                    }`}
                                >
                                    Xử lý ngay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            
            <Banner/>
            <TopSeller/>
            <Recommended/>
            <News/>
        </>
    )
}

export default Home