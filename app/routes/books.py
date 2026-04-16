from fastapi import APIRouter, HTTPException, Depends
from app.schemas import BookCreate, BookStatusUpdate
from app.services.books_service import (
    save_book_service,
    get_user_books_service,
    search_books_service,
    update_book_status_service,
    delete_book_service
)
from WTI_Project_MyBooks.app.dependencies.auth import get_current_user_id 

router = APIRouter(prefix="/books", tags=["books"])


@router.get("/search")
async def get_all_google_books_route(query: str):
    try:
        return search_books_service(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save")
async def save_book_route(book: BookCreate):
    try:
        result = save_book_service(book)
        return {"message": "Book saved", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/userbooks")
async def get_user_books_route():
    try:
        id = get_current_user_id()
        return get_user_books_service(id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{book_id}/status")
async def update_book_status_route(
    book_id: int,
    payload: BookStatusUpdate,
    user_id: int = Depends(get_current_user_id)
):
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
async def delete_book_route(
    book_id: int,
    user_id: int = Depends(get_current_user_id)
):
    try:
        result = delete_book_service(book_id, user_id)
        return {"message": "Book deleted", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))