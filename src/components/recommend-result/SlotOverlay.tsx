"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./result.module.css";

const SLOT_EMOJIS = ["🍱", "🍜", "🍔", "🥘", "🍣", "🥟", "🍝", "🍛"];

type SlotOverlayProps = {
  show: boolean;
  emojiIndex: number;
};

export default function SlotOverlay({ show, emojiIndex }: SlotOverlayProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || typeof document === "undefined") return null;

  const overlay = (
    <div
      className={`${styles.slotOverlay} ${show ? styles.slotOverlayShow : ""}`}
      aria-hidden={!show}
    >
      <div className={styles.slotBox}>
        <span className={styles.slotEmoji}>
          {SLOT_EMOJIS[emojiIndex % SLOT_EMOJIS.length]}
        </span>
        <div className={styles.slotText}>점메추 중...</div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
