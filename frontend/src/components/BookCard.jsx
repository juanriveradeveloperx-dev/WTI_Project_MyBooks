import "../styles/BookCard.css";

function BookCard({
  book,
  onPreview,
  onSave,
  onDelete,
  onAdvanceStatus,
  showPreview = false,
  showSave = false,
  showSaved = false,
  showDelete = false,
  showAdvanceStatus = false,
  loadingState,
}) {
  // Reusable card used to display one book.
  // Receives: the book object, optional action callbacks, and UI flags.
  // Sends: no data by itself; it triggers parent callbacks on button clicks.
  // Purpose: keep one shared presentation component for Search and My Library.
  if (!book) return null;

  // Blocks card actions while one async action is running for this book.
  const isLoading = !!loadingState;

  const getStatusLabel = (status) => {
    // Converts the internal database status into a user-friendly label.
    switch (status) {
      case "want_to_read":
        return "Want to Read";
      case "reading":
        return "Reading";
      case "finished":
        return "Finished";
      case "abandoned":
        return "Abandoned";
      default:
        return null;
    }
  };

  const getNextStatusLabel = (status) => {
    // Chooses the label for the button that advances the reading flow.
    switch (status) {
      case "want_to_read":
        return "Start Reading";
      case "reading":
        return "Mark Finished";
      default:
        return "Next";
    }
  };

  const statusLabel = getStatusLabel(book.status);

  // Only show the badge once the book moved beyond the initial want_to_read state.
  const showStatusBadge = book.status && book.status !== "want_to_read";

  return (
    <div className={`book-card ${isLoading ? "loading" : ""}`}>
      <div className="book-card-image-wrapper">
        {/* Visual badge that highlights the current reading status. */}
        {showStatusBadge && (
          <span className={`book-status-badge ${book.status}`}>
            {statusLabel}
          </span>
        )}

        {/* Book cover image or a fallback placeholder if no thumbnail exists. */}
        <img
          src={book.thumbnail || "https://via.placeholder.com/128x190?text=No+Cover"}
          alt={book.title || "No title"}
          className="book-card-image"
        />

        {/* Action overlay. The visible buttons depend on the page that uses this card. */}
        <div className="book-card-overlay">
          {showSave && (
            <button
              className="card-action-btn save-btn"
              disabled={isLoading}
              onClick={onSave}
            >
              {loadingState === "saving" ? (
                <>
                  <span className="btn-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"/>
                    <path d="M5 12h14"/>
                  </svg>
                  Add to Library
                </>
              )}
            </button>
          )}

          {showSaved && (
            <button className="card-action-btn saved-btn" disabled>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              In Library
            </button>
          )}

          {showAdvanceStatus && (
            <button
              className="card-action-btn status-btn"
              disabled={isLoading}
              onClick={onAdvanceStatus}
            >
              {loadingState === "updating" ? (
                "Updating..."
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                  {getNextStatusLabel(book.status)}
                </>
              )}
            </button>
          )}

          {showDelete && (
            <button
              className="card-action-btn delete-btn"
              disabled={isLoading}
              onClick={onDelete}
            >
              {loadingState === "deleting" ? (
                "Removing..."
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M8 6V4h8v2"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                  </svg>
                  Remove
                </>
              )}
            </button>
          )}

          {showPreview && (
            <button
              className="card-action-btn preview-btn"
              disabled={isLoading}
              onClick={onPreview}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview
            </button>
          )}
        </div>
      </div>

      <div className="book-card-body">
        <h3 className="book-card-title">{book.title || "No title"}</h3>
        <p className="book-card-authors">{book.authors || "Unknown author"}</p>
      </div>
    </div>
  );
}

export default BookCard;
