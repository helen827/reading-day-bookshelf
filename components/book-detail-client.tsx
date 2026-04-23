"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

import { availableYears, formatRecommender, type Book } from "@/lib/books";

type BookDetailClientProps = {
  book: Book;
  prevBook: Book;
  nextBook: Book;
};

const SWIPE_THRESHOLD = 48;

export function BookDetailClient({ book, prevBook, nextBook }: BookDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const touchStartX = useRef<number | null>(null);
  const yearFromQuery = searchParams.get("year");
  const activeYear =
    yearFromQuery && availableYears.includes(yearFromQuery) ? yearFromQuery : book.year;
  const yearSuffix = `?year=${activeYear}`;

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (startX == null || endX == null) {
      return;
    }

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    if (deltaX < 0) {
      router.push(`/books/${nextBook.id}${yearSuffix}`);
      return;
    }

    router.push(`/books/${prevBook.id}${yearSuffix}`);
  };

  return (
    <main
      className="min-h-screen bg-[#f8f5f1] px-4 py-6 text-[#28211b] sm:px-8 sm:py-8 md:px-12 md:py-10"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mx-auto max-w-[58rem]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/${yearSuffix}`}
              className="inline-flex items-center rounded-2xl bg-white/75 px-5 py-2.5 text-sm font-light text-[#5e574f] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-white"
            >
              ← 返回书单首页
            </Link>
            <Link
              href={`/books/${prevBook.id}${yearSuffix}`}
              className="rounded-2xl bg-white/75 px-4 py-2.5 text-sm font-light text-[#5e574f] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-white"
            >
              上一本
            </Link>
            <Link
              href={`/books/${nextBook.id}${yearSuffix}`}
              className="rounded-2xl bg-white/75 px-4 py-2.5 text-sm font-light text-[#5e574f] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-white"
            >
              下一本
            </Link>
          </div>

        </div>

        <article className="mt-5 overflow-hidden rounded-[28px] border border-black/5 bg-[#fbf8f4] shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
          <div className="grid md:grid-cols-[17rem_minmax(0,1fr)] lg:grid-cols-[18.5rem_minmax(0,1fr)]">
            <div className="border-b border-black/5 bg-[#f4ede5] p-4 md:border-b-0 md:border-r md:p-7">
              <div className="flex items-start gap-4 md:block">
                <div className="relative aspect-[2/3] w-[6.5rem] flex-none overflow-hidden rounded-[14px] border border-black/5 sm:w-[7.2rem] md:mx-auto md:w-full md:max-w-[12rem] md:rounded-[18px]">
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 120px, 280px"
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 rounded-[14px] border border-black/5 bg-white/60 px-4 py-3 md:mt-4 md:rounded-[18px] md:px-5 md:py-5">
                  <p className="font-serif text-[1.05rem] font-light leading-[1.2] tracking-[-0.02em] text-[#211b16] md:text-[1.4rem] md:leading-[1.15] md:tracking-[-0.03em]">
                    {book.title}
                  </p>
                  <p className="mt-2 text-[12px] font-light leading-6 text-[#6a6159] md:mt-3 md:text-sm md:leading-7">
                    作者：{book.author || "作者信息待补充"}
                  </p>
                  <p className="mt-1 text-[12px] font-light leading-6 text-[#6a6159] md:mt-2 md:text-sm md:leading-7">
                    推荐人：{formatRecommender(book.recommender)}
                  </p>
                </div>
              </div>

              <p className="mt-3 block text-[11px] font-light text-[#8b7e72] md:hidden">
                左滑下一本 · 右滑上一本
              </p>
            </div>

            <div className="p-5 sm:p-7 lg:p-10">
              <div className="space-y-8 md:space-y-9">
                <section>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8f84]">Quote</p>
                  <blockquote className="mt-3 font-serif text-[1.2rem] font-light leading-[1.45] tracking-[-0.02em] text-[#2a241d] sm:text-[1.35rem] md:mt-4 md:text-[1.6rem]">
                    {book.quote}
                  </blockquote>
                </section>

                <section>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8f84]">Recommendation</p>
                  <p className="mt-3 whitespace-pre-line text-[15px] font-light leading-8 text-[#5f564d] md:mt-4 md:leading-9">
                    {book.recommendation}
                  </p>
                </section>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-6">
                <Link
                  href={`/books/${prevBook.id}${yearSuffix}`}
                  className="inline-flex items-center rounded-2xl bg-white/75 px-4 py-2.5 text-sm font-light text-[#5e574f] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-white"
                >
                  ← 上一本：{prevBook.title}
                </Link>
                <Link
                  href={`/books/${nextBook.id}${yearSuffix}`}
                  className="inline-flex items-center rounded-2xl bg-white/75 px-4 py-2.5 text-sm font-light text-[#5e574f] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-white"
                >
                  下一本：{nextBook.title} →
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
