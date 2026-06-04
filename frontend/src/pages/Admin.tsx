import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import cajaIcon from "../assets/icons/caja.png";
import carritoIcon from "../assets/icons/carrito.png";
import compraIcon from "../assets/icons/compra.png";
import envioIcon from "../assets/icons/envio.png";
import monedaIcon from "../assets/icons/moneda.png";
import pagoIcon from "../assets/icons/pago.png";
import paletaIcon from "../assets/icons/paleta.png";
import subirIcon from "../assets/icons/subir.png";
import {
  deleteCategory,
  deleteUploadedProduct,
  getCategories,
  getProducts,
  saveCategory,
  saveUploadedProduct,
  updateCategory,
  updateUploadedProduct,
  uploadProductImage,
  type Category,
  type Product,
} from "../services/api";
import {
  confirmPayment,
  deleteBackendOrder,
  deletePayment,
  failPayment,
  getBackendOrders,
  getPayments,
  updateOrderShipping,
  type Order,
  type Payment,
} from "../services/orders";
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrder,
  type PurchaseOrder,
} from "../services/purchaseOrders";
import { deleteQuoteRequest, getAdminQuoteRequests, type CustomQuoteRequest } from "../services/quotes";
import { clearAdminSession, isAdminLoggedIn, loginAdmin, logoutAdmin } from "../services/adminAuth";

const initialQuotes = [
  {
    id: "COT-1777735573931",
    date: "02-05-2026",
    time: "11:26:13 a. m.",
    type: "Cotización",
    client: "constructora zero spa",
    contact: "claudio zurita",
    rut: "76453747-5",
    email: "info@constructorazero.net",
    phone: "977042060",
    address: "ramon subercaseaux 1268, san miguel, Metropolitana de Santiago",
    total: 0,
    sent: false,
    message: "cronometro 24 s inalambrico y tablero basquet 24x180",
  },
  {
    id: "COT-20260428-1736",
    date: "28-04-2026",
    time: "09:18:44 a. m.",
    type: "Cotización",
    client: "Municipalidad Los Angeles",
    contact: "Compras Municipales",
    rut: "69.170.100-K",
    email: "compras@losangeles.cl",
    phone: "432401000",
    address: "Los Angeles, Biobio",
    total: 9999998,
    sent: false,
    message: "Alfombra institucional personalizada para recepcion.",
  },
  {
    id: "COT-20260425-1750",
    date: "25-04-2026",
    time: "05:50:02 p. m.",
    type: "Cotización",
    client: "MARSUR CHILE",
    contact: "Área comercial",
    rut: "76.111.222-3",
    email: "ventas@marsur.cl",
    phone: "987654321",
    address: "Santiago, Metropolitana de Santiago",
    total: 904400,
    sent: false,
    message: "Logo en formato alfombra para oficina.",
  },
  {
    id: "COT-20260418-1108",
    date: "18-04-2026",
    time: "11:08:30 a. m.",
    type: "Cotización",
    client: "My Favorite Rug",
    contact: "Equipo tienda",
    rut: "77.777.777-7",
    email: "hola@myfavoriterug.com",
    phone: "900000000",
    address: "Santiago, Chile",
    total: 139000,
    sent: true,
    message: "Mascota personalizada.",
  },
];

type AdminQuote = {
  backendId: number;
  id: string;
  date: string;
  time: string;
  type: string;
  client: string;
  contact: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  sent: boolean;
  message: string;
  size: string;
  wool: string;
  colors: string;
  status: string;
  imageName: string;
};

const ADMIN_QUOTES_STORAGE_KEY = "my-favorite-rug-admin-quotes";

function getAdminQuotes(): AdminQuote[] {
  return [];
}

function saveAdminQuotes(quotes: AdminQuote[]) {
  void quotes;
}

void initialQuotes;
void ADMIN_QUOTES_STORAGE_KEY;
void saveAdminQuotes;

const clients = [
  { name: "constructora zero spa", email: "contacto@zero.cl", quotes: "1", lastOrder: "02-05-2026" },
  { name: "Municipalidad Los Angeles", email: "compras@losangeles.cl", quotes: "1", lastOrder: "28-04-2026" },
  { name: "MARSUR CHILE", email: "ventas@marsur.cl", quotes: "1", lastOrder: "25-04-2026" },
];

function toAdminQuote(quote: CustomQuoteRequest): AdminQuote {
  const createdAt = new Date(quote.createdAt);

  return {
    backendId: quote.id,
    id: quote.quoteNumber,
    date: new Intl.DateTimeFormat("es-CL").format(createdAt),
    time: new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(createdAt),
    type: "Cotizacion",
    client: quote.customerName || quote.email,
    contact: quote.customerName,
    rut: quote.rut || "-",
    email: quote.email,
    phone: quote.phone || "-",
    address: quote.address || "-",
    total: quote.totalClp,
    sent: quote.sent,
    message: quote.comments || "-",
    size: quote.size,
    wool: quote.wool,
    colors: quote.colors,
    status: quote.status,
    imageName: quote.imageName,
  };
}

const adminSections = [
  { id: "quotes", label: "Cotizaciones", icon: monedaIcon },
  { id: "orders", label: "Ordenes", icon: carritoIcon },
  { id: "purchase-orders", label: "Ordenes de compra", icon: compraIcon },
  { id: "payments", label: "Pagos", icon: pagoIcon },
  { id: "shipping", label: "Envíos", icon: envioIcon },
  { id: "products", label: "Productos", icon: cajaIcon },
  { id: "categories", label: "Categorías", icon: paletaIcon },
  { id: "upload", label: "Subir productos", icon: subirIcon },
] as const;

type AdminSection = (typeof adminSections)[number]["id"];

const availabilityOptions = ["Disponible", "Agotado", "Oculto", "Personalizado"];

const emptyProductForm = {
  id: "",
  name: "",
  category: "Custom Rugs",
  price: "",
  size: "",
  availability: availabilityOptions[0],
  images: [] as string[],
  imageNames: [] as string[],
};

const emptyCategoryForm = {
  id: "",
  name: "",
  status: "Visible" as Category["status"],
};

const shippingStatusOptions = ["Preparando", "Enviado", "Entregado", "Retenido"];

const emptyShippingForm = {
  orderId: "",
  trackingNumber: "",
  shippingStatus: shippingStatusOptions[0],
};

const paymentStatusOptions = ["PENDING", "PAID", "FAILED"];

const emptyPaymentForm = {
  id: "",
  client: "",
  total: "",
  status: paymentStatusOptions[0],
};

const purchaseOrderStatusOptions = ["Solicitada", "Recibida", "En revision", "Cancelada"];

const emptyPurchaseOrderForm = {
  id: "",
  client: "",
  provider: "",
  status: purchaseOrderStatusOptions[0],
  total: "",
  relatedOrderNumber: "",
  notes: "",
};

function fileToProductImage(file: File) {
  return new Promise<{ url: string; name: string }>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = async () => {
      const maxSize = 1600;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("No se pudo procesar la imagen."));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.fillStyle = "#fffaf0";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      try {
        const blob = await new Promise<Blob>((blobResolve, blobReject) => {
          canvas.toBlob((result) => {
            if (result) {
              blobResolve(result);
            } else {
              blobReject(new Error("No se pudo procesar la imagen."));
            }
          }, "image/jpeg", 0.82);
        });
        const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
        const url = await uploadProductImage(optimizedFile);
        resolve({ url, name: file.name });
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la imagen."));
    };

    image.src = objectUrl;
  });
}

