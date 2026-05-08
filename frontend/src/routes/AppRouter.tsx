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
import Gallery from "../pages/Gallery";
import Blog from "../pages/Blog";
import Contact from "../pages/Contact";
import Shipping from "../pages/Shipping";
import Terms from "../pages/Terms";
import Wishlist from "../pages/Wishlist";
import Tracking from "../pages/Tracking";
import BlogPost from "../pages/BlogPost";
import OrderConfirmation from "../pages/OrderConfirmation";

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
        <Route path="/cuenta/wishlist" element={<Wishlist />} />
        <Route path="/cuenta/seguimiento" element={<Tracking />} />
        <Route path="/galeria" element={<Gallery />} />
        <Route path="/galeria/clientes" element={<Gallery initialCategory="Customer Photos" />} />
        <Route path="/galeria/proceso" element={<Gallery initialCategory="Video Process" />} />
        <Route path="/galeria/terminadas" element={<Gallery initialCategory="Finished Rugs" />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/envios" element={<Shipping />} />
        <Route path="/terminos" element={<Terms />} />
        <Route path="/orden-confirmada" element={<OrderConfirmation />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
