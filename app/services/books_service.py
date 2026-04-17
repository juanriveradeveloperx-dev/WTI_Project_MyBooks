from app.external.google_books import search_google_books
from app.repositories.books_repository import (
    delete_book,
    get_book_by_id_and_user,
    get_book_by_user_and_volume_id,
    get_books_by_user,
    save_book,
    update_book_status,
)

# Valid statuses allowed by the business rules.
VALID_STATUSES = {"want_to_read", "reading", "finished", "abandoned"}


def search_books_service(query: str):
    """Search Google Books and normalize the response for the frontend.

    Receives:
    - query (str): search text typed by the user.

    Returns:
    - dict: {"items": [...]} using a flat, frontend-friendly structure.

    Purpose:
    - Trims the query.
    - Skips very short searches.
    - Deduplicates repeated Google Books ids.
    - Maps Google's nested format into a simpler application format.
    """
    query = query.strip()

    # Avoid unnecessary external requests when the search term is too short.
    if len(query) < 4:
        return {"items": []}

    raw_data = search_google_books(query)

    mapped_items = []
    seen_ids = set()

    # This loop transforms every raw Google Books item into the shape expected by the UI.
    for item in raw_data.get("items", []):
        google_id = item.get("id")

        # Ignore empty ids and duplicate ids returned across pages.
        if not google_id or google_id in seen_ids:
            continue

        seen_ids.add(google_id)

        volume_info = item.get("volumeInfo", {})
        image_links = volume_info.get("imageLinks", {})

        mapped_items.append(
            {
                "id": google_id,
                "title": volume_info.get("title", "No title"),
                "authors": ", ".join(volume_info.get("authors", []))
                if volume_info.get("authors")
                else "Unknown author",
                "thumbnail": image_links.get("thumbnail")
                or image_links.get("smallThumbnail"),
                "previewLink": volume_info.get("previewLink"),
                "infoLink": volume_info.get("infoLink"),
                "description": volume_info.get("description"),
                "publisher": volume_info.get("publisher"),
                "publishedDate": volume_info.get("publishedDate"),
                "pageCount": volume_info.get("pageCount"),
                "status": "want_to_read",
            }
        )

    return {"items": mapped_items}



def save_book_service(book):
    """Validate duplicates and save one book.

    Receives:
    - book: schema-like object sent by the frontend.

    Returns:
    - int: the id of the newly created saved book.

    Purpose:
    - Enforces the rule that one user cannot save the same Google volume twice.
    """
    existing = get_book_by_user_and_volume_id(book.user_id, book.google_volume_id)
    if existing:
        raise ValueError("Book already saved for this user")

    row = save_book(book)
    book_id = row[0]
    return book_id



def get_user_books_service(user_id: int):
    """Fetch and serialize all saved books for one user.

    Receives:
    - user_id (int): current user id.

    Returns:
    - list[dict]: JSON-ready book objects.

    Purpose:
    - Converts raw SQL rows into named fields.
    - Converts datetime values to ISO strings so the frontend can safely use them.
    """
    rows = get_books_by_user(user_id)

    books = []
    # This loop converts each PostgreSQL tuple into a named API object.
    for row in rows:
        books.append(
            {
                "id": row[0],
                "user_id": row[1],
                "google_volume_id": row[2],
                "title": row[3],
                "authors": row[4],
                "description": row[5],
                "thumbnail": row[6],
                "preview_link": row[7],
                "info_link": row[8],
                "publisher": row[9],
                "published_date": row[10],
                "page_count": row[11],
                "status": row[12],
                "rating": row[13],
                "notes": row[14],
                "created_at": row[15].isoformat() if row[15] else None,
                "updated_at": row[16].isoformat() if row[16] else None,
            }
        )

    return books



def update_book_status_service(book_id: int, user_id: int, status: str):
    """Validate and update the reading status of a saved book.

    Receives:
    - book_id (int): internal book id.
    - user_id (int): current user id.
    - status (str): requested new status.

    Returns:
    - tuple | None: the updated row returned by the repository.

    Purpose:
    - Verifies that the status is valid.
    - Verifies that the book exists and belongs to the user.
    - Only then performs the real update.
    """
    if status not in VALID_STATUSES:
        raise ValueError("Invalid status")

    existing = get_book_by_id_and_user(book_id, user_id)
    if not existing:
        raise ValueError("Book not found")

    return update_book_status(book_id, user_id, status)



def delete_book_service(book_id: int, user_id: int):
    """Validate existence and delete one saved book.

    Receives:
    - book_id (int): internal book id.
    - user_id (int): current user id.

    Returns:
    - tuple | None: delete result returned by the repository.

    Purpose:
    - Avoids attempting a delete for a book that does not exist for this user.
    """
    existing = get_book_by_id_and_user(book_id, user_id)
    if not existing:
        raise ValueError("Book not found")

    return delete_book(book_id, user_id)
