import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import imagenIcon from "../assets/icons/imagen.png";
import paletaIcon from "../assets/icons/paleta.png";
import subirIcon from "../assets/icons/subir.png";
import { saveQuoteRequest } from "../services/quotes";

type Currency = "CLP" | "USD" | "EUR";

const currencyRates: Record<Exclude<Currency, "CLP">, number> = {
  USD: 950,
  EUR: 1020,
};

const sizeOptions = [
  { id: "60x90", label: "60 x 90 cm", width: 60, height: 90, priceClp: 100000 },
  { id: "80x120", label: "80 x 120 cm", width: 80, height: 120, priceClp: 69000 },
  { id: "100x150", label: "100 x 150 cm", width: 100, height: 150, priceClp: 99000 },
  { id: "120x180", label: "120 x 180 cm", width: 120, height: 180, priceClp: 139000 },
];

const woolOptions = [
  { id: "standard", label: "Lana standard", extraClp: 0 },
  { id: "premium", label: "Lana premium", extraClp: 12000 },
  { id: "extra-soft", label: "Lana extra suave", extraClp: 18000 },
];

const colorOptions = [
  { id: "simple", label: "1 a 3 colores", extraClp: 0 },
  { id: "medium", label: "4 a 6 colores", extraClp: 8000 },
  { id: "complex", label: "7+ colores", extraClp: 15000 },
];

function formatPrice(amountClp: number, currency: Currency) {
  if (currency !== "CLP") {
    return new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-ES", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Math.ceil(amountClp / currencyRates[currency]));
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amountClp);
}

export default function Personaliza() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState(sizeOptions[0].id);
  const [selectedWoolId, setSelectedWoolId] = useState(woolOptions[0].id);
  const [selectedColorId, setSelectedColorId] = useState(colorOptions[0].id);
  const [currency, setCurrency] = useState<Currency>("CLP");
  const [comments, setComments] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const selectedSize = sizeOptions.find((option) => option.id === selectedSizeId) ?? sizeOptions[0];
  const selectedWool = woolOptions.find((option) => option.id === selectedWoolId) ?? woolOptions[0];
  const selectedColors = colorOptions.find((option) => option.id === selectedColorId) ?? colorOptions[0];
  const totalClp = selectedSize.priceClp + selectedWool.extraClp + selectedColors.extraClp;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setSubmitMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fileName) {
      setSubmitStatus("error");
      setSubmitMessage("Sube una imagen de referencia antes de enviar la solicitud.");
      return;
    }

    const request = saveQuoteRequest({
      imageName: fileName,
      size: selectedSize.label,
      wool: selectedWool.label,
      colors: selectedColors.label,
      currency,
      comments,
      totalClp,
    });

    setSubmitStatus("success");
    setSubmitMessage(`Solicitud ${request.id} enviada. La puedes revisar en Mis Cotizaciones.`);
    setSelectedSizeId(sizeOptions[0].id);
    setSelectedWoolId(woolOptions[0].id);
    setSelectedColorId(colorOptions[0].id);
    setCurrency("CLP");
    setComments("");
    setFileName("");

    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }

  return (
    <>
      <Navbar />

      <main className="custom-page">
        <section className="custom-hero">
          <div>
            <span className="custom-kicker">Alfombra a pedido</span>
            <h1>Personaliza tu alfombra</h1>
            <p>
              Sube tu imagen de referencia, define las medidas en centimetros y
              prepararemos una vista previa antes de confeccionarla.
            </p>
          </div>
          <div className="custom-hero-badge" aria-hidden="true">
            <img src={paletaIcon} alt="" />
            <span>100% a tu estilo</span>
          </div>
        </section>

        <form className="custom-builder" onSubmit={handleSubmit}>
          <section className="upload-panel" aria-label="Imagen de referencia">
            <div className="upload-preview">
              {preview ? (
                <img src={preview} alt="Vista previa de tu diseño" />
              ) : (
                <div className="upload-empty">
                  <img src={subirIcon} alt="" />
                  <strong>Sube tu imagen</strong>
                  <span>PNG, JPG o WEBP</span>
                </div>
              )}
            </div>

            <label className="upload-button">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
              <span>Elegir imagen</span>
            </label>

            <p className="upload-name">{fileName || "Aun no has seleccionado una imagen."}</p>
          </section>

          <section className="custom-form-panel" aria-label="Detalles de la alfombra">
            <div className="form-heading">
              <img src={imagenIcon} alt="" />
              <div>
                <h2>Medidas y detalles</h2>
                <p>Elige una medida temporal, moneda y extras de confeccion.</p>
              </div>
            </div>

            <div className="custom-select-grid">
              <label>
                <span>Medida</span>
                <select value={selectedSizeId} onChange={(event) => setSelectedSizeId(event.target.value)}>
                  {sizeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} - {formatPrice(option.priceClp, currency)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Moneda</span>
                <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
                  <option value="CLP">CLP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>
            </div>

            <div className="custom-select-grid extras-grid">
              <label>
                <span>Lana usada</span>
                <select value={selectedWoolId} onChange={(event) => setSelectedWoolId(event.target.value)}>
                  {woolOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} {option.extraClp > 0 ? `+ ${formatPrice(option.extraClp, currency)}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Colores</span>
                <select value={selectedColorId} onChange={(event) => setSelectedColorId(event.target.value)}>
                  {colorOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} {option.extraClp > 0 ? `+ ${formatPrice(option.extraClp, currency)}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="price-breakdown" aria-label="Detalle del precio">
              <div>
                <span>Medida base</span>
                <strong>{formatPrice(selectedSize.priceClp, currency)}</strong>
              </div>
              <div>
                <span>{selectedWool.label}</span>
                <strong>{formatPrice(selectedWool.extraClp, currency)}</strong>
              </div>
              <div>
                <span>{selectedColors.label}</span>
                <strong>{formatPrice(selectedColors.extraClp, currency)}</strong>
              </div>
            </div>

            <label className="detail-field">
              <span>Comentarios</span>
              <textarea
                rows={5}
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder="Cuéntanos colores, forma, texto o cualquier detalle importante."
              />
            </label>

            <div className="size-summary">
              <span>Vista del pedido</span>
              <strong>{selectedSize.width} x {selectedSize.height} cm</strong>
              <em>{formatPrice(totalClp, currency)}</em>
            </div>

            <button type="submit" className="btn btn-primary custom-submit">
              ENVIAR SOLICITUD <span aria-hidden="true">&rarr;</span>
            </button>

            {submitMessage && (
              <p className={`custom-submit-message ${submitStatus}`}>
                {submitMessage}
              </p>
            )}
          </section>
        </form>
      </main>

      <Footer />
    </>
  );
}
