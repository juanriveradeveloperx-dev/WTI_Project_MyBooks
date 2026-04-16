import "../styles/BookCard.css";

function BookCard({
  book,
  onPreview,
  onSave,
  onDelete,
  onAdvanceStatus,
  showPreview = false,
  showSave = false,
  showDelete = false,
  showAdvanceStatus = false,
  loadingState,
}) {
  if (!book) return null;

  const isLoading = !!loadingState;

  return (
    <div className={`book-card ${isLoading ? "loading" : ""}`}>
      <div className="book-card-image-wrapper">
        <img
          src={book.thumbnail || "https://via.placeholder.com/128x190?text=No+Cover"}
          alt={book.title || "No title"}
          className="book-card-image"
        />

        <div className="book-card-overlay">
          {showSave ? (
            <button
              className="card-action-btn save-btn"
              disabled={isLoading}
              onClick={onSave}
            >
              {loadingState === "saving" ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              className="card-action-btn saved-btn"
              disabled
            >
              Saved
            </button>
          )}

          {showDelete && (
            <button
              className="card-action-btn delete-btn"
              disabled={isLoading}
              onClick={onDelete}
            >
              {loadingState === "deleting" ? "Deleting..." : "Delete"}
            </button>
          )}

          {showAdvanceStatus && (
            <button
              className="card-action-btn status-btn"
              disabled={isLoading}
              onClick={onAdvanceStatus}
            >
              {loadingState === "updating" ? "Updating..." : "Next"}
            </button>
          )}

          {showPreview && (
            <button
              className="card-action-btn preview-btn"
              disabled={isLoading}
              onClick={onPreview}
            >
              Preview
            </button>
          )}
        </div>
      </div>

      <div className="book-card-body">
        <h3 className="book-card-title" title={book.title}>
          {book.title || "No title"}
        </h3>
        <p className="book-card-authors" title={book.authors}>
          {book.authors || "Unknown author"}
        </p>
      </div>
    </div>
  );
}

export default BookCard;