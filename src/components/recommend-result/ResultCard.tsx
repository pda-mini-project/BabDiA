"use client";

import { useState, useEffect } from "react";
import type { Restaurant } from "@/type/result";
import styles from "./result.module.css";

type ResultCardProps = {
  restaurant: Restaurant;
  cardKey?: string | number;
};

export default function ResultCard({ restaurant, cardKey }: ResultCardProps) {
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const imageUrl = restaurant.imageUrl ?? fetchedUrl ?? null;

  useEffect(() => {
    if (restaurant.imageUrl || !restaurant.naverMapUrl) return;
    fetch(
      `/api/restaurant-image?url=${encodeURIComponent(restaurant.naverMapUrl)}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (d?.imageUrl) setFetchedUrl(d.imageUrl);
      })
      .catch(() => {});
  }, [restaurant.id, restaurant.naverMapUrl, restaurant.imageUrl]);

  return (
    <div className={styles.resultCard} key={cardKey}>
      <div className={styles.resultImg}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={restaurant.name}
            className={styles.resultImgPhoto}
          />
        ) : (
          <span>{restaurant.emoji}</span>
        )}
        <div className={styles.resultBadge}>⭐ {restaurant.rating}</div>
      </div>
      <div className={styles.resultBody}>
        <div className={styles.resultName}>{restaurant.name}</div>
        <div className={styles.resultMeta}>
          <span>🚶 도보 {restaurant.walkMin}분</span>
          <span>💰 {restaurant.price}</span>
          <span>⏳ {restaurant.wait}</span>
        </div>
        <div className={styles.resultTags}>
          {restaurant.tags.map((t) => (
            <span key={t} className={styles.rtag}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
