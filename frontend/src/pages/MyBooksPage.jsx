import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import "../styles/MyBooksPage.css";
import { useSavedBooks } from "../context/SavedBooksContext";
import BookPreview from "../components/PreviewCard";

function MyBooksPage() {
  const {
    savedBooks,
    loadingSavedBooks,
    loadSavedBooks,
    removeSavedBook,
    updateSavedBookStatus
  } = useSavedBooks();

  useEffect(() => {
    loadSavedBooks();
  }, []);


  const [selectedBook, setSelectedBook] = useState(null);

  const handlePreview = (book) => {
    setSelectedBook(book);
  };

  const handleClosePreview = () => {
    setSelectedBook(null);
  };


  const getNextStatus = (currentStatus) => {
    if (currentStatus === "want_to_read") return "reading";
    if (currentStatus === "reading") return "finished";
    return currentStatus;
  };


  const handleAdvanceStatus = async (book) => {
    const nextStatus = getNextStatus(book.status);

    if (nextStatus === book.status) return;

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
    }
  };
  const handleDelete = async (bookId) => {
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
    }
  };
  const wantToReadBooks = savedBooks.filter((book) => book.status === "want_to_read");
  const readingBooks = savedBooks.filter((book) => book.status === "reading");
  const finishedBooks = savedBooks.filter((book) => book.status === "finished");
  const abandonedBooks = savedBooks.filter((book) => book.status === "abandoned");

  const renderSection = (title, items) => (
    <section className="books-section">
      <h2 className="books-section-title">{title}</h2>

      <div className="results-grid">
        {items.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            showDelete={true}
            showPreview={true}
            showAdvanceStatus={book.status === "want_to_read" || book.status === "reading"}
            onDelete={() => handleDelete(book.id)}
            onPreview={() => handlePreview(book)}
            onAdvanceStatus={() => handleAdvanceStatus(book)}
          />

        ))}
      </div>
    </section>
  );

  if (loadingSavedBooks) {
    return (
      <div className="my-books-page">
        {["Want to Read", "Currently Reading", "Finished", "Abandoned"].map((title) => (
          <section className="books-section" key={title}>
            <h2 className="books-section-title">{title}</h2>
            <div className="results-grid">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="book-skeleton-card">
                  <div className="book-skeleton-image"></div>
                  <div className="book-skeleton-line title"></div>
                  <div className="book-skeleton-line author"></div>
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
        {renderSection("Want to Read", wantToReadBooks)}
        {renderSection("Currently Reading", readingBooks)}
        {renderSection("Finished", finishedBooks)}
        {renderSection("Abandoned", abandonedBooks)}
      </div>

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

            <BookPreview volumeId={selectedBook.google_volume_id} />

          </div>
        </div>
      )}
    </>
  );
}

export default MyBooksPage;