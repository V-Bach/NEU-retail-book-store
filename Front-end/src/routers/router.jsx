import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import Home from "../pages/home/Home.jsx";
import Login from "../components/Login.jsx";
import Register from "../components/Register.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children:[
      {
        path: "/",
        element: <Home/>,
      },
      {
        //hiển thị thông báo nhắc nhở & sách đang mượn
        path: "my-loans", 
        element: <div>Trang Sách Đang Mượn & Nhắc Nhở</div> 
      },
      {
        //giỏ hàng xác nhận mượn 7 hoặc 14 ngày
        path: "cart",
        element: <div>Trang Giỏ Hàng Mượn</div>
      },
      {
        path: "/about",
        element: <div>About</div>
      },
      {
        path: "/login",
        element: <Login/>
      },
      {
        path: "/register",
        element: <Register/>
      }
    ]
  },
]);

export default router;