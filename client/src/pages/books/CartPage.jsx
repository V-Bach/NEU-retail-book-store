import React from 'react'
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getImgUrl } from '../../utils/getImgUrl';
import { removeFromCart, clearCart } from '../../redux/features/cart/cartSlice';

const CartPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const totalPrice = cartItems.reduce((acc, item) => acc + Number(item.price || 0), 0).toFixed(2);

    return (
        <div className="flex mt-12 h-full flex-col overflow-hidden bg-white shadow-xl rounded-lg">
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="flex items-start justify-between">
                    <div className="text-lg font-medium text-gray-900 font-primary">Danh sách mượn sách</div>
                    <div className="ml-3 flex h-7 items-center ">
                        <button onClick={() => dispatch(clearCart())} type="button" className="py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                            <span>Xóa toàn bộ giỏ</span>
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flow-root">
                        {cartItems.length > 0 ? (
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                                {cartItems.map((product) => (
                                    <li key={product?.book_id} className="flex py-6">
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                            <img
                                                alt={product?.title}
                                                src={product?.cover_image_url?.startsWith('http') ? product.cover_image_url : getImgUrl(product?.cover_image_url)}
                                                className="h-full w-full object-cover object-center"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150x220?text=No+Image'; }}
                                            />
                                        </div>
                                        <div className="ml-4 flex flex-1 flex-col">
                                            <div>
                                                <div className="flex flex-wrap justify-between text-base font-medium text-gray-900">
                                                    <h3><Link to={`/books/${product.book_id}`}>{product?.title}</Link></h3>
                                                    <p className="sm:ml-4 text-blue-600">${product?.price}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500 capitalize">
                                                    <strong>Thể loại:</strong> {typeof product.category === 'object' ? product.category?.name : product.category}
                                                </p>
                                            </div>
                                            <div className="flex flex-1 flex-wrap items-end justify-between space-y-2 text-sm">
                                                <p className="text-gray-500 italic">Hạn mượn sẽ được chọn ở bước sau</p>
                                                <button onClick={() => dispatch(removeFromCart(product))} type="button" className="font-medium text-red-600 hover:text-red-500">
                                                    Loại bỏ
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10">
                                <p className='text-gray-500'>Giỏ hàng đang trống!</p>
                                <Link to="/" className="text-blue-600 underline">Quay lại trang chủ</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Tổng giá trị sách</p>
                    <p>${totalPrice}</p>
                </div>
                <div className="mt-6">
                    <Link to="/checkout" className="flex items-center justify-center rounded-md border border-transparent bg-yellow-500 px-6 py-3 text-base font-medium text-black shadow-sm hover:bg-yellow-600">
                        Tiếp tục: Chọn hạn mượn (7-14 ngày)
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default CartPage;