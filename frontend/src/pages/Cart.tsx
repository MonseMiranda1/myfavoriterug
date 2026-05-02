import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Cart() {
  return (
    <>
      <Navbar />

      <div className="p-10">
        <h1 className="text-3xl font-bold">Carrito</h1>

        <p className="mt-4">Aqui iran los productos</p>

        <Link to="/checkout">
          <button className="mt-6 bg-purple-500 text-white px-6 py-3 rounded">
            Ir a pagar
          </button>
        </Link>
      </div>
    </>
  );
}
