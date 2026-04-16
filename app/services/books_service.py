from app.external.google_books import search_google_books
from app.repositories.books_repository import (
    save_book,
    get_books_by_user,
    get_book_by_user_and_volume_id,
    get_book_by_id_and_user,
    update_book_status,
    delete_book
)

VALID_STATUSES = {"want_to_read", "reading", "finished", "abandoned"}

def search_books_service(query: str):
    query = query.strip()

    if len(query) < 4:
        return {"items": []}

    raw_data = search_google_books(query)

    mapped_items = []
    seen_ids = set()

    for item in raw_data.get("items", []):
        google_id = item.get("id")

        # (avoid pagination issues where same book returned twice) skip invalid or duplicated google books ids
        if not google_id or google_id in seen_ids:
            continue

        seen_ids.add(google_id)

        volume_info = item.get("volumeInfo", {})
        image_links = volume_info.get("imageLinks", {})

        mapped_items.append({
            "id": google_id,
            "title": volume_info.get("title", "No title"),
            "authors": ", ".join(volume_info.get("authors", [])) if volume_info.get("authors") else "Unknown author",
            "thumbnail": image_links.get("thumbnail") or image_links.get("smallThumbnail"),
            "previewLink": volume_info.get("previewLink"),
            "infoLink": volume_info.get("infoLink"),
            "description": volume_info.get("description"),
            "publisher": volume_info.get("publisher"),
            "publishedDate": volume_info.get("publishedDate"),
            "pageCount": volume_info.get("pageCount"),
            "status": "want_to_read"
        })

    return {"items": mapped_items}

def save_book_service(book):
    existing = get_book_by_user_and_volume_id(book.user_id, book.google_volume_id)
    if existing:
        raise ValueError("Book already saved for this user")
    row = save_book(book)
    book_id = row[0]

    return book_id


def get_user_books_service(user_id: int):
    rows = get_books_by_user(user_id)

    books = []
    for row in rows:
        books.append({
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
        })

    return books

def update_book_status_service(book_id: int,user_id: int, status: str):
    if status not in VALID_STATUSES:
        raise ValueError("Invalid status")

    existing = get_book_by_id_and_user(book_id, user_id)
    if not existing:
        raise ValueError("Book not found")

    return update_book_status(book_id, user_id, status)


def delete_book_service(book_id: int, user_id: int):
    existing = get_book_by_id_and_user(book_id, user_id)
    if not existing:
        raise ValueError("Book not duplicated")

    return delete_book(book_id, user_id)