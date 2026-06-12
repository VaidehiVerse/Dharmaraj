import React from "react";
import "@/App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { I18nProvider } from "@/context/I18nContext";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Product from "@/pages/Product";
import Shop from "@/pages/Shop";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import OrderTracking from "@/pages/OrderTracking";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Policies from "@/pages/Policies";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";

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
      { path: "faq", element: <FAQ /> },
      { path: "policy/:kind", element: <Policies /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "account", element: <ProtectedRoute><Account /></ProtectedRoute> },
    ],
  },
  { path: "/admin", element: <ProtectedRoute adminOnly><Admin /></ProtectedRoute> },
]);

export default function App() {
  return (
    <div className="App">
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </div>
  );
}
