import React from "react";
import "@/App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Product from "@/pages/Product";
import Shop from "@/pages/Shop";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import OrderTracking from "@/pages/OrderTracking";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import FAQ from "@/pages/FAQ";
import Policies from "@/pages/Policies";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "product/:slug", element: <Product /> },
      { path: "shop", element: <Shop /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "order-confirmation/:orderId", element: <OrderConfirmation /> },
      { path: "track", element: <OrderTracking /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:slug", element: <BlogPost /> },
      { path: "faq", element: <FAQ /> },
      { path: "policy/:kind", element: <Policies /> },
    ],
  },
]);

export default function App() {
  return (
    <div className="App">
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </div>
  );
}
