"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BookListItem, HeroBookStack } from "@/components/book-card";
import { availableYears, yearlyBookLists } from "@/lib/books";

function Divider() {
  return <div className="mx-auto my-14 h-px w-20 bg-[#e4ddd5]" />;
}

export default function Page() {
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(availableYears[0] ?? "2026");
  const yearMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const activeList =
    yearlyBookLists[selectedYear] ??
    yearlyBookLists[availableYears[0] ?? "2026"];
  const activeBooks = activeList?.books ?? [];
  const booksWithQuotes = activeBooks.filter((book) => book.quote.trim().length > 0);
  const heroTheme = activeList.heroTitleLine2.replace(/^[-—–]+\s*/, "");

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!yearMenuRef.current) {
        return;
      }

      if (!yearMenuRef.current.contains(event.target as Node)) {
        setIsYearMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsYearMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f5f1] px-9 py-6 text-[#28211b] sm:px-14 sm:py-8">
        <header className="flex items-start justify-between">
          <a
            href="https://www.volcanics.com/"
            target="_blank"
            rel="noreferrer"
            className="sticky top-6 block"
            aria-label="访问火山石投资官网"
          >
            <Image
              src="/volcanics-logo.png"
              alt="火山石投资"
              width={280}
              height={105}
              priority
              className="h-auto w-[168px] sm:w-[220px]"
            />
          </a>

          <div ref={yearMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsYearMenuOpen((open) => !open)}
              className="rounded-2xl bg-white/75 px-7 py-4 text-[15px] font-light leading-none text-[#5e574f] shadow-[0_4px_18px_rgba(0,0,0,0.04)] backdrop-blur-sm"
              aria-haspopup="menu"
              aria-expanded={isYearMenuOpen}
            >
              <span className="flex items-center gap-3">
                历年书单
                <span className="text-[#8a8178]">{selectedYear}</span>
                <span
                  className={[
                    "block text-xs transition-transform duration-200",
                    isYearMenuOpen ? "rotate-180" : "",
                  ].join(" ")}
                >
                  ▾
                </span>
              </span>
            </button>

            <AnimatePresence>
              {isYearMenuOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 mt-3 min-w-[10rem] overflow-hidden rounded-[18px] border border-black/5 bg-white/90 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md"
                >
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setSelectedYear(year);
                        setIsYearMenuOpen(false);
                      }}
                      className={[
                        "block w-full rounded-[14px] px-4 py-3 text-left text-[15px] font-light transition-colors",
                        selectedYear === year
                          ? "bg-[#f3eee8] text-[#2f2923]"
                          : "text-[#5e574f] hover:bg-[#f3eee8]",
                      ].join(" ")}
                      aria-current={selectedYear === year ? "true" : undefined}
                    >
                      {year}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </header>

        <section className="mx-auto max-w-[36rem] pb-10 pt-10 text-center sm:pt-12">
          <div className="mx-auto mb-7 h-px w-20 bg-[#e4ddd5]" />
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="mx-auto whitespace-nowrap font-serif text-[1.8rem] font-light leading-[1.08] tracking-[-0.03em] text-[#231d18] sm:text-[2.5rem]"
          >
            {activeList.year} · {heroTheme}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.08 }}
            className="mx-auto mt-5 max-w-[34rem] text-[1.1rem] font-light leading-[1.75] text-[#81766d]"
          >
            {activeList.heroLead.map((line, index) => (
              <span key={line} className={index === 0 ? "block" : "mt-2 block"}>
                {line}
              </span>
            ))}
          </motion.p>

          <HeroBookStack books={activeBooks} onSelect={(book) => router.push(`/books/${book.id}`)} />
        </section>

        <section className="mx-auto max-w-[38rem] pb-10 text-[16px] font-light leading-9 text-[#5f564d]">
          {activeList.introParagraphs.map((paragraph, index) => (
            <p key={paragraph} className={index === 0 ? "" : "mt-12"}>
              {paragraph}
            </p>
          ))}
          <Divider />

          <h2 className="text-[15px] font-light tracking-[-0.01em] text-[#2e2823]">
            Library
          </h2>
          <p className="mt-7">
            {activeList.libraryNote}
          </p>
          <Divider />

          <h2 className="text-[15px] font-light tracking-[-0.01em] text-[#2e2823]">Quotes</h2>
          <div className="mt-9 grid gap-7">
            {booksWithQuotes.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="block rounded-[20px] border border-black/5 bg-white/55 px-7 py-6 font-serif text-[16px] font-light leading-9 tracking-[-0.01em] text-[#2b231d] transition hover:-translate-y-1 hover:bg-white/70"
              >
                {book.quote}
              </Link>
            ))}
          </div>
        </section>

        <Divider />

        <section className="mx-auto max-w-[56rem] pb-20 sm:pb-32">
          <div className="mx-auto max-w-[38rem]">
            <h2 className="text-[15px] font-light tracking-[-0.01em] text-[#2e2823]">
              Annual Selection
            </h2>
            <p className="mt-7 text-[16px] font-light leading-9 text-[#5f564d]">
              {activeList.selectionHint}
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-[38rem] gap-4 sm:mt-14 sm:gap-7">
            {activeBooks.map((book, index) => (
              <BookListItem
                key={book.id}
                book={book}
                index={index}
                onSelect={(book) => router.push(`/books/${book.id}`)}
              />
            ))}
          </div>
        </section>
    </main>
  );
}
