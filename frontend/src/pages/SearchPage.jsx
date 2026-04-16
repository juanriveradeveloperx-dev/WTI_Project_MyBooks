import "../styles/SearchPage.css";
import BookCard from "../components/BookCard";
import BookPreview from "../components/PreviewCard";
import { useEffect, useState } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (query.trim().length < 4) {
      setBooks([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetch(`http://localhost:8000/books/search?query=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setBooks(data.items || []);
        })
        .catch((err) => console.error(err));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handlePreview = (book) => {
    setSelectedBook(book);
  };

  const handleClosePreview = () => {
    setSelectedBook(null);
  };

  const handleSave = async (book) => {
    const payload = {
      user_id: 1,
      google_volume_id: book.id,
      title: book.title,
      authors: book.authors || null,
      description: book.description || null,
      thumbnail: book.thumbnail || null,
      preview_link: book.previewLink || null,
      publisher: book.publisher || null,
      published_date: book.publishedDate || null,
      page_count: book.pageCount || null,
      status: "want_to_read",
      rating: null,
      notes: null,
    };

    try {
      const res = await fetch("http://localhost:8000/books/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("save failed", data);
        return;
      }

      console.log("saved book", data);
    } catch (error) {
      console.error("save error", error);
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-box-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search books..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="results-section">
        <div className="results-grid">
          {books.map((book) => (

            <BookCard
              key={book.id}
              book={book}
              showPreview={true}
              showSave={true}
              onPreview={() => handlePreview(book)}
              onSave={() => handleSave(book)}
            />
          ))}
        </div>
      </section>

      {selectedBook && (
        <div className="preview-overlay" onClick={handleClosePreview}>
          <div
            className="preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="preview-close" onClick={handleClosePreview}>
              ×
            </button>

            <h2 className="preview-title">{selectedBook.title}</h2>

            <BookPreview volumeId={selectedBook.id} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;