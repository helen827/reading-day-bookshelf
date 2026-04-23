"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatRecommender, type Book } from "@/lib/books";

type HeroBookStackProps = {
  books: Book[];
  onSelect: (book: Book) => void;
};

const heroOffsets = [
  { x: "-28.6rem", y: "1.6rem", rotate: -8.2, z: 15, scale: 0.965 },
  { x: "-22.1rem", y: "1.15rem", rotate: -3.6, z: 18, scale: 0.98 },
  { x: "-15.4rem", y: "1.85rem", rotate: 2.4, z: 16, scale: 0.97 },
  { x: "-8.9rem", y: "1.3rem", rotate: -4.7, z: 20, scale: 0.99 },
  { x: "-3.2rem", y: "1.75rem", rotate: 1.8, z: 17, scale: 0.98 },
  { x: "3.2rem", y: "1.2rem", rotate: -1.6, z: 19, scale: 0.97 },
  { x: "9.1rem", y: "1.95rem", rotate: 4.1, z: 18, scale: 0.99 },
  { x: "15.8rem", y: "1.4rem", rotate: -2.8, z: 16, scale: 0.97 },
  { x: "22.2rem", y: "1.8rem", rotate: 5.9, z: 17, scale: 0.98 },
  { x: "28.5rem", y: "1.25rem", rotate: 2.2, z: 15, scale: 0.965 },
] as const;

const mobileHeroOffsets = [
  { x: "-7.6rem", y: "1.45rem", rotate: -7.2, z: 16, scale: 0.965 },
  { x: "-3.75rem", y: "1.1rem", rotate: -3.1, z: 18, scale: 0.985 },
  { x: "0rem", y: "1.6rem", rotate: 1.8, z: 20, scale: 1 },
  { x: "3.85rem", y: "1.2rem", rotate: -2.7, z: 18, scale: 0.985 },
  { x: "7.65rem", y: "1.55rem", rotate: 5.2, z: 16, scale: 0.965 },
] as const;

function remToPx(remValue: string) {
  return Number.parseFloat(remValue) * 16;
}

