export type Book = {
  /** Project Gutenberg text number, doubles as the route + file id */
  id: string;
  title: string;
  author: string;
  /** rough page estimate for progress math (file bytes ÷ ~1400) */
  pages: number;
  /** cloth-binding color for spines and covers */
  cloth: string;
  /** a real line from the book, shown as Leaf Drops */
  quote: string;
  genre: string;
};

export const CATALOG: Book[] = [
  {
    id: "1342",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    pages: 430,
    cloth: "#54756b",
    quote:
      "I declare after all there is no enjoyment like reading! How much sooner one tires of anything than of a book!",
    genre: "Romance",
  },
  {
    id: "84",
    title: "Frankenstein",
    author: "Mary Shelley",
    pages: 310,
    cloth: "#4e5d68",
    quote: "There is something at work in my soul, which I do not understand.",
    genre: "Gothic",
  },
  {
    id: "11",
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    pages: 140,
    cloth: "#746a3f",
    quote: "'Curiouser and curiouser!' cried Alice.",
    genre: "Wonder",
  },
  {
    id: "345",
    title: "Dracula",
    author: "Bram Stoker",
    pages: 430,
    cloth: "#3e3b45",
    quote:
      "Listen to them, the children of the night. What music they make!",
    genre: "Gothic",
  },
  {
    id: "1661",
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    pages: 220,
    cloth: "#6b7d4f",
    quote: "There is nothing more deceptive than an obvious fact.",
    genre: "Mystery",
  },
  {
    id: "98",
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    pages: 350,
    cloth: "#8a5a44",
    quote:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.",
    genre: "Classic",
  },
  {
    id: "5200",
    title: "Metamorphosis",
    author: "Franz Kafka",
    pages: 160,
    cloth: "#5c5248",
    quote:
      "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.",
    genre: "Strange",
  },
  {
    id: "1952",
    title: "The Yellow Wallpaper",
    author: "Charlotte Perkins Gilman",
    pages: 160,
    cloth: "#9a8250",
    quote:
      "I don't want to leave now until I have found it out. It is the same woman, I know, for she is always creeping.",
    genre: "Quiet horror",
  },
  {
    id: "2701",
    title: "Moby-Dick",
    author: "Herman Melville",
    pages: 520,
    cloth: "#2f4858",
    quote: "Call me Ishmael.",
    genre: "Epic",
  },
  {
    id: "1400",
    title: "Great Expectations",
    author: "Charles Dickens",
    pages: 400,
    cloth: "#6e5544",
    quote:
      "Heaven knows we need never be ashamed of our tears, for they are rain upon the blinding dust of earth.",
    genre: "Classic",
  },
  {
    id: "76",
    title: "Adventures of Huckleberry Finn",
    author: "Mark Twain",
    pages: 250,
    cloth: "#7d6b4a",
    quote: "All right, then, I'll GO to hell.",
    genre: "Adventure",
  },
];

export function getBook(id: string): Book | undefined {
  return CATALOG.find((b) => b.id === id);
}

export function bookFile(id: string): string {
  return `/books/${id}.epub`;
}
