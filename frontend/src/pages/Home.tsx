import { useEffect, useMemo, useState, type FormEvent } from "react";
import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import Footer from "../components/Footer/Footer";
import Categories from "../components/Categories/Categories";
import { useLanguage } from "../i18n";
import { createCustomerReview, getCustomerReviews, type CustomerReview } from "../services/reviews";

const REVIEWS_STORAGE_KEY = "my-favorite-rug-customer-reviews";

const defaultReviews: CustomerReview[] = [
  {
    id: 1,
    name: "Mariana G.",
    rating: 5,
    comment: "Mi alfombra quedó mejor de lo que imaginé, la calidad está increíble.",
  },
  {
    id: 2,
    name: "Camila R.",
    rating: 5,
    comment: "Me ayudaron con el diseño y llegó preciosa. Se nota el cariño en cada detalle.",
  },
];

function clearLocalReviewTests() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(REVIEWS_STORAGE_KEY);
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function CustomerReviews() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<CustomerReview[]>(defaultReviews);
  const [formMessage, setFormMessage] = useState("");
  const averageRating = useMemo(
    () => reviews.length > 0 ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0,
    [reviews],
  );

  useEffect(() => {
    clearLocalReviewTests();
    getCustomerReviews()
      .then((backendReviews) => setReviews(backendReviews.length > 0 ? backendReviews : defaultReviews))
      .catch(() => setReviews(defaultReviews));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const comment = String(formData.get("comment") ?? "").trim();
    const rating = Number(formData.get("rating") ?? 5);
    const productPhoto = formData.get("productPhoto");

    if (!name || !comment) return;

    try {
      setFormMessage("");
      const review = await createCustomerReview({
        name,
        rating,
        comment,
        productPhoto: productPhoto instanceof File && productPhoto.size > 0 ? productPhoto : undefined,
      });

      setReviews((currentReviews) => [review, ...currentReviews]);
      form.reset();
    } catch {
      setFormMessage(t("reviews.submitError"));
    }
  }

  return (
    <section className="customer-reviews-section" aria-labelledby="customer-reviews-title">
      <div className="customer-reviews-heading">
        <div>
          <span>{t("reviews.kicker")}</span>
          <h2 id="customer-reviews-title">{t("reviews.title")}</h2>
        </div>
        <strong>{averageRating.toFixed(1)} / 5</strong>
      </div>

      <div className="customer-reviews-shell">
        <div className="customer-review-list">
          {reviews.slice(0, 4).map((review) => (
            <article className="customer-review-card" key={review.id}>
              {review.productImage && (
                <img className="customer-review-product-image" src={review.productImage} alt={t("reviews.productPhotoAlt")} />
              )}
              <div className="review-avatar">{initialsFor(review.name)}</div>
              <div>
                <strong>{"*".repeat(review.rating)}</strong>
                <p>{review.comment}</p>
                <span>- {review.name}</span>
              </div>
            </article>
          ))}
        </div>

        <form className="customer-review-form" onSubmit={handleSubmit}>
          <h3>{t("reviews.formTitle")}</h3>
          <label>
            <span>{t("reviews.name")}</span>
            <input name="name" type="text" maxLength={40} required />
          </label>
          <label>
            <span>{t("reviews.rating")}</span>
            <select name="rating" defaultValue="5">
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </label>
          <label>
            <span>{t("reviews.comment")}</span>
            <textarea name="comment" rows={4} maxLength={240} required />
          </label>
          <label>
            <span>{t("reviews.productPhoto")}</span>
            <input name="productPhoto" type="file" accept="image/*" />
          </label>
          {formMessage && <p className="customer-review-form-message">{formMessage}</p>}
          <button type="submit">{t("reviews.submit")}</button>
        </form>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Categories />
      <CustomerReviews />
      <Footer />
    </>
  );
}
