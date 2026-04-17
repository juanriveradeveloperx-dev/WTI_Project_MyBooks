import os
import sys
from unittest.mock import patch
from fastapi.testclient import TestClient

# Add the project root to sys.path so pytest can import app.* modules correctly.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.main import app

# HTTP test client used to call FastAPI endpoints without starting a real server.
client = TestClient(app)


def test_root_endpoint():
    """Verify that the root endpoint responds correctly.

    Purpose:
    - Confirms that the API is alive and returns the expected message.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "backend working"


@patch("app.routes.books.search_books_service")
def test_search_endpoint_returns_items(mock_search_books_service):
    """Verify that /books/search returns items when the service returns data.

    Receives:
    - mock_search_books_service: mock injected by unittest.mock.patch.

    Purpose:
    - Isolates the route from the real service so the test only checks HTTP behavior.
    """
    mock_search_books_service.return_value = {
        "items": [
            {
                "id": "book-1",
                "title": "Clean Code",
                "authors": "Robert C. Martin",
                "thumbnail": "thumb",
                "status": "want_to_read",
            }
        ]
    }

    response = client.get("/books/search", params={"query": "python"})

    assert response.status_code == 200
    assert response.json()["items"][0]["id"] == "book-1"


@patch("app.routes.books.get_user_books_service")
@patch("app.routes.books.get_current_user_id")
def test_userbooks_endpoint_uses_current_user(
    mock_get_current_user_id, mock_get_user_books_service
):
    """Verify that /books/userbooks resolves the current user before fetching books.

    Receives:
    - mocks for the auth dependency and the service layer.

    Purpose:
    - Confirms that the endpoint uses the authenticated user rather than a hardcoded id.
    """
    mock_get_current_user_id.return_value = 1
    mock_get_user_books_service.return_value = []

    response = client.get("/books/userbooks")

    assert response.status_code == 200
    mock_get_user_books_service.assert_called_once_with(1)
