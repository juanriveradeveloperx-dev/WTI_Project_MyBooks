import "../styles/BookCard.css";

function BookCard({
  book,
  onPreview,
  onSave,
  onDelete,
  showPreview = false,
  showSave = false,
  showDelete = false,
}) {
  if (!book) return null;

  return (
    <div className="book-card">
      <div className="book-card-image-wrapper">
        <img
          src={book.thumbnail || "https://via.placeholder.com/128x190?text=No+Cover"}
          alt={book.title || "No title"}
          className="book-card-image"
        />

        <div className="book-card-overlay">
          {showSave && (
            <button className="card-action-btn save-btn" onClick={onSave}>
              Save
            </button>
          )}

          {showPreview && (
            <button className="card-action-btn preview-btn" onClick={onPreview}>
              Preview
            </button>
          )}

          {showDelete && (
            <button className="card-action-btn delete-btn" onClick={onDelete}>
              Delete
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