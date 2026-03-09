"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type {
  RestaurantDetailRecord,
  ReviewRecord,
} from "@/data/restaurant-details";
import styles from "./RestaurantDetail.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

const blankForm = {
  rating: "",
  menu: "",
  comment: "",
};
const blankEditForm = {
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
  const [editFormState, setEditFormState] = useState(blankEditForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const placeImageUrl = restaurant.imageUrl ?? null;
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [isSelectingRestaurant, setIsSelectingRestaurant] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState<string | null>(null);

  const handleChange = useCallback(
    <K extends keyof typeof blankForm>(key: K, value: string) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleStartEdit = useCallback((review: ReviewRecord) => {
    setEditingReviewId(review.id);
    setEditFormState({
      rating: review.rating.toString(),
      menu: review.menu,
      comment: review.comment,
    });
    setEditHoverRating(review.rating);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingReviewId(null);
    setEditFormState(blankEditForm);
    setEditHoverRating(0);
  }, []);

  const handleEditChange = useCallback(
    <K extends keyof typeof blankEditForm>(key: K, value: string) => {
      setEditFormState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleEditSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (
        !restaurantId ||
        !editingReviewId ||
        !editFormState.rating ||
        !editFormState.comment
      ) {
        alert("紐⑤뱺 ??ぉ???낅젰?댁＜?몄슂.");
        return;
      }

      setIsSubmitting(true);
      try {
        const payload: {
          restaurantId: string;
          rating: number;
          menu: string;
          content: string;
          uuid: string;
        } = {
          restaurantId,
          rating: parseInt(editFormState.rating, 10),
          menu: editFormState.menu,
          content: editFormState.comment,
          uuid: editingReviewId,
        };
        const response = await fetch("/api/reviews", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to submit review");
        }

        handleCancelEdit();
        alert("리뷰 수정이 완료되었습니다.");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("리뷰 수정에 실패했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      editFormState.comment,
      editFormState.menu,
      editFormState.rating,
      editingReviewId,
      handleCancelEdit,
      restaurantId,
    ],
  );

  const handleDeleteReview = useCallback(
    async (reviewId: string) => {
      if (!restaurantId) {
        return;
      }
      if (!confirm("리뷰를 삭제하면 되돌릴 수 없습니다. 계속하시겠어요?")) {
        return;
      }

      setDeletingReviewId(reviewId);
      try {
        const response = await fetch("/api/reviews", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid: reviewId, restaurantId }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete review");
        }

        alert("리뷰가 삭제되었습니다.");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("리뷰 삭제에 실패했습니다.");
      } finally {
        setDeletingReviewId(null);
      }
    },
    [restaurantId],
  );

  const submitText = "리뷰 등록";

  const handleSelectRestaurant = useCallback(async () => {
    if (!restaurantId || isSelectingRestaurant) return;

    if (!isLoggedIn) {
      alert("로그인을 해주세요.");
      const redirectUrl = `${pathname}${searchParamsString ? `?${searchParamsString}` : ""}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    setIsSelectingRestaurant(true);
    setSelectionStatus(null);
    try {
      const response = await fetch("/api/recommend/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: Number(restaurantId) }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setSelectionStatus(
          data?.error ?? "저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }

      setSelectionStatus("오늘 점심 식당으로 저장했어요.");
    } catch (error) {
      console.error("[detail select restaurant]", error);
      setSelectionStatus("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSelectingRestaurant(false);
    }
  }, [
    isLoggedIn,
    isSelectingRestaurant,
    pathname,
    restaurantId,
    router,
    searchParamsString,
  ]);


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
        const redirectUrl = `${pathname}${redirectQuery ? `?${redirectQuery}` : ""}`;
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      if (!restaurantId || !formState.rating || !formState.comment) {
        alert("모든 항목을 입력해주세요.");
        return;
      }

      setIsSubmitting(true);
      try {
        const payload: {
          restaurantId: string;
          rating: number;
          menu: string;
          content: string;
        } = {
          restaurantId,
          rating: parseInt(formState.rating, 10),
          menu: formState.menu,
          content: formState.comment,
        };

        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to submit review");
        }

        setFormState(blankForm);
        alert("후기가 등록되었습니다.");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("후기 등록을 실패하였습니다.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formState.comment,
      formState.menu,
      formState.rating,
      isLoggedIn,
      pathname,
      restaurantId,
      router,
      searchParamsString,
    ],
  );
  useEffect(() => {
    if (reviewIntent !== "1" || !formRef.current) {
      return;
    }

    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    const firstInput =
      formRef.current.querySelector<HTMLElement>("input, textarea");
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
                {restaurantId && (
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSelectLunch}`}
                    onClick={handleSelectRestaurant}
                    disabled={isSelectingRestaurant}
                  >
                    {isSelectingRestaurant ? "저장 중..." : "이 식당에서 먹기"}
                  </button>
                )}
                {selectionStatus && (
                  <div className={styles.selectionStatus}>{selectionStatus}</div>
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
                  {submitText}
                </button>
              </div>
            </form>

            <div className={styles.reviewList}>
              {restaurant.reviews.map((review) => {
                const isEditing = editingReviewId === review.id;
                return (
                  <div key={review.id} className={styles.reviewItem}>
                    {isEditing ? (
                      <form
                        className={styles.reviewEditForm}
                        onSubmit={handleEditSubmit}
                      >
                        <div className={styles.reviewRow}>
                          <div className={styles.starPicker}>
                            {Array.from({ length: 5 }, (_, index) => {
                              const value = index + 1;
                              const active =
                                value <=
                                (editHoverRating ||
                                  Number(editFormState.rating) ||
                                  0);
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  className={`${styles.starButton} ${
                                    active ? styles.starActive : ""
                                  }`}
                                  onMouseEnter={() => setEditHoverRating(value)}
                                  onMouseLeave={() => setEditHoverRating(0)}
                                  onClick={() =>
                                    handleEditChange("rating", String(value))
                                  }
                                >
                                  ★
                                </button>
                              );
                            })}
                          </div>
                          <div className={styles.menuBox}>
                            <input
                              className={styles.input}
                              placeholder="수정할 메뉴"
                              value={editFormState.menu}
                              onChange={(event) =>
                                handleEditChange("menu", event.target.value)
                              }
                            />
                          </div>
                        </div>
                        <textarea
                          className={styles.textarea}
                          placeholder="리뷰 내용을 수정해보세요."
                          value={editFormState.comment}
                          onChange={(event) =>
                            handleEditChange("comment", event.target.value)
                          }
                        />
                        <div className={styles.formActions}>
                          <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost}`}
                            onClick={handleCancelEdit}
                            disabled={isSubmitting}
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            disabled={isSubmitting}
                          >
                            리뷰 수정
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className={styles.reviewRow}>
                          <p className={styles.reviewComment}>
                            {review.comment}
                          </p>
                          <span className={styles.stars}>
                            {renderStars(review.rating)}
                          </span>
                        </div>
                        {review.menu && (
                          <p className={styles.reviewMenuDetail}>
                            메뉴: {review.menu}
                          </p>
                        )}
                        <div className={styles.reviewMeta}>
                          <span className={styles.reviewNickname}>
                            {review.nickname}
                          </span>
                          {review.userId === session?.user?.id && (
                            <div className={styles.reviewActions}>
                              <button
                                type="button"
                                className={`${styles.reviewButton} ${styles.reviewButtonEdit}`}
                                onClick={() => handleStartEdit(review)}
                                disabled={
                                  isSubmitting || deletingReviewId === review.id
                                }
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                className={`${styles.reviewButton} ${styles.reviewButtonDelete}`}
                                onClick={() => handleDeleteReview(review.id)}
                                disabled={deletingReviewId === review.id}
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
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
