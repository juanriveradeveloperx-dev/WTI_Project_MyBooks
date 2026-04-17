import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import BookPreview from "../components/PreviewCard";
import { useSavedBooks } from "../context/SavedBooksContext";
import "../styles/MyBooksPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function MyBooksPage() {
  // Page that displays and organizes the user's saved library.
  // Receives: no props.
  // Sends: update-status and delete requests to the backend.
  // Renders: library statistics, grouped sections, and the shared preview modal.
  const {
    savedBooks,
    loadingSavedBooks,
    loadSavedBooks,
    removeSavedBook,
    updateSavedBookStatus,
  } = useSavedBooks();

  const [selectedBook, setSelectedBook] = useState(null);
  const [loadingActions, setLoadingActions] = useState({});

  const setLoading = (bookId, value) => {
    // Stores a separate loading state per book so one action does not freeze the whole page.
    setLoadingActions((prev) => ({
      ...prev,
      [bookId]: value,
    }));
  };

  useEffect(() => {
    // Trigger: runs once when the page mounts.
    // Purpose: make sure the saved library is available before rendering sections.
    loadSavedBooks();
  }, []);

  const handlePreview = (book) => {
    // Opens the preview modal for the clicked book.
    setSelectedBook(book);
  };

  const handleClosePreview = () => {
    // Closes the preview modal by clearing the selected book.
    setSelectedBook(null);
  };

  const getNextStatus = (currentStatus) => {
    // Defines the linear reading flow used by the advance-status button.
    if (currentStatus === "want_to_read") return "reading";
    if (currentStatus === "reading") return "finished";
    return currentStatus;
  };

  const handleAdvanceStatus = async (book) => {
    // Sends the next reading status to the backend and updates local context on success.
    const nextStatus = getNextStatus(book.status);

    if (nextStatus === book.status) return;

    setLoading(book.id, "updating");

    try {
      const res = await fetch(`${API_BASE}/books/${book.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("status update failed", data);
        return;
      }

      updateSavedBookStatus(book.id, nextStatus);
    } catch (error) {
      console.error("status update error", error);
    } finally {
      setLoading(book.id, null);
    }
  };

  const handleDelete = async (bookId) => {
    // Deletes one book in the backend and then removes it from local context.
    setLoading(bookId, "deleting");

    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("delete failed", data);
        return;
      }

      removeSavedBook(bookId);
    } catch (error) {
      console.error("delete error", error);
    } finally {
      setLoading(bookId, null);
    }
  };

  // These filters split the library into UI sections by reading status.
  const wantToReadBooks = savedBooks.filter((book) => book.status === "want_to_read");
  const readingBooks = savedBooks.filter((book) => book.status === "reading");
  const finishedBooks = savedBooks.filter((book) => book.status === "finished");
  const abandonedBooks = savedBooks.filter((book) => book.status === "abandoned");

  const totalBooks = savedBooks.length;

  const renderSection = (title, items, icon) => (
    // Shared section renderer used to avoid repeating the same layout four times.
    // Receives: the section title, the already-filtered item list, and the icon JSX.
    // The inner map renders one BookCard per saved book.
    <section className="books-section">
      <div className="books-section-header">
        <h2 className="books-section-title">
          {icon}
          {title}
          <span className="section-count">{items.length}</span>
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="section-empty">
          <p className="section-empty-text">No books here yet</p>
        </div>
      ) : (
        <div className="results-grid">
          {items.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              showDelete={true}
              showPreview={true}
              showAdvanceStatus={
                book.status === "want_to_read" || book.status === "reading"
              }
              onDelete={() => handleDelete(book.id)}
              onPreview={() => handlePreview(book)}
              onAdvanceStatus={() => handleAdvanceStatus(book)}
              loadingState={loadingActions[book.id]}
            />
          ))}
        </div>
      )}
    </section>
  );

  if (loadingSavedBooks) {
    // Loading UI shown while the initial library request is still pending.
    return (
      <div className="my-books-page">
        <div className="my-books-header">
          <h1 className="my-books-title">My Library</h1>
          <p className="my-books-subtitle">Your personal book collection</p>
        </div>

        {/* This loop creates temporary skeleton sections to preserve page structure during loading. */}
        {["Want to Read", "Currently Reading", "Finished", "Abandoned"].map((title) => (
          <section className="books-section" key={title}>
            <div className="books-section-header">
              <h2 className="books-section-title">{title}</h2>
            </div>
            <div className="results-grid">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="book-skeleton-card">
                  <div className="book-skeleton-image"></div>
                  <div className="book-skeleton-body">
                    <div className="book-skeleton-line title"></div>
                    <div className="book-skeleton-line author"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="my-books-page">
        <div className="my-books-header">
          <h1 className="my-books-title">My Library</h1>
          <p className="my-books-subtitle">Your personal book collection</p>
        </div>

        {/* Quick collection summary shown at the top of the page. */}
        <div className="my-books-stats">
          <div className="stat-item">
            <span className="stat-value">{totalBooks}</span>
            <span className="stat-label">Total Books</span>
          </div>
          <div className="stat-item accent">
            <span className="stat-value">{readingBooks.length}</span>
            <span className="stat-label">Reading</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{finishedBooks.length}</span>
            <span className="stat-label">Finished</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{wantToReadBooks.length}</span>
            <span className="stat-label">To Read</span>
          </div>
        </div>

        {/* Each renderSection call reuses the same layout with a different filtered list. */}
        {renderSection(
          "Currently Reading",
          readingBooks,
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            <path d="M8 7h6"/>
            <path d="M8 11h8"/>
          </svg>
        )}

        {renderSection(
          "Want to Read",
          wantToReadBooks,
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        )}

        {renderSection(
          "Finished",
          finishedBooks,
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="m9 11 3 3L22 4"/>
          </svg>
        )}

        {/* The Abandoned section is rendered only when there are books in that status. */}
        {abandonedBooks.length > 0 &&
          renderSection(
            "Abandoned",
            abandonedBooks,
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>
          )}
      </div>

      {/* Shared preview modal reused from the search page. */}
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

            <BookPreview volumeId={selectedBook.google_volume_id} />
          </div>
        </div>
      )}
    </>
  );
}

export default MyBooksPage;
