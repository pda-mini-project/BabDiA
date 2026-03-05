"use client";

import { useCallback, useState, type FormEvent } from "react";
import type { RestaurantDetailRecord } from "@/data/restaurant-details";
import styles from "./RestaurantDetail.module.css";

const blankForm = {
  rating: "",
  menu: "",
  comment: "",
};

function renderStars(count: number) {
  const max = 5;
  return Array.from({ length: max }, (_, index) => (index < count ? "★" : "☆")).join("");
}

type RestaurantDetailViewProps = {
  restaurant: RestaurantDetailRecord;
};

export default function RestaurantDetailView({ restaurant }: RestaurantDetailViewProps) {
  const [formState, setFormState] = useState(blankForm);

  const handleChange = useCallback(<K extends keyof typeof blankForm>(key: K, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormState({ rating: "", menu: "", comment: "" });
    },
    [],
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>식당 상세</div>
      </div>
      <div className={styles.detailGrid}>
        <div className={styles.leftColumn}>
          <section className={styles.card}>
            <div className={styles.restaurantHero}>
              <div className={styles.heroImg} aria-hidden />
              <div className={styles.heroContent}>
                <div className={styles.heroTitle}>
                  <div>
                    <h2 className={styles.name}>{restaurant.name}</h2>
                    <p className={styles.sub}>{restaurant.tagline}</p>
                  </div>
                  <div className={styles.ratingPill}>
                    <strong>⭐ {restaurant.rating.toFixed(1)}</strong>
                    <span className={styles.muted}>후기 {restaurant.reviewCount}개</span>
                  </div>
                </div>
                <div className={styles.btnRow}>
                  <a
                    className={`${styles.btn} ${styles.btnSoft}`}
                    href={restaurant.naverLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    네이버 플레이스
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className={`${styles.card} ${styles.reviewSection}`}>
            <div className={styles.reviewHeader}>
              <div>
                <h3>프디아 후기</h3>
                <p className={styles.sub}>후기/별점은 실제 데이터 연결 시 렌더링됩니다.</p>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div>
                  <p className={styles.label}>별점</p>
                  <input
                    className={styles.input}
                    placeholder="예: 5"
                    value={formState.rating}
                    onChange={(event) => handleChange("rating", event.target.value)}
                  />
                </div>
                <div>
                  <p className={styles.label}>메뉴명</p>
                  <input
                    className={styles.input}
                    placeholder="예: 김치찌개"
                    value={formState.menu}
                    onChange={(event) => handleChange("menu", event.target.value)}
                  />
                </div>
              </div>

              <div className={styles.spacer} />

              <div>
                <p className={styles.label}>후기 내용</p>
                <textarea
                  className={styles.textarea}
                  placeholder="후기 내용을 입력하세요"
                  value={formState.comment}
                  onChange={(event) => handleChange("comment", event.target.value)}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  등록
                </button>
              </div>
            </form>

            <div className={styles.reviewList}>
              {restaurant.reviews.map((review) => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewTop}>
                    <strong>
                      {review.nickname} · 메뉴: {review.menu}
                    </strong>
                    <span className={styles.stars}>{renderStars(review.rating)}</span>
                  </div>
                  <p className={styles.reviewText}>{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.infoColumn}>
          <section className={styles.card}>
            <div className={styles.infoHeadline}>간단한 정보</div>
            <div className={styles.infoStack}>
              {restaurant.infoBlocks.map((block) => (
                <div key={block.label} className={styles.infoBox}>
                  <div className={styles.label}>{block.label}</div>
                  <div className={styles.value}>{block.value}</div>
                  <div className={styles.desc}>{block.detail}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
