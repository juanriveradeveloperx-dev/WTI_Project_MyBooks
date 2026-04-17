import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import BookPreview from "../components/PreviewCard";
import { useSavedBooks } from "../context/SavedBooksContext";
import { useUser } from "../context/UserContext";
import "../styles/SearchPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function SearchPage() {
  // Main page used to search Google Books and save books into the library.
  // Receives: no props.
  // Sends: search and save requests to the backend.
  // Renders: search input, result cards, empty states, and the preview modal.
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [loadingActions, setLoadingActions] = useState({});

  const user = useUser();
  const { loadSavedBooks, refreshSavedBooks, isBookSaved } = useSavedBooks();

  const setLoading = (bookId, value) => {
    // Stores loading state per book so one Save action does not block the entire page.
    setLoadingActions((prev) => ({
      ...prev,
      [bookId]: value,
    }));
  };

  useEffect(() => {
    // Trigger: runs once on mount.
    // Purpose: load the saved library so the page knows whether each result is
    // already saved and which button should be rendered.
    loadSavedBooks();
  }, []);

  useEffect(() => {
    // Trigger: runs whenever the query changes.
    // Purpose: debounce the search request so the API is called 500ms after the
    // user stops typing instead of on every keystroke.
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

    // Cleanup: clear the previous timer if the user keeps typing.
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handlePreview = (book) => {
    // Opens the preview modal for the clicked book.
    setSelectedBook(book);
  };

  const handleClosePreview = () => {
    // Closes the preview modal by clearing the active selection.
    setSelectedBook(null);
  };

  const handleSave = async (book) => {
    // Maps the Google Books search result shape into the backend save payload.
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

      // Refresh the saved-books context so the card immediately switches to In Library.
      await refreshSavedBooks();
    } catch (error) {
      console.error("save error", error);
    } finally {
      setLoading(book.id, null);
    }
  };

  // Derived flags that simplify the conditional UI rendering below.
  const showEmptyState = !query && !loadingSearch && books.length === 0;
  const showResults = !loadingSearch && books.length > 0;
  const showNoResults =
    query.length >= 4 && !loadingSearch && books.length === 0 && !searchError;

  return (
    <div className="search-page">
      {/* Hero block only appears before the user starts typing a search query. */}
      {!query && (
        <div className="search-hero">
          <h1 className="search-hero-title">Discover Your Next Read</h1>
          <p className="search-hero-subtitle">
            Search millions of books and build your personal reading collection
          </p>
        </div>
      )}

      <div className="search-header">
        <div className="search-box-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="results-section">
        {showEmptyState && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              </svg>
            </div>
            <h3 className="empty-state-title">Start Your Search</h3>
            <p className="empty-state-description">
              Type at least 4 characters to search for books across our extensive library
            </p>
          </div>
        )}

        {searchError && (
          <div className="error-state">
            <h3 className="error-state-title">Something went wrong</h3>
            <p className="error-state-description">
              We could not fetch results. Please try again.
            </p>
          </div>
        )}

        {showNoResults && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
                <path d="M8 8l6 6"/>
                <path d="M14 8l-6 6"/>
              </svg>
            </div>
            <h3 className="empty-state-title">No books found</h3>
            <p className="empty-state-description">
              Try adjusting your search terms or check for typos
            </p>
          </div>
        )}

        {showResults && (
          <div className="results-header">
            <span className="results-count">{books.length} books found</span>
          </div>
        )}

        <div className="results-grid">
          {loadingSearch ? (
            // This map creates temporary skeleton cards while the search request is in flight.
            [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="book-skeleton-card">
                <div className="book-skeleton-image"></div>
                <div className="book-skeleton-body">
                  <div className="book-skeleton-line title"></div>
                  <div className="book-skeleton-line author"></div>
                </div>
              </div>
            ))
          ) : (
            // This map turns each backend result into one interactive BookCard.
            books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onPreview={() => handlePreview(book)}
                onSave={() => handleSave(book)}
                showPreview={true}
                showSave={!isBookSaved(book.id)}
                showSaved={isBookSaved(book.id)}
                loadingState={loadingActions[book.id]}
              />
            ))
          )}
        </div>
      </section>

      {/* Embedded preview modal for the currently selected book. */}
      {selectedBook && (
        <div className="preview-overlay" onClick={handleClosePreview}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={handleClosePreview}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
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
