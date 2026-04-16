import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import "../styles/MyBooksPage.css";

function MyBooksPage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/books/userbooks")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (bookId) => {
    try {
      const res = await fetch(`http://localhost:8000/books/${bookId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("delete failed", data);
        return;
      }

      setBooks((prev) => prev.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error("delete error", error);
    }
  };

  const wantToReadBooks = books.filter((book) => book.status === "want_to_read");
  const readingBooks = books.filter((book) => book.status === "reading");
  const finishedBooks = books.filter((book) => book.status === "finished");
  const abandonedBooks = books.filter((book) => book.status === "abandoned");

  const renderSection = (title, items) => (
    <section className="books-section">
      <h2 className="books-section-title">{title}</h2>

      <div className="results-grid">
        {items.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            showDelete={true}
            onDelete={() => handleDelete(book.id)}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="my-books-page">
      {renderSection("Currently Reading", readingBooks)}
      {renderSection("Want to Read", wantToReadBooks)}
      {renderSection("Finished", finishedBooks)}
      {renderSection("Abandoned", abandonedBooks)}
    </div>
  );
}

export default MyBooksPage;