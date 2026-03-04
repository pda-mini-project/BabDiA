"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layouts/app-shell";
import ResultCard from "@/components/recommend-result/ResultCard";
import ResultActions from "@/components/recommend-result/ResultActions";
import ResultInfoCard from "@/components/recommend-result/ResultInfoCard";
import SlotOverlay from "@/components/recommend-result/SlotOverlay";
import {
  SAMPLE_RESTAURANTS,
  pickRecommendation,
  pickRecommendationExcluding,
} from "@/lib/result";
import styles from "@/components/recommend-result/result.module.css";

const REROLL_DURATION_MS = 1200;
const SLOT_INTERVAL_MS = 120;

export default function RecommendResultContent() {
  const sp = useSearchParams();

  useMemo(() => sp.getAll("tag"), [sp]);

  const [current, setCurrent] = useState(() =>
    pickRecommendation(SAMPLE_RESTAURANTS),
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);
  const [slotEmojiIndex, setSlotEmojiIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

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
    setDetailOpen(false);
    setIsRerolling(true);
    setTimeout(() => {
      setCurrent((prev) =>
        pickRecommendationExcluding(SAMPLE_RESTAURANTS, prev.id),
      );
      setCardKey((k) => k + 1);
      setIsRerolling(false);
    }, REROLL_DURATION_MS);
  }, []);

  const handleNaverMap = useCallback(() => {
    const query = current.mapQuery ?? current.name;
    window.open(
      `https://map.naver.com/v5/search/${encodeURIComponent(query)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [current]);

  const handleDetail = useCallback(() => {
    setDetailOpen((prev) => !prev);
  }, []);

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
            <ResultInfoCard restaurant={current} isOpen={detailOpen} />
          </div>
        </div>
      </div>

      <SlotOverlay show={isRerolling} emojiIndex={slotEmojiIndex} />
    </AppShell>
  );
}
