import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import Footer from "../components/Footer/Footer";
import { useLanguage } from "../i18n";
import { getCustomerReviews, type CustomerReview } from "../services/reviews";

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
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const averageRating = useMemo(
    () => reviews.length > 0 ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0,
    [reviews],
  );

  useEffect(() => {
    getCustomerReviews()
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

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
        <div className="customer-review-list" style={{ gridTemplateColumns: '1fr', width: '100%' }}>
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
      {/* <Categories /> */}
      <CustomerReviews />
      <Footer />
    </>
  );
}
