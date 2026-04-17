from fastapi import APIRouter, Depends, HTTPException
import requests
from app.schemas import BookCreate, BookStatusUpdate
from app.services.books_service import (
    delete_book_service,
    get_user_books_service,
    save_book_service,
    search_books_service,
    update_book_status_service,
)
from app.dependencies.auth import get_current_user_id

# Group all book-related endpoints inside one router.
router = APIRouter(prefix="/books", tags=["books"])


@router.get("/search")
async def get_all_google_books_route(query: str):
    """Search Google Books and return frontend-friendly items.

    Receives:
    - query (str): search term received as a query parameter.

    Returns:
    - dict: a JSON payload shaped like {"items": [...]}.

    Purpose:
    - Exposes the public search endpoint used by the frontend Discover page.
    - Converts external-service failures into an HTTP 502 response.
    """
    try:
        return search_books_service(query)
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="External books service failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save")
async def save_book_route(book: BookCreate):
    """Save one book into the user's library.

    Receives:
    - book (BookCreate): JSON payload sent by the frontend.

    Returns:
    - dict: success message plus the created book id.

    Purpose:
    - Exposes the save-book action to the frontend.
    - Converts duplicate saves into HTTP 409.
    """
    try:
        result = save_book_service(book)
        return {"message": "Book saved", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/userbooks")
async def get_user_books_route():
    """Return the saved library for the current user.

    Receives:
    - Nothing directly. The current user id is resolved from the auth dependency.

    Returns:
    - list[dict]: every saved book for that user.

    Purpose:
    - Feeds the My Library page and the frontend saved-books context.
    """
    try:
        user_id = get_current_user_id()
        return get_user_books_service(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{book_id}/status")
async def update_book_status_route(
    book_id: int,
    payload: BookStatusUpdate,
    user_id: int = Depends(get_current_user_id),
):
    """Update the reading status for a saved book.

    Receives:
    - book_id (int): path parameter that identifies the saved book.
    - payload (BookStatusUpdate): body containing the new status.
    - user_id (int): injected by FastAPI Depends.

    Returns:
    - dict: success message plus the updated row data.

    Purpose:
    - Supports the frontend action that advances a book through the reading flow.
    - Returns 404 when the book does not exist for that user.
    """
    try:
        result = update_book_status_service(book_id, user_id, payload.status)
        return {"message": "Book status updated", "data": result}
    except ValueError as e:
        if str(e) == "Book not found":
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{book_id}")
async def delete_book_route(book_id: int):
    """Delete one saved book from the user's library.

    Receives:
    - book_id (int): path parameter that identifies the saved book.

    Returns:
    - dict: success message plus the deleted id.

    Purpose:
    - Supports the Remove action in the My Library page.
    """
    try:
        user_id = get_current_user_id()
        result = delete_book_service(book_id, user_id)
        return {"message": "Book deleted", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
