import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import imagenIcon from "../assets/icons/imagen.png";
import paletaIcon from "../assets/icons/paleta.png";
import subirIcon from "../assets/icons/subir.png";
import { useLanguage } from "../i18n";
import { saveQuoteRequest } from "../services/quotes";
import { useAccountAuthStore } from "../services/accountAuth";

type Currency = "CLP" | "USD" | "EUR";
type PricingShape = "round" | "square" | "rectangular";
type SizeOption = { id: string; label: string; width: number; height: number };

const woolOptions = [
  { id: "standard", label: "Lana standard" },
  { id: "premium", label: "Lana premium" },
  { id: "extra-soft", label: "Lana extra suave" },
];

const colorOptions = [
  { id: "simple", label: "1 a 3 colores" },
  { id: "medium", label: "4 a 6 colores" },
  { id: "complex", label: "7+ colores" },
];

const pricingCatalog: Record<
  PricingShape,
  { labelKey: "custom.pricingRound" | "custom.pricingSquare" | "custom.pricingRectangular"; measureLabelKey: "custom.diameter" | "custom.measure"; items: { measure: string }[] }
> = {
  round: {
    labelKey: "custom.pricingRound",
    measureLabelKey: "custom.diameter",
    items: [
      { measure: "20 cm" },
      { measure: "30 cm" },
      { measure: "40 cm" },
      { measure: "50 cm" },
      { measure: "60 cm" },
      { measure: "70 cm" },
      { measure: "80 cm" },
      { measure: "90 cm" },
      { measure: "100 cm" },
      { measure: "110 cm" },
      { measure: "120 cm" },
      { measure: "130 cm" },
      { measure: "140 cm" },
      { measure: "150 cm" },
    ],
  },
  square: {
    labelKey: "custom.pricingSquare",
    measureLabelKey: "custom.measure",
    items: [
      { measure: "20x20 cm" },
      { measure: "30x30 cm" },
      { measure: "40x40 cm" },
      { measure: "50x50 cm" },
      { measure: "60x60 cm" },
      { measure: "70x70 cm" },
      { measure: "80x80 cm" },
      { measure: "90x90 cm" },
      { measure: "100x100 cm" },
      { measure: "110x110 cm" },
      { measure: "120x120 cm" },
      { measure: "130x130 cm" },
      { measure: "140x140 cm" },
      { measure: "150x150 cm" },
    ],
  },
  rectangular: {
    labelKey: "custom.pricingRectangular",
    measureLabelKey: "custom.measure",
    items: [
      { measure: "20x30 cm" },
      { measure: "30x40 cm" },
      { measure: "40x50 cm" },
      { measure: "40x60 cm" },
      { measure: "50x60 cm" },
      { measure: "50x70 cm" },
      { measure: "50x80 cm" },
      { measure: "50x90 cm" },
      { measure: "60x80 cm" },
      { measure: "50x120 cm" },
      { measure: "60x100 cm" },
      { measure: "70x90 cm" },
      { measure: "60x120 cm" },
      { measure: "80x100 cm" },
      { measure: "70x120 cm" },
      { measure: "80x120 cm" },
      { measure: "90x110 cm" },
      { measure: "90x130 cm" },
      { measure: "100x150 cm" },
      { measure: "110x140 cm" },
      { measure: "120x150 cm" },
      { measure: "140x150 cm" },
      { measure: "150x160 cm" },
      { measure: "160x170 cm" },
    ],
  },
};

function getSizeOptions(shape: PricingShape): SizeOption[] {
  return pricingCatalog[shape].items.map((item) => {
    const dimensions = item.measure.match(/\d+/g)?.map(Number) ?? [0];
    const width = dimensions[0] ?? 0;
    const height = dimensions[1] ?? width;

    return {
      id: item.measure,
      label: item.measure.replace(/x/g, " x "),
      width,
      height,
    };
  });
}

