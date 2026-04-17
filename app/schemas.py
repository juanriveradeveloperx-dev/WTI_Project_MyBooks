from typing import Literal, Optional
from pydantic import BaseModel


class BookBase(BaseModel):
    """Shared minimum fields used by several book schemas."""

    google_volume_id: str
    title: str


class BookCreate(BaseModel):
    """Payload expected when the frontend saves a book."""

    user_id: int
    google_volume_id: str
    title: str
    authors: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    preview_link: Optional[str] = None
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    page_count: Optional[int] = None
    status: Literal["want_to_read", "reading", "finished", "abandoned"] = "want_to_read"
    rating: Optional[int] = None
    notes: Optional[str] = None


class BookStatusUpdate(BaseModel):
    """Minimal payload used to update only a book status."""

    status: Literal["want_to_read", "reading", "finished", "abandoned"]


class BookListItem(BaseModel):
    """Reduced schema intended for summarized book lists."""

    google_volume_id: int
    title: str
    authors: str | None
    thumbnail: str | None
    status: str
    rating: Optional[int] = None


class BookOut(BookBase):
    """Full representation of a book already stored in the application."""

    authors: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    preview_link: Optional[str] = None
    info_link: Optional[str] = None
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    page_count: Optional[int] = None
    status: str = "want_to_read"
    rating: Optional[int] = None
    notes: Optional[str] = None
    created_at: str | None = None
    updated_at: str | None = None
