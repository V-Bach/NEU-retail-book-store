function getImgUrl(name) {
    // 1. Nếu tên ảnh bị null, undefined hoặc rỗng (Dành cho sách tĩnh thiếu dữ liệu)
    if (!name || name.toString().trim() === "") {
        // Bạn có thể thay link này bằng một file 'default-cover.png' trong assets nếu có
        return 'https://via.placeholder.com/300x450?text=Thư+Viện+Sách';
    }

    // 2. Nếu là link từ Google (bắt đầu bằng http)
    if (name.startsWith('http')) {
        return name.replace('http://', 'https://');
    }

    // 3. Nếu là ảnh nội bộ
    try {
        return new URL(`../assets/books/${name}`, import.meta.url).href;
    } catch (error) {
        // Phòng hờ trường hợp có tên file nhưng file không tồn tại trong thư mục assets
        return 'https://via.placeholder.com/300x450?text=Chưa+Có+Ảnh';
    }
}

export { getImgUrl };