export function HeroBookStack({ books, onSelect }: HeroBookStackProps) {
  const stackCenterOffsetRem = 0;
  const [isMobile, setIsMobile] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const suppressClickRef = useRef(false);
  const dragSessionRef = useRef<{
    pointerId: number;
    pointerType: string;
    startX: number;
    latestX: number;
    didMove: boolean;
  } | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const syncMode = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    syncMode(mediaQuery);
    mediaQuery.addEventListener("change", syncMode);
    return () => mediaQuery.removeEventListener("change", syncMode);
  }, []);

  const windowSize = isMobile ? 5 : 9;
  const slideStep = 1;
  const maxStartIndex = Math.max(0, books.length - windowSize);

  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStartIndex));
  }, [maxStartIndex]);

  const handlePrev = () => {
    setStartIndex((current) => Math.max(0, current - slideStep));
  };

  const handleNext = () => {
    setStartIndex((current) => Math.min(maxStartIndex, current + slideStep));
  };

  const visibleBooks = useMemo(
    () => books.slice(startIndex, startIndex + windowSize),
    [books, startIndex, windowSize]
  );

  const orderedFeatured = visibleBooks;
  const placements = isMobile ? mobileHeroOffsets : heroOffsets;
  const canSlide = books.length > windowSize;
  const dragThreshold = isMobile ? 32 : 42;
  const centerOffsetPx = remToPx(`${stackCenterOffsetRem}rem`);
  const desktopLeftControlX = `calc(50% + ${heroOffsets[0].x} + ${stackCenterOffsetRem}rem - 4.2rem)`;
  const desktopRightControlX = `calc(50% + ${
    heroOffsets[heroOffsets.length - 1].x
  } + ${stackCenterOffsetRem}rem + 4.2rem)`;
  const leftPeekBook = startIndex > 0 ? books[startIndex - 1] : null;
  const rightPeekBook =
    startIndex + windowSize < books.length ? books[startIndex + windowSize] : null;
  const firstPlacement = placements[0];
  const lastPlacement = placements[Math.min(windowSize, placements.length) - 1];
  const edgePeekOffsetRem = isMobile ? 2.9 : 4.9;
  const edgePeekOffsetPx = remToPx(`${edgePeekOffsetRem}rem`);
  const isControlTarget = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    Boolean(target.closest("[data-hero-control='true']"));

  const finalizeDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    dragSessionRef.current = null;
    setIsDragging(false);

    const deltaX = event.clientX - session.startX;
    if (!canSlide || Math.abs(deltaX) < dragThreshold) {
      return;
    }

    suppressClickRef.current = true;
    if (deltaX < 0) {
      handleNext();
      return;
    }

    handlePrev();
  };

  return (
    <div
      className={`relative mx-auto mt-8 h-[16rem] w-full max-w-[72rem] overflow-hidden select-none touch-pan-y sm:mt-10 sm:h-[20rem] sm:overflow-visible ${
        isDragging ? "cursor-grabbing" : canSlide ? "cursor-grab" : ""
      }`}
      onPointerDown={(event) => {
        if (!canSlide) {
          return;
        }
        if (isControlTarget(event.target)) {
          return;
        }

        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        dragSessionRef.current = {
          pointerId: event.pointerId,
          pointerType: event.pointerType,
          startX: event.clientX,
          latestX: event.clientX,
          didMove: false,
        };
      }}
      onPointerMove={(event) => {
        const session = dragSessionRef.current;
        if (!session || session.pointerId !== event.pointerId) {
          return;
        }

        session.latestX = event.clientX;
        if (Math.abs(event.clientX - session.startX) > 6) {
          session.didMove = true;
          setIsDragging(true);
        }
      }}
      onPointerUp={finalizeDrag}
      onPointerCancel={finalizeDrag}
    >
      {canSlide && !isMobile ? (
        <>
          <button
            type="button"
            onClick={handlePrev}
            disabled={startIndex === 0}
            data-hero-control="true"
            className="absolute top-1/2 z-[90] -translate-y-1/2 rounded-full border border-black/15 bg-white px-3 py-1.5 text-xl text-[#2f2923] shadow-[0_8px_18px_rgba(0,0,0,0.14)] backdrop-blur transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-35"
            style={{ left: desktopLeftControlX }}
            aria-label="查看上一批封面"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={startIndex >= maxStartIndex}
            data-hero-control="true"
            className="absolute top-1/2 z-[90] -translate-y-1/2 rounded-full border border-black/15 bg-white px-3 py-1.5 text-xl text-[#2f2923] shadow-[0_8px_18px_rgba(0,0,0,0.14)] backdrop-blur transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-35"
            style={{ left: desktopRightControlX }}
            aria-label="查看下一批封面"
          >
            ›
          </button>
        </>
      ) : null}
      {leftPeekBook ? (
        <motion.div
          key={`${leftPeekBook.id}-left-peek`}
          initial={false}
          animate={{
            opacity: 0.45,
            x: remToPx(firstPlacement.x) + centerOffsetPx - edgePeekOffsetPx,
            y: remToPx(firstPlacement.y) + remToPx("0.15rem"),
            rotate: firstPlacement.rotate - 2.6,
            scale: (firstPlacement.scale ?? 1) * 0.9,
          }}
          transition={{
            type: "spring",
            stiffness: 170,
            damping: 24,
            mass: 0.9,
          }}
          className="pointer-events-none absolute left-1/2 top-0 aspect-[0.66] w-[6.15rem] -translate-x-1/2 overflow-hidden rounded-[18px] bg-[#f4ede5] shadow-[0_8px_20px_rgba(0,0,0,0.07)] sm:w-[7rem] lg:w-[7.35rem]"
          style={{ zIndex: 3, transformOrigin: "center bottom" }}
          aria-hidden="true"
        >
          <Image
            src={leftPeekBook.cover_url}
            alt=""
            fill
            sizes="(max-width: 640px) 154px, 180px"
            unoptimized
            className="object-cover"
          />
        </motion.div>
      ) : null}
      {rightPeekBook ? (
        <motion.div
          key={`${rightPeekBook.id}-right-peek`}
          initial={false}
          animate={{
            opacity: 0.45,
            x: remToPx(lastPlacement.x) + centerOffsetPx + edgePeekOffsetPx,
            y: remToPx(lastPlacement.y) + remToPx("0.18rem"),
            rotate: lastPlacement.rotate + 2.8,
            scale: (lastPlacement.scale ?? 1) * 0.9,
          }}
          transition={{
            type: "spring",
            stiffness: 170,
            damping: 24,
            mass: 0.9,
          }}
          className="pointer-events-none absolute left-1/2 top-0 aspect-[0.66] w-[6.15rem] -translate-x-1/2 overflow-hidden rounded-[18px] bg-[#f4ede5] shadow-[0_8px_20px_rgba(0,0,0,0.07)] sm:w-[7rem] lg:w-[7.35rem]"
          style={{ zIndex: 3, transformOrigin: "center bottom" }}
          aria-hidden="true"
        >
          <Image
            src={rightPeekBook.cover_url}
            alt=""
            fill
            sizes="(max-width: 640px) 154px, 180px"
            unoptimized
            className="object-cover"
          />
        </motion.div>
      ) : null}
      {orderedFeatured.map((book, index) => {
        const placement = placements[index % placements.length];

        return (
          <motion.button
            key={book.id}
            type="button"
            initial={false}
            animate={{
              opacity: 1,
              x: remToPx(placement.x) + centerOffsetPx,
              y: remToPx(placement.y),
              rotate: placement.rotate,
              scale: placement.scale ?? 1,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 26,
              mass: 0.9,
            }}
            whileHover={{
              y: -18,
              scale: (placement.scale ?? 1) * 1.04,
              zIndex: 60,
              transition: { duration: 0.12, ease: "easeOut" },
            }}
            whileTap={{
              scale: 0.985,
              transition: { duration: 0.08, ease: "easeOut" },
            }}
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
              }
              onSelect(book);
            }}
            className="group absolute left-1/2 top-0 aspect-[0.66] w-[6.15rem] -translate-x-1/2 overflow-hidden rounded-[18px] bg-[#f4ede5] text-left shadow-[0_10px_24px_rgba(0,0,0,0.09)] sm:w-[7rem] lg:w-[7.35rem]"
            style={{
              zIndex: placement.z,
              transformOrigin: "center bottom",
            }}
          >
            <div className="absolute inset-0">
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                sizes="(max-width: 640px) 154px, 180px"
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_38%,rgba(0,0,0,0.16)_100%)]" />
            <div className="pointer-events-none absolute inset-0 rounded-[20px]" />
          </motion.button>
        );
      })}
    </div>
  );
}

