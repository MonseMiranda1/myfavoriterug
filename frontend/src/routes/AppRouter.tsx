import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Store from "../pages/Store";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Admin from "../pages/Admin";
import Personaliza from "../pages/Personaliza";
import About from "../pages/About";
import Account from "../pages/Account";
import Orders from "../pages/Orders";
import Quotes from "../pages/Quotes";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/personaliza" element={<Personaliza />} />
        <Route path="/sobre-nosotros" element={<About />} />
        <Route path="/tienda" element={<Store />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cuenta" element={<Account />} />
        <Route path="/cuenta/pedidos" element={<Orders />} />
        <Route path="/cuenta/cotizaciones" element={<Quotes />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
