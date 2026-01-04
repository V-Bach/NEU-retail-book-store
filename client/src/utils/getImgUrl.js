function getImgUrl(name) {
    if (!name || 
        name.toString().trim() === "" || 
        name.toString().toLowerCase() === "null" || 
        name.toString().toLowerCase() === "undefined") {
        
        return 'https://via.placeholder.com/300x450?text=Thư+Viện+Sách';
    }

    if (name.toString().startsWith('http')) {
        return name.replace('http://', 'https://');
    }

    try {
        return new URL(`../assets/books/${name}`, import.meta.url).href;
    } catch (error) {
        return 'https://via.placeholder.com/300x450?text=Chưa+Có+Ảnh';
    }
}

export { getImgUrl };