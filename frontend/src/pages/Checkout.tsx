import Navbar from "../components/Navbar";

export default function Checkout() {
  return (
    <>
      <Navbar />

      <div className="p-10">
        <h1 className="text-3xl font-bold">Checkout</h1>

        <button className="mt-6 bg-green-500 text-white px-6 py-3 rounded">
          Pagar ahora
        </button>
      </div>
    </>
  );
}