function getAxiosStatus(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }

  if (error instanceof Error && axios.isAxiosError(error.cause)) {
    return error.cause.response?.status;
  }

  return null;
}

function isAdminAccessError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return getAxiosStatus(error) === 401 || message.includes("Acceso admin requerido");
}

function formatClp(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

const sectionCopy: Record<AdminSection, { title: string; description: string }> = {
  quotes: { title: "Cotizaciones o estimados", description: "Vista tipo panel para gestionar cotizaciones y datos de clientes." },
  orders: { title: "Ordenes", description: "Revisa pedidos, estados y solicitudes de alfombras personalizadas." },
  "purchase-orders": { title: "Ordenes de compra", description: "Gestiona documentos y compras asociadas a pedidos especiales." },
  payments: { title: "Pagos", description: "Controla pagos pendientes, abonados y confirmados." },
  shipping: { title: "Envíos", description: "Organiza despachos nacionales e internacionales." },
  products: { title: "Productos", description: "Crea y edita alfombras disponibles en la tienda." },
  categories: { title: "Categorías", description: "Administra categorías visibles en la tienda." },
  upload: { title: "Subir productos", description: "Carga productos temporales al catalogo." },
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAdminLoggedIn);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [quotes, setQuotes] = useState(getAdminQuotes);
  const [activeSection, setActiveSection] = useState<AdminSection>("quotes");
  const [activeView, setActiveView] = useState<"quotes" | "clients">("quotes");
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [period, setPeriod] = useState("Todos");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");
  const [uploadedProducts, setUploadedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(getCategories);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productFormMessage, setProductFormMessage] = useState("");
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [categoryMessage, setCategoryMessage] = useState("");
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [shippingForm, setShippingForm] = useState(emptyShippingForm);
  const [shippingMessage, setShippingMessage] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<number | null>(null);
  const [purchaseOrderForm, setPurchaseOrderForm] = useState(emptyPurchaseOrderForm);
  const [purchaseOrderMessage, setPurchaseOrderMessage] = useState("");
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    let isMounted = true;

    async function refreshAdminData() {
      try {
        await Promise.all([
          refreshAdminProducts(),
          refreshAdminQuotes(),
          refreshAdminOrders(),
          refreshPayments(),
          refreshPurchaseOrders(),
        ]);
      } catch (error) {
        if (!isMounted) return;

        if (isAdminAccessError(error)) {
          clearAdminSession();
          setIsLoggedIn(false);
          setError("Tu sesion admin expiro. Ingresa nuevamente.");
        }
      }
    }

    void refreshAdminData();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  async function refreshAdminOrders() {
    const response = await getBackendOrders();
    setAdminOrders(response);
  }

  async function refreshPayments() {
    const response = await getPayments();
    setPayments(response);
  }

  async function refreshPurchaseOrders() {
    const response = await getPurchaseOrders();
    setPurchaseOrders(response);
  }

  async function refreshAdminQuotes() {
    try {
      const response = await getAdminQuoteRequests();
      setQuotes(response.map(toAdminQuote));
    } catch {
      setQuotes([]);
    }
  }

  async function refreshAdminProducts() {
    const response = await getProducts();

    setAllProducts(response.data);
    setUploadedProducts(response.data);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loginAdmin(username, password);
      setIsLoggedIn(true);
      setPassword("");
      setError("");
      return;
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Usuario o password incorrecto.");
    }
  }

  async function handleLogout() {
    await logoutAdmin();
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  }

  async function handleDeleteQuote(id: string) {
    const quote = quotes.find((currentQuote) => currentQuote.id === id);

    if (!quote) return;

    await deleteQuoteRequest(quote.backendId);
    setQuotes((currentQuotes) => currentQuotes.filter((currentQuote) => currentQuote.id !== id));

    if (selectedQuoteId === id) {
      setSelectedQuoteId(null);
    }
  }

  function handleProductImageChange(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    const invalidFile = selectedFiles.find((file) => !["image/png", "image/jpeg", "image/webp"].includes(file.type));
    if (invalidFile) {
      setProductFormMessage("Las imágenes deben ser PNG, JPG o WEBP.");
      return;
    }

    setProductFormMessage("Procesando imágenes...");

    Promise.all(selectedFiles.map(fileToProductImage))
      .then((images) => {
        setProductForm((currentForm) => ({
          ...currentForm,
          images: images.map((image) => image.url),
          imageNames: images.map((image) => image.name),
        }));
        setProductFormMessage(`${images.length} imagen(es) listas para guardar.`);
      })
      .catch(() => setProductFormMessage("No se pudieron procesar las imágenes."));
  }

  async function handleUploadProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = Number(productForm.price);

    if (!productForm.name.trim()) {
      setProductFormMessage("Ingresa el nombre del producto.");
      return;
    }

    if (productForm.images.length === 0) {
      setProductFormMessage("Sube al menos una imagen del producto.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setProductFormMessage("Ingresa un precio valido.");
      return;
    }

    if (price === 0 && productForm.availability !== "Personalizado") {
      setProductFormMessage("El precio 0 solo se permite para productos personalizados.");
      return;
    }

    if (!productForm.size.trim()) {
      setProductFormMessage("Ingresa las medidas de la alfombra.");
      return;
    }

    try {
      const productInput = {
        name: productForm.name.trim(),
        price,
        image: productForm.images[0],
        images: productForm.images,
        size: productForm.size.trim(),
        availability: productForm.availability,
        category: productForm.category,
        collection: productForm.category,
        bestSeller: false,
        newArrival: true,
      };

      if (productForm.id) {
        const updatedProduct = await updateUploadedProduct(productForm.id, productInput);

        if (updatedProduct) {
          await refreshAdminProducts();
        }

        setProductForm(emptyProductForm);
        setProductFormMessage("Producto actualizado.");
        return;
      }

      await saveUploadedProduct(productInput);

      await refreshAdminProducts();
      setProductForm(emptyProductForm);
      setProductFormMessage("Producto subido y disponible en la tienda.");
    } catch (error) {
      const backendMessage = axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : null;
      const status = axios.isAxiosError(error) ? error.response?.status : null;
      setProductFormMessage(backendMessage || (status ? `No se pudo guardar el producto. Error ${status}.` : "No se pudo guardar el producto."));
    }
  }

  async function handleDeleteUploadedProduct(id: Product["id"]) {
    await deleteUploadedProduct(id);
    await refreshAdminProducts();

    if (String(productForm.id) === String(id)) {
      setProductForm(emptyProductForm);
      setProductFormMessage("Edicion cancelada porque el producto fue eliminado.");
    }
  }

  function handleEditUploadedProduct(product: Product) {
    setProductForm({
      id: String(product.id),
      name: product.name,
      category: product.category ?? product.collection ?? visibleCategories[0]?.name ?? "Custom Rugs",
      price: String(product.price),
      size: product.size ?? "",
      availability: product.availability ?? availabilityOptions[0],
      images: product.images && product.images.length > 0 ? product.images : [product.image],
      imageNames: [],
    });
    setProductFormMessage("Editando producto. Puedes cambiar datos, estado o imágenes.");
    setActiveSection("upload");
  }

  function countProductsByCategory(categoryName: string) {
    return allProducts.filter((product) => product.category === categoryName || product.collection === categoryName).length;
  }

  function handleSaveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = categoryForm.name.trim();

    if (!name) {
      setCategoryMessage("Ingresa el nombre de la categoría.");
      return;
    }

    const duplicatedCategory = categories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase() && category.id !== categoryForm.id,
    );

    if (duplicatedCategory) {
      setCategoryMessage("Ya existe una categoría con ese nombre.");
      return;
    }

    if (categoryForm.id) {
      const previousCategory = categories.find((category) => category.id === categoryForm.id);
      updateCategory(categoryForm.id, { name, status: categoryForm.status });

      if (previousCategory && previousCategory.name !== name && productForm.category === previousCategory.name) {
        setProductForm((currentForm) => ({ ...currentForm, category: name }));
      }

      setCategoryMessage("Categoría actualizada.");
    } else {
      saveCategory({ name, status: categoryForm.status });
      setCategoryMessage("Categoría creada.");
    }

    const nextCategories = getCategories();
    setCategories(nextCategories);
    setCategoryForm(emptyCategoryForm);
  }

  function handleEditCategory(category: Category) {
    setCategoryForm(category);
    setCategoryMessage("Editando categoría.");
  }

  function handleDeleteCategory(id: string) {
    const category = categories.find((currentCategory) => currentCategory.id === id);

    deleteCategory(id);
    const nextCategories = getCategories();
    setCategories(nextCategories);

    if (category?.name === productForm.category) {
      setProductForm((currentForm) => ({
        ...currentForm,
        category: nextCategories.find((nextCategory) => nextCategory.status === "Visible")?.name ?? "Custom Rugs",
      }));
    }

    if (categoryForm.id === id) {
      setCategoryForm(emptyCategoryForm);
    }

    setCategoryMessage("Categoría eliminada.");
  }

  function handleViewShipping(order: Order) {
    setSelectedOrderId(String(order.id));
    setShippingForm({
      orderId: String(order.id),
      trackingNumber: order.trackingNumber ?? "",
      shippingStatus: order.shippingStatus ?? order.status ?? shippingStatusOptions[0],
    });
    setShippingMessage(`Editando envío ${order.id}.`);
  }

  async function handleSaveShipping(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSelectedOrderShipping();
  }

  async function saveSelectedOrderShipping() {
    if (!shippingForm.orderId) {
      setShippingMessage("Selecciona un pedido con Ver.");
      return;
    }

    await updateOrderShipping(shippingForm.orderId, {
      trackingNumber: shippingForm.trackingNumber.trim(),
      shippingStatus: shippingForm.shippingStatus,
    });

    await refreshAdminOrders();
    setShippingMessage("Envío actualizado. El cliente ya puede verlo en seguimiento.");
  }

  function handleCloseShipping() {
    setShippingForm(emptyShippingForm);
    setShippingMessage("");
  }

  function handleDeleteShippingOrder() {
    setShippingMessage("Los pedidos no se eliminan desde envios. Cambia su estado desde Ordenes.");
  }

  function handleNewPayment() {
    setPaymentForm(emptyPaymentForm);
    setPaymentMessage("Los pagos se crean desde pedidos o checkout. Selecciona un pago existente para cambiar su estado.");
    setIsPaymentModalOpen(false);
  }

  function handleViewPayment(payment: Payment) {
    setPaymentForm({
      id: String(payment.id),
      client: payment.order?.customerName ?? payment.order?.email ?? payment.provider,
      total: String(payment.amount),
      status: payment.status,
    });
    setPaymentMessage("");
    setIsPaymentModalOpen(true);
  }

  async function handleSavePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const paymentId = Number(paymentForm.id);

    if (paymentForm.status === "PAID" || paymentForm.status === "Pagado") {
      await confirmPayment(paymentId);
    } else if (paymentForm.status === "FAILED" || paymentForm.status === "Rechazado") {
      await failPayment(paymentId);
    }

    await refreshPayments();
    setPaymentMessage("Pago actualizado.");

    setPaymentForm(emptyPaymentForm);
    setIsPaymentModalOpen(false);
  }

  function handleClosePayment() {
    setPaymentForm(emptyPaymentForm);
    setPaymentMessage("");
    setIsPaymentModalOpen(false);
  }

  async function handleDeletePayment(id: number) {
    if (!window.confirm("¿Eliminar este pago? Esta acción no se puede deshacer.")) return;
    await deletePayment(id);
    await refreshPayments();
    setPaymentForm(emptyPaymentForm);
    setIsPaymentModalOpen(false);
    setPaymentMessage("Pago eliminado.");
  }

  function handleNewPurchaseOrder() {
    setPurchaseOrderForm(emptyPurchaseOrderForm);
    setPurchaseOrderMessage("");
    setIsPurchaseOrderModalOpen(true);
  }

  function handleSelectPurchaseOrder(purchaseOrder: PurchaseOrder) {
    setSelectedPurchaseOrderId((currentId) => (currentId === purchaseOrder.id ? null : purchaseOrder.id));
    setPurchaseOrderMessage("");
  }

  function handleViewPurchaseOrder(purchaseOrder: PurchaseOrder) {
    setPurchaseOrderForm({
      id: String(purchaseOrder.id),
      client: purchaseOrder.client,
      provider: purchaseOrder.provider,
      status: purchaseOrder.status,
      total: String(purchaseOrder.total),
      relatedOrderNumber: purchaseOrder.relatedOrderNumber ?? "",
      notes: purchaseOrder.notes ?? "",
    });
    setPurchaseOrderMessage("");
    setIsPurchaseOrderModalOpen(true);
  }

  async function handleSavePurchaseOrderNotes(purchaseOrder: PurchaseOrder) {
    await updatePurchaseOrder(purchaseOrder.id, {
      client: purchaseOrder.client,
      provider: purchaseOrder.provider,
      status: purchaseOrder.status,
      total: purchaseOrder.total,
      relatedOrderNumber: purchaseOrder.relatedOrderNumber ?? "",
      notes: purchaseOrder.notes ?? "",
    });
    await refreshPurchaseOrders();
    setPurchaseOrderMessage("Notas de orden de compra guardadas.");
  }

  async function handleSavePurchaseOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = {
      client: purchaseOrderForm.client.trim(),
      provider: purchaseOrderForm.provider.trim(),
      status: purchaseOrderForm.status,
      total: Number(purchaseOrderForm.total),
      relatedOrderNumber: purchaseOrderForm.relatedOrderNumber.trim(),
      notes: purchaseOrderForm.notes.trim(),
    };

    if (purchaseOrderForm.id) {
      await updatePurchaseOrder(Number(purchaseOrderForm.id), input);
      setPurchaseOrderMessage("Orden de compra actualizada.");
    } else {
      await createPurchaseOrder(input);
      setPurchaseOrderMessage("Orden de compra creada.");
    }

    await refreshPurchaseOrders();
    setPurchaseOrderForm(emptyPurchaseOrderForm);
    setIsPurchaseOrderModalOpen(false);
  }

  async function handleDeletePurchaseOrder() {
    if (!purchaseOrderForm.id) return;

    await handleDeletePurchaseOrderById(Number(purchaseOrderForm.id));
    setPurchaseOrderForm(emptyPurchaseOrderForm);
    setIsPurchaseOrderModalOpen(false);
  }

  async function handleDeletePurchaseOrderById(id: PurchaseOrder["id"]) {
    await deletePurchaseOrder(id);
    await refreshPurchaseOrders();
    if (selectedPurchaseOrderId === id) {
      setSelectedPurchaseOrderId(null);
    }
    setPurchaseOrderMessage("Orden de compra eliminada.");
  }

  function handleClosePurchaseOrder() {
    setPurchaseOrderForm(emptyPurchaseOrderForm);
    setIsPurchaseOrderModalOpen(false);
  }

  const filteredQuotes = quotes.filter((quote) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [quote.id, quote.type, quote.client, quote.date].some((value) => value.toLowerCase().includes(query));
  });

  const quoteClients = quotes.reduce<Array<{ name: string; email: string; quotes: string; lastOrder: string }>>((accumulator, quote) => {
    const existingClient = accumulator.find((client) => client.email === quote.email);

    if (existingClient) {
      existingClient.quotes = String(Number(existingClient.quotes) + 1);
      return accumulator;
    }

    accumulator.push({
      name: quote.client,
      email: quote.email,
      quotes: "1",
      lastOrder: quote.date,
    });

    return accumulator;
  }, clients.length > 0 && quotes.length === 0 ? clients : []);

  const filteredClients = quoteClients.filter((client) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [client.name, client.email, client.lastOrder].some((value) => value.toLowerCase().includes(query));
  });

  const currentSection = sectionCopy[activeSection];
  const showQuoteTools = activeSection === "quotes";
  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId);
  const selectedOrder = adminOrders.find((order) => String(order.id) === selectedOrderId);
  const selectedPurchaseOrder = purchaseOrders.find((purchaseOrder) => purchaseOrder.id === selectedPurchaseOrderId);
  const visibleCategories = categories.filter((category) => category.status === "Visible");
  const adminQuery = search.trim().toLowerCase();
  const filteredAdminOrders = adminOrders.filter((order) => {
    if (!adminQuery) return true;
    return [
      String(order.id),
      order.orderNumber ?? "",
      order.customerName,
      order.email,
      order.status,
      order.paymentMethod,
    ].some((value) => value.toLowerCase().includes(adminQuery));
  });
  const filteredPurchaseOrders = purchaseOrders.filter((purchaseOrder) => {
    if (!adminQuery) return true;
    return [
      purchaseOrder.purchaseOrderNumber,
      purchaseOrder.relatedOrderNumber ?? "",
      purchaseOrder.client,
      purchaseOrder.provider,
      purchaseOrder.status,
    ].some((value) => value.toLowerCase().includes(adminQuery));
  });
  const selectedPurchaseOrderRelatedOrder = selectedPurchaseOrder
    ? adminOrders.find((order) =>
        [String(order.id), order.orderNumber ?? ""].includes(selectedPurchaseOrder.relatedOrderNumber ?? ""),
      )
    : undefined;
  const getRelatedOrder = (purchaseOrder: PurchaseOrder) =>
    adminOrders.find((order) => [String(order.id), order.orderNumber ?? ""].includes(purchaseOrder.relatedOrderNumber ?? ""));

  return (
    <>
      <Navbar />

      <main className="admin-page">
        {isLoggedIn ? (
          <div className="admin-dashboard">
            <aside className="admin-sidebar" aria-label="Menu de administrador">
              <strong>Admin</strong>
              <nav>
                {adminSections.map((item) => (
                  <button
                    type="button"
                    className={activeSection === item.id ? "is-active" : ""}
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSelectedQuoteId(null);
                      setSelectedOrderId(null);
                      setSelectedPurchaseOrderId(null);
                    }}
                  >
                    <span aria-hidden="true"><img src={item.icon} alt="" /></span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <section className="admin-workspace">
              <header className="admin-toolbar">
                <div>
                  <h1>{currentSection.title}</h1>
                  <p>{currentSection.description}</p>
                </div>

                <div className="admin-toolbar-actions">
                  {showQuoteTools && !selectedQuote && (
                    <>
                      <button type="button" className={activeView === "quotes" ? "is-active" : ""} onClick={() => setActiveView("quotes")}>
                        Cotizaciones
                      </button>
                      <button type="button" className={activeView === "clients" ? "is-active" : ""} onClick={() => setActiveView("clients")}>
                        Clientes
                      </button>
                    </>
                  )}
                  {activeSection === "upload" ? (
                    <button type="submit" form="admin-product-form" className="admin-add-button">
                      {productForm.id ? "Guardar cambios" : "+ Subir producto"}
                    </button>
                  ) : activeSection === "categories" ? (
                    <button
                      type="button"
                      className="admin-add-button"
                      onClick={() => {
                        setCategoryForm(emptyCategoryForm);
                        setCategoryMessage("Nueva categoría.");
                      }}
                    >
                      + Nuevo
                    </button>
                  ) : activeSection === "shipping" || activeSection === "orders" ? null : activeSection === "products" ? null : (
                    <button
                      type="button"
                      className="admin-add-button"
                      onClick={
                        activeSection === "payments"
                          ? handleNewPayment
                          : activeSection === "purchase-orders"
                            ? handleNewPurchaseOrder
                            : undefined
                      }
                    >
                      + Nuevo
                    </button>
                  )}
                  <button type="button" onClick={handleLogout}>Salir</button>
                </div>
              </header>

              <section className="admin-data-panel">
                {showQuoteTools && !selectedQuote && (
                  <>
                    <div className="admin-filters">
                      <label>
                        <span>Periodo</span>
                        <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                          <option>Todos</option>
                          <option>Ultimos 7 dias</option>
                          <option>Este mes</option>
                          <option>Este anio</option>
                        </select>
                      </label>

                      <label>
                        <span>Inicio</span>
                        <input type="date" />
                      </label>

                      <label>
                        <span>Fin</span>
                        <input type="date" />
                      </label>

                      <label className="admin-search">
                        <span>Palabra clave</span>
                        <input
                          type="search"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Cliente, email, producto, número"
                        />
                      </label>

                      <label>
                        <span>Mostrar</span>
                        <select value={limit} onChange={(event) => setLimit(event.target.value)}>
                          <option>10</option>
                          <option>25</option>
                          <option>50</option>
                        </select>
                      </label>

                      <button type="button" className="admin-csv-button">CSV</button>
                    </div>

                    <p className="admin-result-count">
                      Mostrando {activeView === "quotes" ? filteredQuotes.length : filteredClients.length} resultado(s).
                    </p>
                  </>
                )}

                <div className="admin-table-wrap">
                  {selectedQuote ? (
                    <div className="quote-detail">
                      <header className="quote-detail-header">
                        <div>
                          <h2>Detalle de cotización</h2>
                          <p>{selectedQuote.id} Â· {selectedQuote.date}, {selectedQuote.time}</p>
                        </div>

                        <div className="quote-detail-actions">
                          <button type="button" onClick={() => setSelectedQuoteId(null)}>Cerrar</button>
                          <button type="button" className="info">CSV</button>
                          <button type="button" className="success">PDF</button>
                          <button type="button" className="danger" onClick={() => handleDeleteQuote(selectedQuote.id)}>Eliminar</button>
                          <button type="button" className="edit">Editar</button>
                        </div>
                      </header>

                      <div className="quote-detail-grid">
                        <article>
                          <h3>Cliente</h3>
                          <p><strong>Empresa:</strong> {selectedQuote.client}</p>
                          <p><strong>Nombre:</strong> {selectedQuote.contact}</p>
                          <p><strong>RUT:</strong> {selectedQuote.rut}</p>
                          <p><strong>Email:</strong> {selectedQuote.email}</p>
                          <p><strong>Teléfono:</strong> {selectedQuote.phone}</p>
                          <p><strong>Dirección:</strong> {selectedQuote.address}</p>
                        </article>

                        <article>
                          <h3>Resumen</h3>
                          <dl className="quote-summary-list">
                            <dt>Tipo</dt><dd>{selectedQuote.type}</dd>
                            <dt>Estado</dt><dd>{selectedQuote.status}</dd>
                            <dt>Enviado</dt><dd>{selectedQuote.sent ? "Si" : "No"}</dd>
                            <dt>Condicion de pago</dt><dd>Contado</dd>
                            <dt>Método de pago</dt><dd>Por definir</dd>
                            <dt>Vigencia</dt><dd>15 dias</dd>
                            <dt>Plazo entrega</dt><dd>-</dd>
                            <dt>Envío neto</dt><dd>{formatClp(0)}</dd>
                            <dt>Total</dt><dd>{formatClp(selectedQuote.total)}</dd>
                          </dl>
                        </article>
                      </div>

                      <article className="quote-detail-card">
                        <h3>Artículos</h3>
                        <table className="quote-items-table">
                          <thead>
                            <tr>
                              <th>Cant.</th>
                              <th>Descripcion</th>
                              <th>Variable</th>
                              <th>Precio uni.</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>{selectedQuote.size}</td>
                              <td>{selectedQuote.wool} / {selectedQuote.colors}</td>
                              <td>{formatClp(selectedQuote.total)}</td>
                              <td>{formatClp(selectedQuote.total)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </article>

                      <div className="quote-notes-grid">
                        <article>
                          <h3>Mensaje</h3>
                          <p>{selectedQuote.message}</p>
                          <p><strong>Imagen:</strong> {selectedQuote.imageName}</p>
                        </article>
                        <article>
                          <h3>Nota publica</h3>
                          <p>-</p>
                        </article>
                        <article>
                          <h3>Nota privada</h3>
                          <p>-</p>
                        </article>
                      </div>
                    </div>
                  ) : showQuoteTools && activeView === "quotes" ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Número</th>
                          <th>Tipo</th>
                          <th>Cliente</th>
                          <th>Total</th>
                          <th>Enviado</th>
                          <th>Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuotes.map((quote) => (
                          <tr key={quote.id}>
                            <td>{quote.date}</td>
                            <td>
                              <button
                                type="button"
                                className="quote-number-button"
                                onClick={() => setSelectedQuoteId(quote.id)}
                              >
                                {quote.id}
                              </button>
                            </td>
                            <td>{quote.type}</td>
                            <td>{quote.client}</td>
                            <td>{formatClp(quote.total)}</td>
                            <td>{quote.sent ? "Si" : "No"}</td>
                            <td>
                              <button type="button" onClick={() => setSelectedQuoteId(quote.id)}>Ver</button>
                              <button type="button" className="danger" onClick={() => handleDeleteQuote(quote.id)}>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : showQuoteTools ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Email</th>
                          <th>Cotizaciones</th>
                          <th>Ultimo pedido</th>
                          <th>Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.map((client) => (
                          <tr key={client.email}>
                            <td>{client.name}</td>
                            <td>{client.email}</td>
                            <td>{client.quotes}</td>
                            <td>{client.lastOrder}</td>
                            <td><button type="button">Ver</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : activeSection === "orders" ? (
                    <div className="admin-linked-section">
                      <div className="admin-linked-search">
                        <input
                          type="search"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Buscar por numero, cliente, email, pago o estado"
                        />
                        <button type="button">Buscar</button>
                      </div>

                      <table className="admin-table admin-linked-table">
                        <thead>
                          <tr>
                            <th>Orden</th>
                            <th>Cliente</th>
                            <th>Estado</th>
                            <th>Total</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdminOrders.length > 0 ? (
                            filteredAdminOrders.map((order) => (
                              <tr key={order.id} className={String(order.id) === selectedOrderId ? "is-open" : ""}>
                                <td>
                                  <strong>{order.orderNumber ?? `Orden #${order.id}`}</strong>
                                  <span>Pedido #{order.id}</span>
                                  <span>{new Date(order.createdAt).toLocaleString("es-CL")}</span>
                                </td>
                                <td>
                                  <strong>{order.email}</strong>
                                  <span>{order.customerName}</span>
                                  <span>{order.paymentMethod}</span>
                                </td>
                                <td>{order.shippingStatus || order.status}</td>
                                <td>{formatClp(order.total)}</td>
                                <td>
                                  <button type="button" className="success" onClick={() => handleViewShipping(order)}>Ver</button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (String(order.id) === selectedOrderId) {
                                        setSelectedOrderId(null);
                                        return;
                                      }

                                      handleViewShipping(order);
                                    }}
                                  >
                                    {String(order.id) === selectedOrderId ? "Ocultar" : "Editar"}
                                  </button>
                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={async () => {
                                      if (!window.confirm(`¿Eliminar la orden #${order.id}? Esta acción no se puede deshacer.`)) return;
                                      await deleteBackendOrder(order.id);
                                      await refreshAdminOrders();
                                      if (String(order.id) === selectedOrderId) setSelectedOrderId(null);
                                    }}
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5}>Aun no hay ordenes registradas.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {selectedOrder && (
                        <div className="modal-overlay" onClick={() => setSelectedOrderId(null)}>
                          <div className="modal-content admin-order-modal" onClick={(e) => e.stopPropagation()}>
                            <header className="admin-detail-title">
                              <div>
                                <h2>Orden #{selectedOrder.id}</h2>
                                <p>Creada: {new Date(selectedOrder.createdAt).toLocaleString("es-CL")}</p>
                              </div>
                              <button type="button" onClick={() => setSelectedOrderId(null)}>✕</button>
                            </header>

                            <div className="admin-order-detail-grid">
                              <section className="admin-detail-card">
                                <h3>Informacion del Cliente</h3>
                                <div className="admin-two-col">
                                  <p><span>Nombre</span><strong>{selectedOrder.customerName}</strong></p>
                                  <p><span>Email</span><strong>{selectedOrder.email}</strong></p>
                                  <p><span>Telefono</span><strong>-</strong></p>
                                  <p><span>RUT</span><strong>-</strong></p>
                                  <p><span>Dirección</span><strong>{selectedOrder.address}</strong></p>
                                </div>
                              </section>

                              <section className="admin-detail-card admin-side-card">
                                <h3>Estado del Pedido</h3>
                                <label>
                                  <span>Estado actual</span>
                                  <select
                                    value={shippingForm.shippingStatus}
                                    onChange={(event) => setShippingForm((currentForm) => ({ ...currentForm, shippingStatus: event.target.value }))}
                                  >
                                    {shippingStatusOptions.map((status) => <option key={status}>{status}</option>)}
                                  </select>
                                </label>
                                <p><span>Metodo de pago</span><strong>{selectedOrder.paymentMethod}</strong></p>
                              </section>

                              <section className="admin-detail-card admin-side-card">
                                <h3>Tracking</h3>
                                <label>
                                  <span>Numero de seguimiento</span>
                                  <input
                                    value={shippingForm.trackingNumber}
                                    onChange={(event) => setShippingForm((currentForm) => ({ ...currentForm, trackingNumber: event.target.value }))}
                                    placeholder="Ej: 123456789"
                                  />
                                </label>
                                <label>
                                  <span>URL de seguimiento</span>
                                  <input value={selectedOrder.trackingNumber ? `https://tracking/${selectedOrder.trackingNumber}` : ""} readOnly placeholder="https://..." />
                                </label>
                              </section>

                              <section className="admin-detail-card">
                                <h3>Productos</h3>
                                {selectedOrder.items.map((item) => (
                                  <div className="admin-product-line" key={`${item.id}-${item.name}`}>
                                    <p>
                                      <strong>{item.name}</strong>
                                      <span>Cantidad: {item.quantity} × {formatClp(item.price)}</span>
                                    </p>
                                    <strong>{formatClp(item.price * item.quantity)}</strong>
                                  </div>
                                ))}
                                <div className="admin-total-line"><span>Total</span><strong>{formatClp(selectedOrder.total)}</strong></div>
                              </section>

                              <section className="admin-detail-card admin-side-card">
                                <h3>Notas Internas</h3>
                                <textarea placeholder="Notas privadas del administrador..." />
                                <button type="button" className="admin-add-button" onClick={() => void saveSelectedOrderShipping()}>Guardar orden</button>
                                <button
                                  type="button"
                                  className="admin-delete-order-button"
                                  onClick={async () => {
                                    if (!window.confirm(`¿Eliminar la orden #${selectedOrder.id}? Esta acción no se puede deshacer.`)) return;
                                    await deleteBackendOrder(selectedOrder.id);
                                    setSelectedOrderId(null);
                                    await refreshAdminOrders();
                                  }}
                                >
                                  Eliminar orden
                                </button>
                              </section>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : activeSection === "purchase-orders" ? (
                    <div className="admin-payment-section">
                      {purchaseOrderMessage && <p className="admin-shipping-message">{purchaseOrderMessage}</p>}

                      {isPurchaseOrderModalOpen && (
                        <div className="admin-modal-backdrop" role="presentation" onMouseDown={handleClosePurchaseOrder}>
                          <form
                            className="admin-modal admin-payment-modal"
                            onSubmit={handleSavePurchaseOrder}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="purchase-order-modal-title"
                            onMouseDown={(event) => event.stopPropagation()}
                          >
                            <header className="admin-modal-header">
                              <div>
                                <span>{purchaseOrderForm.id ? "Editar orden de compra" : "Nueva orden de compra"}</span>
                                <h3 id="purchase-order-modal-title">{purchaseOrderForm.client || "Orden de compra"}</h3>
                              </div>
                              <button type="button" className="admin-modal-close" onClick={handleClosePurchaseOrder} aria-label="Cerrar">
                                x
                              </button>
                            </header>

                            <div className="admin-payment-form">
                              <label>
                                <span>Cliente</span>
                                <input value={purchaseOrderForm.client} onChange={(event) => setPurchaseOrderForm((current) => ({ ...current, client: event.target.value }))} />
                              </label>
                              <label>
                                <span>Proveedor</span>
                                <input value={purchaseOrderForm.provider} onChange={(event) => setPurchaseOrderForm((current) => ({ ...current, provider: event.target.value }))} />
                              </label>
                              <label>
                                <span>Total</span>
                                <input type="number" min="0" value={purchaseOrderForm.total} onChange={(event) => setPurchaseOrderForm((current) => ({ ...current, total: event.target.value }))} />
                              </label>
                              <label>
                                <span>Pedido asociado</span>
                                <select
                                  value={purchaseOrderForm.relatedOrderNumber}
                                  onChange={(event) => {
                                    const relatedOrder = adminOrders.find((order) =>
                                      [String(order.id), order.orderNumber ?? ""].includes(event.target.value),
                                    );

                                    setPurchaseOrderForm((current) => ({
                                      ...current,
                                      relatedOrderNumber: event.target.value,
                                      client: relatedOrder?.email ?? current.client,
                                      total: relatedOrder ? String(relatedOrder.total) : current.total,
                                    }));
                                  }}
                                >
                                  <option value="">Sin pedido asociado</option>
                                  {adminOrders.map((order) => (
                                    <option key={order.id} value={order.orderNumber ?? String(order.id)}>
                                      {(order.orderNumber ?? `#${order.id}`)} - {order.customerName} - {order.email}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                <span>Estado</span>
                                <select value={purchaseOrderForm.status} onChange={(event) => setPurchaseOrderForm((current) => ({ ...current, status: event.target.value }))}>
                                  {purchaseOrderStatusOptions.map((status) => <option key={status}>{status}</option>)}
                                </select>
                              </label>
                              <label>
                                <span>Notas</span>
                                <input value={purchaseOrderForm.notes} onChange={(event) => setPurchaseOrderForm((current) => ({ ...current, notes: event.target.value }))} />
                              </label>
                            </div>

                            <footer className="admin-modal-actions">
                              {purchaseOrderForm.id ? (
                                <button type="button" className="admin-delete-button" onClick={handleDeletePurchaseOrder}>Eliminar</button>
                              ) : <span />}
                              <div>
                                <button type="button" className="admin-cancel-edit-button" onClick={handleClosePurchaseOrder}>Cancelar</button>
                                <button type="submit" className="admin-add-button">Guardar</button>
                              </div>
                            </footer>
                          </form>
                        </div>
                      )}

                      <div className="admin-linked-search">
                        <input
                          type="search"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Buscar por numero, pedido, email o estado"
                        />
                        <button type="button">Buscar</button>
                      </div>

                      <table className="admin-table admin-linked-table">
                        <thead>
                          <tr>
                            <th>Orden de compra</th>
                            <th>Cliente</th>
                            <th>Estado</th>
                            <th>Total</th>
                            <th>Accion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPurchaseOrders.length > 0 ? filteredPurchaseOrders.map((purchaseOrder) => (
                            <tr key={purchaseOrder.id} className={purchaseOrder.id === selectedPurchaseOrderId ? "is-open" : ""}>
                              <td>
                                <strong>{purchaseOrder.purchaseOrderNumber}</strong>
                                <span>{purchaseOrder.relatedOrderNumber ? `Pedido ${purchaseOrder.relatedOrderNumber}` : "Sin pedido asociado"}</span>
                                <span>{new Date(purchaseOrder.createdAt).toLocaleString("es-CL")}</span>
                              </td>
                              <td>
                                <strong>{purchaseOrder.client}</strong>
                                <span>{purchaseOrder.provider}</span>
                                <span>{getRelatedOrder(purchaseOrder)?.paymentMethod ?? "-"}</span>
                              </td>
                              <td>{purchaseOrder.status}</td>
                              <td>{formatClp(purchaseOrder.total)}</td>
                              <td>
                                <button type="button" className="success" onClick={() => window.print()}>Ver PDF</button>
                                <button type="button" onClick={() => handleSelectPurchaseOrder(purchaseOrder)}>
                                  {purchaseOrder.id === selectedPurchaseOrderId ? "Ocultar" : "Ver"}
                                </button>
                                <button type="button" onClick={() => handleViewPurchaseOrder(purchaseOrder)}>Editar</button>
                                <button type="button" className="danger" onClick={() => void handleDeletePurchaseOrderById(purchaseOrder.id)}>Eliminar</button>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5}>Aun no hay ordenes de compra.</td></tr>
                          )}
                        </tbody>
                      </table>

                      {selectedPurchaseOrder && (
                        <div className="admin-purchase-detail">
                          <section className="admin-detail-card">
                            <h3>Detalle orden de compra</h3>
                            <dl className="quote-summary-list">
                              <dt>OC</dt><dd>{selectedPurchaseOrder.purchaseOrderNumber}</dd>
                              <dt>Pedido</dt><dd>{selectedPurchaseOrder.relatedOrderNumber || "-"}</dd>
                              <dt>Email</dt><dd>{selectedPurchaseOrderRelatedOrder?.email ?? "-"}</dd>
                              <dt>Cliente</dt><dd>{selectedPurchaseOrder.client}</dd>
                              <dt>Estado</dt><dd>{selectedPurchaseOrder.status}</dd>
                              <dt>Pago</dt><dd>{selectedPurchaseOrderRelatedOrder?.paymentMethod ?? "-"}</dd>
                              <dt>Total</dt><dd>{formatClp(selectedPurchaseOrder.total)}</dd>
                            </dl>
                          </section>

                          <section className="admin-detail-card">
                            <h3>Comentarios (solo admin / PDF)</h3>
                            <label>
                              <span>Notas cliente</span>
                              <textarea
                                value={selectedPurchaseOrder.notes ?? ""}
                                onChange={(event) => setPurchaseOrders((currentOrders) =>
                                  currentOrders.map((currentOrder) =>
                                    currentOrder.id === selectedPurchaseOrder.id
                                      ? { ...currentOrder, notes: event.target.value }
                                      : currentOrder,
                                  ),
                                )}
                                placeholder="Notas del cliente para mostrar en PDF..."
                              />
                            </label>
                            <label>
                              <span>Notas admin</span>
                              <textarea placeholder="Notas internas del admin para incluir en el PDF..." />
                            </label>
                            <button type="button" className="admin-add-button" onClick={() => handleSavePurchaseOrderNotes(selectedPurchaseOrder)}>
                              Guardar comentarios
                            </button>
                          </section>
                        </div>
                      )}
                    </div>
                  ) : activeSection === "payments" ? (
                    <div className="admin-payment-section">
                      {paymentMessage && <p className="admin-shipping-message">{paymentMessage}</p>}

                      {isPaymentModalOpen && (
                        <div className="admin-modal-backdrop" role="presentation" onMouseDown={handleClosePayment}>
                          <form
                            className="admin-modal admin-payment-modal"
                            onSubmit={handleSavePayment}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="payment-modal-title"
                            onMouseDown={(event) => event.stopPropagation()}
                          >
                            <header className="admin-modal-header">
                              <div>
                                <span>{paymentForm.id ? "Editar pago" : "Nuevo pago"}</span>
                                <h3 id="payment-modal-title">{paymentForm.client || "Pago"}</h3>
                              </div>
                              <button type="button" className="admin-modal-close" onClick={handleClosePayment} aria-label="Cerrar">
                                x
                              </button>
                            </header>

                            <div className="admin-payment-form">
                              <label>
                                <span>Cliente</span>
                                <input
                                  type="text"
                                  value={paymentForm.client}
                                  onChange={(event) => setPaymentForm((currentForm) => ({ ...currentForm, client: event.target.value }))}
                                  placeholder="Cliente o empresa"
                                />
                              </label>

                              <label>
                                <span>Total</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={paymentForm.total}
                                  onChange={(event) => setPaymentForm((currentForm) => ({ ...currentForm, total: event.target.value }))}
                                  placeholder="99000"
                                />
                              </label>

                              <label>
                                <span>Estado</span>
                                <select
                                  value={paymentForm.status}
                                  onChange={(event) => setPaymentForm((currentForm) => ({ ...currentForm, status: event.target.value }))}
                                >
                                  {paymentStatusOptions.map((status) => (
                                    <option key={status}>{status}</option>
                                  ))}
                                </select>
                              </label>
                            </div>

                            <footer className="admin-modal-actions">
                              {paymentForm.id ? (
                                <button type="button" className="admin-delete-button" onClick={() => void handleDeletePayment(Number(paymentForm.id))}>
                                  Eliminar pago
                                </button>
                              ) : (
                                <span />
                              )}
                              <div>
                                <button type="button" className="admin-cancel-edit-button" onClick={handleClosePayment}>
                                  Cancelar
                                </button>
                                <button type="submit" className="admin-add-button">
                                  Guardar pago
                                </button>
                              </div>
                            </footer>
                          </form>
                        </div>
                      )}

                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Accion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td>{payment.order?.customerName ?? payment.order?.email ?? payment.provider}</td>
                              <td>{formatClp(payment.amount)}</td>
                              <td>{payment.status}</td>
                              <td>
                                <button type="button" onClick={() => handleViewPayment(payment)}>Ver</button>
                                <button type="button" onClick={() => handleViewPayment(payment)}>Editar</button>
                                <button type="button" className="danger" onClick={() => void handleDeletePayment(payment.id)}>Eliminar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeSection === "shipping" ? (
                    <div className="admin-shipping-section">
                      {shippingMessage && <p className="admin-shipping-message">{shippingMessage}</p>}

                      {shippingForm.orderId && (
                        <div className="admin-modal-backdrop" role="presentation" onMouseDown={handleCloseShipping}>
                          <form
                            className="admin-modal admin-shipping-modal"
                            onSubmit={(event) => {
                              handleSaveShipping(event);
                              setShippingForm(emptyShippingForm);
                            }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="shipping-modal-title"
                            onMouseDown={(event) => event.stopPropagation()}
                          >
                            <header className="admin-modal-header">
                              <div>
                                <span>Editar envio</span>
                                <h3 id="shipping-modal-title">{shippingForm.orderId}</h3>
                              </div>
                              <button type="button" className="admin-modal-close" onClick={handleCloseShipping} aria-label="Cerrar">
                                x
                              </button>
                            </header>

                            <div className="admin-shipping-form">
                              <label>
                                <span>Pedido</span>
                                <input type="text" value={shippingForm.orderId} readOnly />
                              </label>

                              <label>
                                <span>Numero de envio</span>
                                <input
                                  type="text"
                                  value={shippingForm.trackingNumber}
                                  onChange={(event) => setShippingForm((currentForm) => ({ ...currentForm, trackingNumber: event.target.value }))}
                                  placeholder="Ej: CHX123456789"
                                />
                              </label>

                              <label>
                                <span>Estado</span>
                                <select
                                  value={shippingForm.shippingStatus}
                                  onChange={(event) => setShippingForm((currentForm) => ({ ...currentForm, shippingStatus: event.target.value }))}
                                >
                                  {shippingStatusOptions.map((status) => (
                                    <option key={status}>{status}</option>
                                  ))}
                                </select>
                              </label>
                            </div>

                            <footer className="admin-modal-actions">
                              <button type="button" className="admin-delete-button" onClick={handleDeleteShippingOrder}>
                                Eliminar pedido
                              </button>
                              <div>
                                <button type="button" className="admin-cancel-edit-button" onClick={handleCloseShipping}>
                                  Cancelar
                                </button>
                                <button type="submit" className="admin-add-button">
                                  Guardar envio
                                </button>
                              </div>
                            </footer>
                          </form>
                        </div>
                      )}
                      <form className="admin-shipping-form" onSubmit={handleSaveShipping}>
                        <label>
                          <span>Pedido</span>
                          <input type="text" value={shippingForm.orderId || "Selecciona Ver"} readOnly />
                        </label>

                        <label>
                          <span>Número de envío</span>
                          <input
                            type="text"
                            value={shippingForm.trackingNumber}
                            onChange={(event) => setShippingForm((currentForm) => ({ ...currentForm, trackingNumber: event.target.value }))}
                            placeholder="Ej: CHX123456789"
                          />
                        </label>

                        <label>
                          <span>Estado</span>
                          <select
                            value={shippingForm.shippingStatus}
                            onChange={(event) => setShippingForm((currentForm) => ({ ...currentForm, shippingStatus: event.target.value }))}
                          >
                            {shippingStatusOptions.map((status) => (
                              <option key={status}>{status}</option>
                            ))}
                          </select>
                        </label>

                        <div className="admin-shipping-form-actions">
                          {shippingMessage && <p>{shippingMessage}</p>}
                          <button type="submit" className="admin-add-button">Guardar envío</button>
                        </div>
                      </form>

                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Pedido</th>
                            <th>Destino</th>
                            <th>Estado</th>
                            <th>Número envío</th>
                            <th>Accion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminOrders.length > 0 ? (
                            adminOrders.map((order) => (
                              <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.address}</td>
                                <td>{order.shippingStatus || order.status}</td>
                                <td>{order.trackingNumber || "-"}</td>
                                <td>
                                  <button type="button" onClick={() => handleViewShipping(order)}>Editar</button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5}>Aún no hay pedidos para gestionar envíos.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : activeSection === "products" ? (
                    <table className="admin-table admin-products-table">
                      <thead>
                        <tr>
                          <th>Imagen</th>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Precio</th>
                          <th>Medidas</th>
                          <th>Disponibilidad</th>
                          <th>Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProducts.length > 0 ? (
                          allProducts.map((product) => (
                            <tr key={product.id}>
                              <td><img src={product.image} alt={product.name} /></td>
                              <td>{product.name}</td>
                              <td>{product.category ?? product.collection ?? "-"}</td>
                              <td>{formatClp(product.price)}</td>
                              <td>{product.size ?? "-"}</td>
                              <td>{product.availability ?? "Disponible"}</td>
                              <td>
                                <button type="button" onClick={() => handleEditUploadedProduct(product)}>
                                  Editar
                                </button>
                                <button type="button" className="danger" onClick={() => handleDeleteUploadedProduct(product.id)}>
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7}>No hay productos en el catalogo.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : activeSection === "categories" ? (
                    <div className="admin-category-section">
                      <form className="admin-category-form" id="admin-category-form" onSubmit={handleSaveCategory}>
                        <label>
                          <span>Nombre</span>
                          <input
                            type="text"
                            value={categoryForm.name}
                            onChange={(event) => setCategoryForm((currentForm) => ({ ...currentForm, name: event.target.value }))}
                            placeholder="Ej: Anime Collection"
                          />
                        </label>

                        <label>
                          <span>Estado</span>
                          <select
                            value={categoryForm.status}
                            onChange={(event) =>
                              setCategoryForm((currentForm) => ({ ...currentForm, status: event.target.value as Category["status"] }))
                            }
                          >
                            <option>Visible</option>
                            <option>Oculta</option>
                          </select>
                        </label>

                        <div className="admin-category-form-actions">
                          {categoryMessage && <p>{categoryMessage}</p>}
                          <button type="submit" className="admin-add-button">
                            {categoryForm.id ? "Guardar cambios" : "Crear categoría"}
                          </button>
                        </div>
                      </form>

                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Categoría</th>
                            <th>Productos</th>
                            <th>Estado</th>
                            <th>Accion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category.id}>
                              <td>{category.name}</td>
                              <td>{countProductsByCategory(category.name)}</td>
                              <td>{category.status}</td>
                              <td>
                                <button type="button" onClick={() => handleEditCategory(category)}>Editar</button>
                                <button type="button" className="danger" onClick={() => handleDeleteCategory(category.id)}>
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : activeSection === "upload" ? (
                    <div className="admin-upload-section">
                      <form className="admin-product-form" id="admin-product-form" onSubmit={handleUploadProduct}>
                        <label className="admin-product-image-field">
                          <span>Imagen</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            multiple
                            onChange={(event) => handleProductImageChange(event.target.files)}
                          />
                          {productForm.images.length > 0 ? (
                            <div className="admin-product-image-preview">
                              {productForm.images.map((image, index) => (
                                <img src={image} alt={`Vista previa ${index + 1}`} key={`${image}-${index}`} />
                              ))}
                            </div>
                          ) : (
                            <strong>PNG, JPG o WEBP<br />Puedes subir varias</strong>
                          )}
                          {productForm.imageNames.length > 0 && <small>{productForm.imageNames.join(", ")}</small>}
                        </label>

                        <label>
                          <span>Nombre</span>
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(event) => setProductForm((currentForm) => ({ ...currentForm, name: event.target.value }))}
                            placeholder="Ej: Anime Hero Rug"
                          />
                        </label>

                        <label>
                          <span>Categoría</span>
                          <select
                            value={productForm.category}
                            onChange={(event) => setProductForm((currentForm) => ({ ...currentForm, category: event.target.value }))}
                          >
                            {visibleCategories.map((category) => (
                              <option key={category.id}>{category.name}</option>
                            ))}
                          </select>
                        </label>

                        <label>
                          <span>Precio CLP</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={productForm.price}
                            onChange={(event) => setProductForm((currentForm) => ({ ...currentForm, price: event.target.value }))}
                            placeholder="99000"
                          />
                        </label>

                        <label>
                          <span>Medidas</span>
                          <input
                            type="text"
                            value={productForm.size}
                            onChange={(event) => setProductForm((currentForm) => ({ ...currentForm, size: event.target.value }))}
                            placeholder="100 x 150 cm"
                          />
                        </label>

                        <label>
                          <span>Disponibilidad</span>
                          <select
                            value={productForm.availability}
                            onChange={(event) => setProductForm((currentForm) => ({ ...currentForm, availability: event.target.value }))}
                          >
                            {availabilityOptions.map((availability) => (
                              <option key={availability}>{availability}</option>
                            ))}
                          </select>
                        </label>

                        <div className="admin-product-form-actions">
                          {productFormMessage && <p>{productFormMessage}</p>}
                          <button type="submit" className="admin-add-button">
                            {productForm.id ? "Guardar cambios" : "Guardar producto"}
                          </button>
                          {productForm.id && (
                            <button
                              type="button"
                              className="admin-cancel-edit-button"
                              onClick={() => {
                                setProductForm(emptyProductForm);
                                setProductFormMessage("Edicion cancelada.");
                              }}
                            >
                              Cancelar edicion
                            </button>
                          )}
                        </div>
                      </form>

                      <table className="admin-table admin-products-table">
                        <thead>
                          <tr>
                            <th>Imagen</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Medidas</th>
                            <th>Disponibilidad</th>
                            <th>Accion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedProducts.length > 0 ? (
                            uploadedProducts.map((product) => (
                              <tr key={product.id}>
                                <td><img src={product.image} alt={product.name} /></td>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>{formatClp(product.price)}</td>
                                <td>{product.size}</td>
                                <td>{product.availability}</td>
                                <td>
                                  <button type="button" onClick={() => handleEditUploadedProduct(product)}>
                                    Editar
                                  </button>
                                  <button type="button" className="danger" onClick={() => handleDeleteUploadedProduct(product.id)}>
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7}>Aún no hay productos subidos desde el panel.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                ) : null}
                </div>
              </section>
            </section>
          </div>
        ) : (
          <section className="admin-login-shell">
            <form className="admin-login" onSubmit={handleLogin}>
              <span className="admin-kicker">ACCESO ADMIN</span>
              <h1>Iniciar sesion</h1>
              <p>Ingresa usuario y password para entrar al panel.</p>

              <label>
                <span>Usuario</span>
                <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
              </label>

              <label>
                <span>Password</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              </label>

              {error && <strong className="admin-login-error">{error}</strong>}

              <button type="submit" className="btn btn-primary">ENTRAR</button>
            </form>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
