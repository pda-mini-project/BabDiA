"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import RestaurantDetailView from "@/components/restaurant-detail/RestaurantDetailView";
import type { RestaurantDetailRecord } from "@/data/restaurant-details";
import styles from "./result.module.css";

type DetailModalProps = {
  restaurantId: string | null;
  onClose: () => void;
};

export default function DetailModal({ restaurantId, onClose }: DetailModalProps) {
  const [detail, setDetail] = useState<RestaurantDetailRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!restaurantId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setDetail(null);
    fetch(`/api/restaurants/${restaurantId}/detail`)
      .then((res) => res.json())
      .then((data) => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (restaurantId) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [restaurantId, onClose]);

  if (!mounted || !restaurantId || typeof document === "undefined") return null;

  const modal = (
    <div
      className={styles.detailModalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="식당 상세"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.detailModalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.detailModalHeader}>
          <h2 className={styles.detailModalTitle}>식당 상세</h2>
          <button
            type="button"
            className={styles.detailModalClose}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className={styles.detailModalBody}>
          {loading && (
            <div className={styles.detailModalLoading}>불러오는 중...</div>
          )}
          {!loading && detail && (
            <RestaurantDetailView restaurant={detail} restaurantId={restaurantId} />
          )}
          {!loading && !detail && (
            <div className={styles.detailModalLoading}>
              상세 정보를 불러오지 못했습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
