"use client";

import { m, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef } from "react";
import clsx from "clsx";
import type { DietaryTagExplanationProps } from "./types";
import { MOTION_DURATION, MOTION_OFFSET } from "@/lib/motion/constants";

import { getReligiousTagExplanation } from "@/lib/dietary/explanation";
import { getRestrictionExplanation } from "@/lib/dietary/restriction-explanation";
import { dietaryTagColors } from "@/lib/dietary/tag-styles";

const styles = {
  dialog: clsx(
    "fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto",
    "p-0",
    "rounded-sm border border-line bg-surface text-foreground backdrop:bg-black/60",
  ),
  content: "p-5",
  header: "flex items-start justify-between gap-4",
  eyebrow: "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted",
  heading: clsx(
    "inline-block mt-1 px-2 py-0.5",
    "rounded-[2px] text-lg font-semibold",
  ),
  close: clsx(
    "flex size-7 shrink-0 items-center justify-center",
    "cursor-pointer rounded-sm text-muted hover:bg-inset hover:text-foreground",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  ),
  foodName: "mt-3 text-sm font-medium",
  summary: "mt-2 text-sm leading-7 text-muted",
  ingredient: clsx(
    "inline-block max-w-full px-1.5 py-0.5 align-baseline",
    "rounded-[2px] font-semibold leading-5 wrap-anywhere",
  ),
};

export function DietaryTagExplanation({
  tag,
  foodName,
  reasons,
  restrictionMatches,
  onDismiss,
}: DietaryTagExplanationProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const prefersReducedMotion = useReducedMotion();
  const explanation =
    tag === "Restricted"
      ? getRestrictionExplanation(restrictionMatches)
      : getReligiousTagExplanation(tag, reasons);

  function dismiss() {
    dialogRef.current?.close();
    onDismiss();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          dismiss();
        }
      }}
    >
      <m.div
        className={styles.content}
        initial={
          prefersReducedMotion
            ? false
            : { opacity: 0, y: MOTION_OFFSET.explanationEnter }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : MOTION_DURATION.explanation,
        }}
      >
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Why this tag</p>
            <h2
              id={titleId}
              className={clsx(styles.heading, dietaryTagColors[tag])}
            >
              {tag === "Halal?" && <span className="sr-only">Possibly </span>}
              {tag === "Halal?" ? "Halal" : tag}
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={dismiss}
            aria-label="Close explanation"
          >
            <svg
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
        {foodName && <p className={styles.foodName}>{foodName}</p>}
        <p id={descriptionId} className={styles.summary}>
          {explanation.map((part, index) =>
            part.highlighted ? (
              <span
                key={index}
                className={clsx(styles.ingredient, dietaryTagColors[tag])}
              >
                {part.text}
              </span>
            ) : (
              part.text
            ),
          )}
        </p>
      </m.div>
    </dialog>
  );
}
