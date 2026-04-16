from app.db import get_connection

def save_book(book):
    query = """
    INSERT INTO saved_books (
        user_id,
        google_volume_id,
        title,
        authors,
        description,
        thumbnail,
        preview_link,
        publisher,
        published_date,
        page_count,
        status,
        rating,
        notes
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (
                book.user_id,
                book.google_volume_id,
                book.title,
                book.authors,
                book.description,
                book.thumbnail,
                book.preview_link,
                book.publisher,
                book.published_date,
                book.page_count,
                book.status,
                book.rating,
                book.notes
            ))
            row = cur.fetchone()
            conn.commit()
            return row

def get_books_by_user(user_id):
    query = """
    SELECT *
    FROM saved_books
    WHERE user_id = %s
    ORDER BY created_at DESC;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            return cur.fetchall()

def get_book_by_id_and_user(book_id, user_id):
    query = """
    SELECT *
    FROM saved_books
    WHERE id = %s AND user_id = %s;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (book_id, user_id))
            return cur.fetchone()

def get_book_by_user_and_volume_id(user_id, google_volume_id):

    query = """
    SELECT *
    FROM saved_books
    WHERE user_id = %s AND google_volume_id = %s;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id, google_volume_id))
            return cur.fetchone()
        

def delete_book(book_id, user_id):
    print(book_id, user_id)
    query = """
    DELETE FROM saved_books
    WHERE id = %s AND user_id = %s
    RETURNING id;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (book_id, user_id))
            row = cur.fetchone()
            conn.commit()
            return row
        
def update_book_status(book_id, user_id, status):
    query = """
    UPDATE saved_books
    SET status = %s
    WHERE id = %s AND user_id = %s
    RETURNING *;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (status, book_id, user_id))
            row = cur.fetchone()
            conn.commit()
            return row