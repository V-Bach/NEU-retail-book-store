import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";

const initialState = {
    cartItems: []
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: initialState,
    reducers: {
        addToCart: (state, action) => {
            // Ép kiểu ID về String để so sánh chính xác giữa sách tĩnh và API
            const newItemId = String(action.payload.book_id || action.payload.id);
            const existingItem = state.cartItems.find(item => 
                String(item.book_id) === newItemId
            );

            if (!existingItem) {
                state.cartItems.push(action.payload);
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Đã thêm vào giỏ mượn",
                    showConfirmButton: false,
                    timer: 1000
                });
            } else {
                Swal.fire({
                    title: "Sách đã có trong giỏ",
                    text: "Bạn đã chọn cuốn sách này rồi.",
                    icon: "info",
                    confirmButtonColor: "#3085d6",
                });
            }
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(item => 
                String(item.book_id) !== String(action.payload.book_id)
            );
        },
        clearCart: (state) => {
            state.cartItems = [];
        }
    }
})

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;