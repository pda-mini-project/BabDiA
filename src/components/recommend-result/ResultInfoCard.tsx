"use client";

import type { Restaurant } from "@/type/result";
import styles from "./result.module.css";

type ResultInfoCardProps = {
  restaurant: Restaurant;
  isOpen: boolean;
};

export default function ResultInfoCard({
  restaurant,
  isOpen,
}: ResultInfoCardProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.infoCard}>
      <div className={styles.infoRow}>
        <span className={styles.infoKey}>대표 메뉴</span>
        <span className={styles.infoVal}>{restaurant.recommendedMenu}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoKey}>위치</span>
        <span className={styles.infoVal}>
          {restaurant.address ?? "-"}
        </span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoKey}>혼밥</span>
        <span className={styles.infoVal}>{restaurant.solo ?? "-"}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoKey}>신호등</span>
        <span className={styles.infoVal}>
          {restaurant.crosswalk ?? "-"}
        </span>
      </div>
    </div>
  );
}
