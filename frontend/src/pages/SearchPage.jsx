import "../styles/SearchPage.css";
import BookCard from "../components/BookCard";
import BookPreview from "../components/PreviewCard";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useSavedBooks } from "../context/SavedBooksContext";
const API_BASE = import.meta.env.VITE_API_BASE_URL;


function SearchPage() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [loadingActions, setLoadingActions] = useState({});

  const user = useUser();
  const {
    loadSavedBooks,
    refreshSavedBooks,
    isBookSaved,
  } = useSavedBooks();

  const setLoading = (bookId, value) => {
    setLoadingActions((prev) => ({
      ...prev,
      [bookId]: value,
    }));
  };

  useEffect(() => {
    loadSavedBooks();
  }, []);

  useEffect(() => {
    if (query.trim().length < 4) {
      setBooks([]);
      setSearchError(false);
      setLoadingSearch(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoadingSearch(true);
      setSearchError(false);

      fetch(`${API_BASE}/books/search?query=${encodeURIComponent(query)}`)
        .then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.detail || "Search failed");
          }

          return data;
        })
        .then((data) => {
          setBooks(data.items || []);
        })
        .catch((err) => {
          console.error(err);
          setBooks([]);
          setSearchError(true);
        })
        .finally(() => setLoadingSearch(false));
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
    setLoading(book.id, "saving");

    const payload = {
      user_id: user.id,
      google_volume_id: book.id,
      title: book.title,
      authors: book.authors || null,
      description: book.description || null,
      thumbnail: book.thumbnail || null,
      preview_link: book.previewLink || null,
      info_link: book.infoLink || null,
      publisher: book.publisher || null,
      published_date: book.publishedDate || null,
      page_count: book.pageCount || null,
      status: "want_to_read",
      rating: null,
      notes: null,
    };

    try {
      const res = await fetch(`${API_BASE}/books/save`, {
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

      await refreshSavedBooks();
    } catch (error) {
      console.error("save error", error);
    } finally {
      setLoading(book.id, null);
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
        {!query ? (
        <h3 className="search-title">
          Search for any book you would like to read
        </h3>
        ) :
        <p></p>
        }
        {searchError ? (
          <h2 className="search-error-title">
            Ups! We could not find any books :) Try again.
          </h2>
        ) : (
          <div className="results-grid">
            {loadingSearch ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="book-skeleton-card">
                  <div className="book-skeleton-image"></div>
                  <div className="book-skeleton-line title"></div>
                  <div className="book-skeleton-line author"></div>
                </div>
              ))
            ) : (
              books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onPreview={() => handlePreview(book)}
                  onSave={() => handleSave(book)}
                  showPreview={true}
                  showSave={!isBookSaved(book.id)}
                  loadingState={loadingActions[book.id]}
                />
              ))
            )}
          </div>
        )}
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