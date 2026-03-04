"use client";

import styles from "./result.module.css";

const SLOT_EMOJIS = ["🍱", "🍜", "🍔", "🥘", "🍣", "🥟", "🍝", "🍛"];

type SlotOverlayProps = {
  show: boolean;
  emojiIndex: number;
};

export default function SlotOverlay({ show, emojiIndex }: SlotOverlayProps) {
  return (
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
}
