"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { RestaurantDetailRecord } from "@/data/restaurant-details";
import styles from "./RestaurantDetail.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

const blankForm = {
  rating: "",
  menu: "",
  comment: "",
};

function renderStars(count: number) {
  const max = 5;
  return Array.from({ length: max }, (_, index) =>
    index < count ? "★" : "☆",
  ).join("");
}

type RestaurantDetailViewProps = {
  restaurant: RestaurantDetailRecord;
  restaurantId?: string;
};

export default function RestaurantDetailView({
  restaurant,
  restaurantId,
}: RestaurantDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const { data: session } = authClient.useSession();
  const isLoggedIn = Boolean(session?.user);
  const reviewIntent = searchParams.get("reviewIntent");
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formState, setFormState] = useState(blankForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [placeImageUrl, setPlaceImageUrl] = useState<string | null>(
    restaurant.imageUrl,
  );

  const handleChange = useCallback(
    <K extends keyof typeof blankForm>(key: K, value: string) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  useEffect(() => {
    if (!restaurant.naverLink) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    fetch(
      `/api/restaurant-image?url=${encodeURIComponent(restaurant.naverLink)}`,
      {
        signal: controller.signal,
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (active && data?.imageUrl) {
          setPlaceImageUrl(data.imageUrl);
        }
      })
      .catch((error) => {
        const { name } = error as { name?: string };
        if (name === "AbortError") return;
        console.error("Failed to load hero image", error);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [restaurant.naverLink]);

  const heroImageStyle = placeImageUrl
    ? { backgroundImage: `url(${placeImageUrl})` }
    : undefined;

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isLoggedIn) {
        alert("로그인을 해주세요.");
        const redirectParams = new URLSearchParams(searchParamsString);
        redirectParams.set("reviewIntent", "1");
        const redirectQuery = redirectParams.toString();
        const redirectUrl = `${pathname}${
          redirectQuery ? `?${redirectQuery}` : ""
        }`;
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      if (!restaurantId || !formState.rating || !formState.comment) {
        alert("필수 항목을 입력해주세요.");
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId,
            rating: parseInt(formState.rating),
            menu: formState.menu,
            content: formState.comment,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit review");
        }

        setFormState({ rating: "", menu: "", comment: "" });
        alert("후기가 등록되었습니다.");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("후기 등록에 실패했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      restaurantId,
      formState.rating,
      formState.comment,
      formState.menu,
      isLoggedIn,
      pathname,
      router,
      searchParamsString,
    ],
  );

  useEffect(() => {
    if (reviewIntent !== "1" || !formRef.current) {
      return;
    }

    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    const firstInput = formRef.current.querySelector<HTMLElement>(
      "input, textarea",
    );
    firstInput?.focus();

    const redirectParams = new URLSearchParams(searchParamsString);
    redirectParams.delete("reviewIntent");
    const nextSearch = redirectParams.toString();
    router.replace(`${pathname}${nextSearch ? `?${nextSearch}` : ""}`, {
      scroll: false,
    });
  }, [pathname, router, reviewIntent, searchParamsString]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>식당 상세</div>
      </div>
      <div className={styles.detailGrid}>
        <div className={styles.leftColumn}>
          <section className={styles.card}>
            <div className={styles.restaurantHero}>
              <div
                className={styles.heroImg}
                style={heroImageStyle}
                aria-label={`${restaurant.name} hero image`}
              />
              <div className={styles.heroContent}>
                <div className={styles.heroTitle}>
                  <div>
                    <h2 className={styles.name}>{restaurant.name}</h2>
                  </div>
                  <div className={styles.ratingPill}>
                    <strong>★{restaurant.rating.toFixed(1)}</strong>
                    <span className={styles.muted}>
                      후기 {restaurant.reviewCount}개
                    </span>
                  </div>
                </div>
                {restaurant.tags.length > 0 && (
                  <div className={styles.tagList}>
                    {restaurant.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.btnRow}>
                  <a
                    className={`${styles.btn} ${styles.btnNaver}`}
                    href={restaurant.naverLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    네이버 플레이스
                  </a>
                  {restaurantId && (
                    <a
                      className={`${styles.btn} ${styles.btnEdit}`}
                      href={`/restaurants/edit/${restaurantId}`}
                    >
                      식당 수정
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className={`${styles.card} ${styles.reviewSection}`}>
            <div className={styles.reviewHeader}>
              <div>
                <h3>밥디아 후기</h3>
              </div>
            </div>

            <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div>
                  <p className={styles.label}>평점</p>
                  <div className={styles.starPicker}>
                    {Array.from({ length: 5 }, (_, index) => {
                      const value = index + 1;
                      const active =
                        value <= (hoverRating || Number(formState.rating) || 0);
                      return (
                        <button
                          key={value}
                          type="button"
                          className={`${styles.starButton} ${
                            active ? styles.starActive : ""
                          }`}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleChange("rating", String(value))}
                          aria-label={`별점 ${value}`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.menuBox}>
                  <p className={styles.label}>메뉴명</p>
                  <input
                    className={styles.input}
                    placeholder="먹은 메뉴"
                    value={formState.menu}
                    onChange={(event) =>
                      handleChange("menu", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.spacer} />

              <div>
                <p className={styles.label}>후기 내용</p>
                <textarea
                  className={styles.textarea}
                  placeholder="솔직한 후기를 남겨주세요."
                  value={formState.comment}
                  onChange={(event) =>
                    handleChange("comment", event.target.value)
                  }
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "등록 중..." : "등록"}
                </button>
              </div>
            </form>

            <div className={styles.reviewList}>
              {restaurant.reviews.map((review) => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewRow}>
                    <p className={styles.reviewComment}>{review.comment}</p>
                    <span className={styles.stars}>
                      {renderStars(review.rating)}
                    </span>
                  </div>
                  {review.menu && (
                    <p className={styles.reviewMenuDetail}>
                      메뉴: {review.menu}
                    </p>
                  )}
                  <span className={styles.reviewNickname}>
                    {review.nickname}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.infoColumn}>
          <section className={styles.card}>
            <div className={styles.infoHeadline}>가게 정보</div>
            <div className={styles.infoStack}>
              {restaurant.infoBlocks.map((block) => (
                <div key={block.label} className={styles.infoBox}>
                  <div className={styles.label}>{block.label}</div>
                  <div className={styles.value}>{block.value}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
