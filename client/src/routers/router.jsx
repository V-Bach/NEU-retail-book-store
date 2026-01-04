import {
  createBrowserRouter,
} from "react-router-dom";

import App from "../App.jsx";
import Home from "../pages/home/Home.jsx";
import Login from "../components/Login.jsx";
import Register from "../components/Register.jsx";
import CartPage from "../pages/books/CartPage.jsx";
import Checkout from "../pages/books/CheckoutPage.jsx";
import SearchPage from "../pages/books/SearchPage.jsx";
import OrderPage from "../pages/books/OrderPage.jsx"; 

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
      },
      {
        path: "/cart",
        element: <CartPage/>
      },
      {
        path: "/checkout",
        element: <Checkout/>
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/orders",
        element: <OrderPage />,
      }
    ]
  },
]);

export default router;