export default function Personaliza() {
  const { t } = useLanguage();
  const accountUser = useAccountAuthStore((state) => state.user);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRut, setContactRut] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"contain" | "cover">("contain");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [fileName, setFileName] = useState("");
  const [activePricingShape, setActivePricingShape] = useState<PricingShape>("rectangular");
  const [selectedSizeId, setSelectedSizeId] = useState(getSizeOptions("rectangular")[0].id);
  const [selectedWoolId, setSelectedWoolId] = useState(woolOptions[0].id);
  const [selectedColorId, setSelectedColorId] = useState(colorOptions[0].id);
  const [currency, setCurrency] = useState<Currency>("CLP");
  const [comments, setComments] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const sizeOptions = getSizeOptions(activePricingShape);
  const selectedSize = sizeOptions.find((option) => option.id === selectedSizeId) ?? sizeOptions[0];
  const selectedWool = woolOptions.find((option) => option.id === selectedWoolId) ?? woolOptions[0];
  const selectedColors = colorOptions.find((option) => option.id === selectedColorId) ?? colorOptions[0];

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
    setPreviewMode("contain");
    resetCrop();
    setFileName(file.name);
    setSubmitMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fileName) {
      setSubmitStatus("error");
      setSubmitMessage(t("custom.errorImage"));
      return;
    }

    if (!accountUser && (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim())) {
      setSubmitStatus("error");
      setSubmitMessage("Ingresa tus datos de contacto para solicitar la cotizacion.");
      setIsContactModalOpen(true);
      return;
    }

    try {
      const request = await saveQuoteRequest({
        customerName: accountUser?.name ?? contactName.trim(),
        email: accountUser?.email ?? contactEmail.trim(),
        phone: accountUser?.phone ?? contactPhone.trim(),
        rut: accountUser?.rut ?? contactRut.trim(),
        address: accountUser?.address ?? contactAddress.trim(),
        imageName: fileName,
        size: `${t(pricingCatalog[activePricingShape].labelKey)} - ${selectedSize.label}`,
        wool: selectedWool.label,
        colors: selectedColors.label,
        currency,
        comments,
        totalClp: 0,
      });

      setSubmitStatus("success");
      setSubmitMessage(`${t("custom.successPrefix")} ${request.quoteNumber} ${t("custom.successSuffix")}`);
      setActivePricingShape("rectangular");
      setSelectedSizeId(getSizeOptions("rectangular")[0].id);
      setSelectedWoolId(woolOptions[0].id);
      setSelectedColorId(colorOptions[0].id);
      setCurrency("CLP");
      setComments("");
      setFileName("");

      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "No se pudo enviar la cotizacion.");
    }
  }

  function handleShapeChange(nextShape: PricingShape) {
    setActivePricingShape(nextShape);
    setSelectedSizeId(getSizeOptions(nextShape)[0].id);
  }

  function resetCrop() {
    setCropZoom(1);
    setCropX(0);
    setCropY(0);
  }

  function handleContactSubmit() {
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setContactMessage("Ingresa nombre, correo y telefono.");
      return;
    }

    setContactMessage("");
    setSubmitMessage("");
    setIsContactModalOpen(false);
  }

  function closeContactModal() {
    setIsContactModalOpen(false);
    setContactMessage("");
  }

  return (
    <>
      <Navbar />

      <main className="custom-page">
        <section className="custom-hero">
          <div>
            <span className="custom-kicker">{t("custom.kicker")}</span>
            <h1>{t("custom.title")}</h1>
            <p>{t("custom.subtitle")}</p>
          </div>
          <div className="custom-hero-badge" aria-hidden="true">
            <img src={paletaIcon} alt="" />
            <span>{t("custom.badge")}</span>
          </div>
        </section>

        <form className="custom-builder" onSubmit={handleSubmit}>
          <section className="upload-panel" aria-label="Imagen de referencia">
            <div className="upload-preview">
              {preview ? (
                <img
                  className={previewMode === "cover" ? "is-cropped" : undefined}
                  src={preview}
                  alt="Vista previa de tu diseño"
                  style={
                    previewMode === "cover"
                      ? {
                          transform: `translate(${cropX}%, ${cropY}%) scale(${cropZoom})`,
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="upload-empty">
                  <img src={subirIcon} alt="" />
                  <strong>{t("custom.uploadTitle")}</strong>
                  <span>PNG, JPG o WEBP</span>
                </div>
              )}
            </div>

            {preview && (
              <div className="upload-preview-controls" aria-label="Modo de vista previa">
                <button type="button" className={previewMode === "contain" ? "is-active" : ""} onClick={() => setPreviewMode("contain")}>
                  Completa
                </button>
                <button type="button" className={previewMode === "cover" ? "is-active" : ""} onClick={() => setPreviewMode("cover")}>
                  Recortar
                </button>
              </div>
            )}

            {preview && previewMode === "cover" && (
              <div className="upload-crop-controls">
                <label>
                  <span>Zoom</span>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={cropZoom}
                    onChange={(event) => setCropZoom(Number(event.target.value))}
                  />
                </label>
                <label>
                  <span>Horizontal</span>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="1"
                    value={cropX}
                    onChange={(event) => setCropX(Number(event.target.value))}
                  />
                </label>
                <label>
                  <span>Vertical</span>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="1"
                    value={cropY}
                    onChange={(event) => setCropY(Number(event.target.value))}
                  />
                </label>
                <button type="button" onClick={resetCrop}>
                  Centrar
                </button>
              </div>
            )}

            <label className="upload-button">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
              <span>{t("custom.chooseImage")}</span>
            </label>

            <p className="upload-name">{fileName || t("custom.noImage")}</p>
          </section>

          <section className="custom-form-panel" aria-label="Detalles de la alfombra">
            <div className="form-heading">
              <img src={imagenIcon} alt="" />
              <div>
                <h2>{t("custom.detailsTitle")}</h2>
                <p>{t("custom.detailsText")}</p>
              </div>
            </div>

            <div className="custom-select-grid primary-options-grid">
              <label>
                <span>{t("custom.shape")}</span>
                <select value={activePricingShape} onChange={(event) => handleShapeChange(event.target.value as PricingShape)}>
                  {(Object.keys(pricingCatalog) as PricingShape[]).map((shape) => (
                    <option key={shape} value={shape}>
                      {t(pricingCatalog[shape].labelKey)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>{t("custom.size")}</span>
                <select value={selectedSizeId} onChange={(event) => setSelectedSizeId(event.target.value)}>
                  {sizeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>{t("custom.currency")}</span>
                <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
                  <option value="CLP">CLP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>
            </div>

            <div className="custom-select-grid extras-grid">
              <label>
                <span>{t("custom.wool")}</span>
                <select value={selectedWoolId} onChange={(event) => setSelectedWoolId(event.target.value)}>
                  {woolOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>{t("custom.colors")}</span>
                <select value={selectedColorId} onChange={(event) => setSelectedColorId(event.target.value)}>
                  {colorOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="detail-field">
              <span>{t("custom.comments")}</span>
              <textarea
                rows={5}
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder={t("custom.commentsPlaceholder")}
              />
            </label>

            <section className="custom-account-box">
              {accountUser ? (
                <div className="custom-account-ready">
                  <span>Cuenta asociada</span>
                  <strong>{accountUser.name}</strong>
                  <small>{accountUser.email}</small>
                </div>
              ) : (
                <div className="custom-account-inline">
                  <div>
                    <strong>Datos de contacto</strong>
                    <span>{contactEmail ? `${contactName} · ${contactEmail}` : "Puedes cotizar como invitado sin crear cuenta."}</span>
                  </div>
                  <button type="button" onClick={() => setIsContactModalOpen(true)}>
                    {contactEmail ? "Editar datos" : "Agregar datos"}
                  </button>
                </div>
              )}
            </section>

            <button type="submit" className="btn btn-primary custom-submit">
              {t("custom.submit")} <span aria-hidden="true">&rarr;</span>
            </button>

            {submitMessage && (
              <p className={`custom-submit-message ${submitStatus}`}>
                {submitMessage}
              </p>
            )}
          </section>
        </form>

        {isContactModalOpen && (
          <div className="custom-account-modal-backdrop" role="presentation" onMouseDown={closeContactModal}>
            <section
              className="custom-account-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="custom-account-modal-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button className="custom-account-modal-close" type="button" aria-label="Cerrar" onClick={closeContactModal}>
                x
              </button>
              <div className="custom-account-heading">
                <strong id="custom-account-modal-title">Datos para la cotizacion</strong>
                <span>No necesitas crear cuenta. Usaremos estos datos para responder tu solicitud.</span>
              </div>

              <div className="custom-account-form custom-account-form-create">
                <label>
                  <span>Nombre completo</span>
                  <input value={contactName} onChange={(event) => setContactName(event.target.value)} autoComplete="name" />
                </label>
                <label>
                  <span>Telefono</span>
                  <input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} autoComplete="tel" />
                </label>
                <label>
                  <span>Correo electronico</span>
                  <input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} autoComplete="email" />
                </label>
                <label>
                  <span>RUT</span>
                  <input value={contactRut} onChange={(event) => setContactRut(event.target.value)} autoComplete="off" />
                </label>
                <label className="custom-account-wide">
                  <span>Direccion</span>
                  <input value={contactAddress} onChange={(event) => setContactAddress(event.target.value)} autoComplete="street-address" />
                </label>
              </div>

              {contactMessage && <p className="custom-account-message">{contactMessage}</p>}

              <div className="custom-account-actions">
                <button type="button" onClick={handleContactSubmit}>
                  Guardar datos
                </button>
              </div>
            </section>
          </div>
        )}

        <section className="custom-info-grid">
          <article>
            <h2>{t("custom.howTitle")}</h2>
            <p>{t("custom.howText")}</p>
          </article>
          <article>
            <h2>{t("custom.pricingTitle")}</h2>
            <p>{t("custom.pricingText")}</p>
          </article>
          <article>
            <h2>FAQ</h2>
            <p>{t("custom.faqText")}</p>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}
