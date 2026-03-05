"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layouts/app-shell";
import ResultCard from "@/components/recommend-result/ResultCard";
import ResultActions from "@/components/recommend-result/ResultActions";
import DetailModal from "@/components/recommend-result/DetailModal";
import SlotOverlay from "@/components/recommend-result/SlotOverlay";
import { pickRecommendation, pickRecommendationExcluding } from "@/lib/result";
import type { Restaurant } from "@/type/result";
import styles from "@/components/recommend-result/result.module.css";

const REROLL_DURATION_MS = 1200;
const SLOT_INTERVAL_MS = 120;

export default function RecommendResultContent() {
  const sp = useSearchParams();
  const tagParams = useMemo(() => sp.getAll("tag"), [sp]);
  const preset = sp.get("preset");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<Restaurant | null>(null);
  const [detailRestaurantId, setDetailRestaurantId] = useState<string | null>(null);
  const [isRerolling, setIsRerolling] = useState(false);
  const [slotEmojiIndex, setSlotEmojiIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  const list = restaurants;

  useEffect(() => {
    const query = new URLSearchParams();
    tagParams.forEach((t) => query.append("tag", t));
    if (preset) query.set("preset", preset);
    setLoading(true);
    fetch(`/api/recommend?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data.restaurants) ? data.restaurants : [];
        setRestaurants(arr);
        if (arr.length === 0) setCurrent(null);
      })
      .catch(() => {
        setRestaurants([]);
        setCurrent(null);
      })
      .finally(() => setLoading(false));
  }, [tagParams.join(","), preset]);

  useEffect(() => {
    if (loading || list.length === 0) return;
    setCurrent(pickRecommendation(list));
  }, [loading, restaurants, list.length]);

  useEffect(() => {
    document.title = "🎰 점메추 결과";
    return () => {
      document.title = "";
    };
  }, []);

  useEffect(() => {
    if (!isRerolling) return;
    const interval = setInterval(() => {
      setSlotEmojiIndex((i) => i + 1);
    }, SLOT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isRerolling]);

  const handleReroll = useCallback(() => {
    setIsRerolling(true);
    setTimeout(() => {
      setCurrent((prev) =>
        prev ? pickRecommendationExcluding(list, prev.id) : pickRecommendation(list),
      );
      setCardKey((k) => k + 1);
      setIsRerolling(false);
    }, REROLL_DURATION_MS);
  }, [list]);

  const handleNaverMap = useCallback(() => {
    if (!current) return;
    const url = current.naverMapUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      const query = current.mapQuery ?? current.name;
      window.open(
        `https://map.naver.com/v5/search/${encodeURIComponent(query)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }, [current]);

  const handleDetail = useCallback(() => {
    if (!current) return;
    setDetailRestaurantId(current.id);
  }, [current]);

  if (loading) {
    return (
      <AppShell>
        <div className={styles.wrap}>
          <div className={styles.main}>
            <div className={styles.content} style={{ padding: 48, textAlign: "center" }}>
              추천 목록 불러오는 중...
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!current) {
    return (
      <AppShell>
        <div className={styles.wrap}>
          <div className={styles.main}>
            <div className={styles.content} style={{ padding: 48, textAlign: "center" }}>
              <p style={{ marginBottom: 24 }}>
                조건에 맞는 식당이 없어요. 태그를 바꿔 보거나 식당을 추가해 주세요.
              </p>
              <Link
                href="/recommend"
                className={styles.emptyStateBtn}
              >
                점메추 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={styles.wrap}>
        <div className={styles.main}>
          <div className={styles.content}>
            <div className={styles.pageLabel}>오늘의 추천</div>
            <h1 className={styles.pageTitle}>
              오늘 점심은
              <br />
              <span className={styles.pageTitleHighlight}>
                {current.name}
              </span>{" "}
              어때?
            </h1>

            <ResultCard restaurant={current} cardKey={cardKey} />
            <ResultActions
              onReroll={handleReroll}
              onNaverMap={handleNaverMap}
              onDetail={handleDetail}
            />
          </div>
        </div>
      </div>

      <DetailModal
        restaurantId={detailRestaurantId}
        onClose={() => setDetailRestaurantId(null)}
      />
      <SlotOverlay show={isRerolling} emojiIndex={slotEmojiIndex} />
    </AppShell>
  );
}
