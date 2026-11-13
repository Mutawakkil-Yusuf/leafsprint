import { notFound } from "next/navigation";
import { CATALOG, getBook } from "@/lib/catalog";
import { ReaderClient } from "./ReaderClient";

export const metadata = {
  title: "Reading",
};

export function generateStaticParams() {
  return CATALOG.map((b) => ({ id: b.id }));
}

export default async function ReadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();
  return <ReaderClient bookId={id} />;
}
