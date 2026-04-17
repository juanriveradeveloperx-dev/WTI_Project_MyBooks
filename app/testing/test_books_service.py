import os
import sys
from unittest.mock import patch

# Add the project root to sys.path so service modules can be imported in tests.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.services.books_service import (
    save_book_service,
    search_books_service,
    update_book_status_service,
)


class DummyBook:
    """Simple test object that imitates the schema used when saving books."""

    def __init__(self, user_id=1, google_volume_id="abc", title="Test Book"):
        self.user_id = user_id
        self.google_volume_id = google_volume_id
        self.title = title
        self.authors = None
        self.description = None
        self.thumbnail = None
        self.preview_link = None
        self.publisher = None
        self.published_date = None
        self.page_count = None
        self.status = "want_to_read"
        self.rating = None
        self.notes = None



def test_search_books_service_returns_empty_for_short_query():
    """Verify that very short queries do not call the external provider."""
    result = search_books_service("py")
    assert result == {"items": []}


@patch("app.services.books_service.search_google_books")
def test_search_books_service_deduplicates_google_ids(mock_search_google_books):
    """Verify that the service removes duplicate books by Google id."""
    mock_search_google_books.return_value = {
        "items": [
            {
                "id": "same-id",
                "volumeInfo": {
                    "title": "Book One",
                    "authors": ["Author One"],
                    "imageLinks": {"thumbnail": "thumb1"},
                },
            },
            {
                "id": "same-id",
                "volumeInfo": {
                    "title": "Book One Duplicate",
                    "authors": ["Author One"],
                    "imageLinks": {"thumbnail": "thumb1"},
                },
            },
        ]
    }

    result = search_books_service("python")

    assert len(result["items"]) == 1
    assert result["items"][0]["id"] == "same-id"


@patch("app.services.books_service.get_book_by_user_and_volume_id")
def test_save_book_service_rejects_duplicate(mock_get_book_by_user_and_volume_id):
    """Verify that the same book cannot be saved twice for the same user."""
    mock_get_book_by_user_and_volume_id.return_value = {"id": 99}

    book = DummyBook()

    try:
        save_book_service(book)
        assert False, "Expected ValueError for duplicate book"
    except ValueError as exc:
        assert str(exc) == "Book already saved for this user"


@patch("app.services.books_service.get_book_by_id_and_user")
def test_update_book_status_service_rejects_invalid_status(mock_get_book_by_id_and_user):
    """Verify that only valid reading statuses are accepted."""
    mock_get_book_by_id_and_user.return_value = {"id": 1}

    try:
        update_book_status_service(1, 1, "invalid_status")
        assert False, "Expected ValueError for invalid status"
    except ValueError as exc:
        assert str(exc) == "Invalid status"