type BookListItemProps = {
  book: Book;
  index: number;
  onSelect: (book: Book) => void;
};

export function BookListItem({ book, index, onSelect }: BookListItemProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 100,
        delay: index * 0.06,
      }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onSelect(book)}
      className="group grid w-full grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 rounded-[18px] border border-black/5 bg-white/55 p-3 text-left backdrop-blur-sm transition-colors hover:bg-white/70 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-start sm:gap-6 sm:rounded-[22px] sm:p-5"
    >
      <div className="relative aspect-[2/3] w-[3.5rem] overflow-hidden rounded-[10px] border border-black/5 bg-[#f4efe8] sm:w-auto sm:rounded-[14px]">
        <Image
          src={book.cover_url}
          alt={book.title}
          fill
          sizes="(max-width: 640px) 56px, 72px"
          unoptimized
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="font-serif text-[1.2rem] font-light leading-[1.1] tracking-[-0.02em] text-[#23201c] sm:text-[1.45rem] sm:leading-none sm:tracking-[-0.03em]">
            {book.title}
          </h3>
          <p className="text-[11px] font-light leading-5 text-[#7b7168] sm:text-xs">
            {formatRecommender(book.recommender)}
          </p>
        </div>
        <p className="mt-2 hidden line-clamp-2 text-[13px] font-light leading-6 text-[#655d56] sm:mt-4 sm:block sm:line-clamp-3 sm:text-[15px] sm:leading-8">
          {book.quote}
        </p>
      </div>
    </motion.button>
  );
}
