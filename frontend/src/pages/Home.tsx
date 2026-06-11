import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import Footer from "../components/Footer/Footer";
import { useLanguage } from "../i18n";
import { getCustomerReviews, type CustomerReview } from "../services/reviews";
import fallbackProductImage from "../assets/banner.png";

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
        <div className="customer-review-list">
          {reviews.slice(0, 4).map((review) => (
            <article className="customer-review-card" key={review.id}>
              <header className="customer-review-header">
                <div className="review-avatar">{initialsFor(review.name)}</div>
                <div>
                  <span>{review.name}</span>
                  <strong>{"*".repeat(review.rating)}</strong>
                </div>
              </header>
              <p>{review.comment}</p>
              {review.productImage && (
                <img
                  className="customer-review-product-image"
                  src={review.productImage}
                  alt={t("reviews.productPhotoAlt")}
                  onError={(event) => {
                    event.currentTarget.src = fallbackProductImage;
                  }}
                />
              )}
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
