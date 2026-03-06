"use client";

import styles from "./result.module.css";

type ResultActionsProps = {
  onReroll: () => void;
  onNaverMap: () => void;
  onDetail: () => void;
  onSelectRestaurant: () => void;
  isSelecting: boolean;
};

export default function ResultActions({
  onReroll,
  onNaverMap,
  onDetail,
  onSelectRestaurant,
  isSelecting,
}: ResultActionsProps) {
  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnRetry}`}
        onClick={onReroll}
      >
        <span className={styles.btnIcon}>🎲</span>
        다시 추천
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnMap}`}
        onClick={onNaverMap}
      >
        <span className={styles.btnIcon}>🗺️</span>
        네이버지도
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnDetail}`}
        onClick={onDetail}
      >
        <span className={styles.btnIcon}>📋</span>
        상세보기
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnPick}`}
        onClick={onSelectRestaurant}
        disabled={isSelecting}
      >
        <span className={styles.btnIcon}>🍚</span>
        {isSelecting ? "저장 중..." : "이 식당에서 먹기"}
      </button>
    </div>
  );
}
