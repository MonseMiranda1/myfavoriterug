import { lazy, Suspense } from "react";
import Home from "../pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Store = lazy(() => import("../pages/Store"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Admin = lazy(() => import("../pages/Admin"));
const Personaliza = lazy(() => import("../pages/Personaliza"));
const About = lazy(() => import("../pages/About"));
const Account = lazy(() => import("../pages/Account"));
const Orders = lazy(() => import("../pages/Orders"));
const Quotes = lazy(() => import("../pages/Quotes"));
const Gallery = lazy(() => import("../pages/Gallery"));
const Blog = lazy(() => import("../pages/Blog"));
const Contact = lazy(() => import("../pages/Contact"));
const Shipping = lazy(() => import("../pages/Shipping"));
const Terms = lazy(() => import("../pages/Terms"));
/*const Wishlist = lazy(() => import("../pages/Wishlist"));*/
const Tracking = lazy(() => import("../pages/Tracking"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const OrderConfirmation = lazy(() => import("../pages/OrderConfirmation"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
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
          {/*<Route path="/cuenta/wishlist" element={<Wishlist />} />*/}
          <Route path="/cuenta/seguimiento" element={<Tracking />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route
            path="/galeria/clientes"
            element={<Gallery initialCategory="Customer Photos" />}
          />
          <Route
            path="/galeria/proceso"
            element={<Gallery initialCategory="Video Process" />}
          />
          <Route
            path="/galeria/terminadas"
            element={<Gallery initialCategory="Finished Rugs" />}
          />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/envios" element={<Shipping />} />
          <Route path="/terminos" element={<Terms />} />
          <Route path="/orden-confirmada" element={<OrderConfirmation />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
