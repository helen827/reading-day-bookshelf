import { notFound } from "next/navigation";

import { BookDetailClient } from "@/components/book-detail-client";
import { getBookById, getBooksByYear } from "@/lib/books";

type BookPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = getBookById(id);
  if (!book) {
    notFound();
  }

  const currentYearBooks = getBooksByYear(book.year);
  const currentIndex = currentYearBooks.findIndex((item) => item.id === book.id);
  const prevBook = currentYearBooks[(currentIndex - 1 + currentYearBooks.length) % currentYearBooks.length];
  const nextBook = currentYearBooks[(currentIndex + 1) % currentYearBooks.length];

  return <BookDetailClient book={book} prevBook={prevBook} nextBook={nextBook} />;
}
