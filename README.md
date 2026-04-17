# MyBookShelf

MyBookShelf is a small full-stack N-tier application built for the World Travel, Inc. technical interview. The app lets a user search books from Google Books, save books into PostgreSQL, organize them by reading status, preview books, and remove them from the shelf. The frontend is built with React + React Context, and the backend is built with FastAPI using raw SQL only.

This project addresses the interview requirements for CRUD, state management, external API integration, PostgreSQL persistence, and an AWS deployment approach aligned to the AWS Well-Architected Framework. 

## Architecture

### Frontend (Presentation)
- React + Vite
- React Router for page navigation
- React Context for shared state:
  - `UserContext` for the current mock user
  - `SavedBooksContext` for the user bookshelf cache/shared state

### Backend (Business Logic)
- FastAPI
- Layered structure:
  - `routes/` for HTTP endpoints
  - `services/` for business logic and data transformation
  - `repositories/` for raw SQL access
  - `external/` for Google Books API integration

### Data Layer
- PostgreSQL
- Raw SQL via `psycopg`
- No ORM

## Main Features

- Search books from Google Books API
- Save books to a personal bookshelf
- Prevent duplicate saves per user
- View saved books by status
- Status system for books from `want_to_read -> reading -> finished`
- Delete saved books
- Embedded preview support for supported Google Books items
- Shared state between Search and My Books through React Context

## Repository Structure

```text
app/
  db.py
  main.py
  schemas.py
  dependencies/
    auth.py
  external/
    google_books.py
  repositories/
    books_repository.py
  routes/
    books.py
  services/
    books_service.py
  testing/
    test_books_service.py
    test_books_routes.py
frontend/
  src/
    components/
    context/
    pages/
    styles/
    App.jsx
    main.jsx
```

## Backend Setup

### Requirements
- Python 3.12+
- PostgreSQL

### Install
```bash
cd app
python -m venv .venv
source .venv/bin/activate
# Windows: .venv\Scripts\activate
python -m pip install fastapi uvicorn psycopg python-dotenv requests pytest
```

### Environment Variables
Create `app/.env`:

```env
DB_HOST=your_host
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
GOOGLE_BOOKS_API_KEY=your_google_books_key
```

### Run Backend
From the project root:

```bash
python -m uvicorn app.main:app --reload
```

Or from inside `app/`:

```bash
python -m uvicorn main:app --reload
```

The API should be available at:
- `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

## Frontend Setup

### Requirements
- Node.js 20.19+ or 22+

### Install
```bash
cd frontend
npm install
```

### Environment Variables
Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Run Frontend
```bash
npm run dev
```

The frontend should be available at:
- `http://localhost:5173`
- Sometimes Vite may use `5174` if `5173` is already occupied.

## Database Notes

The backend expects a `saved_books` table similar to this shape:

- `id`
- `user_id`
- `google_volume_id`
- `title`
- `authors`
- `description`
- `thumbnail`
- `preview_link`
- `info_link`
- `publisher`
- `published_date`
- `page_count`
- `status`
- `rating`
- `notes`
- `created_at`
- `updated_at`

 `status` values by DB Constraint:
- `want_to_read`
- `reading`
- `finished`
- `abandoned`

## API Endpoints

### Search books
```http
GET /books/search?query=python
```
Uses Google Books and returns mapped, deduplicated results.

### Save a book
```http
POST /books/save
```
Creates a saved book row for the current mock user.

### Get user books
```http
GET /books/userbooks
```
Returns all saved books for the current mock user.

### Update book status
```http
PUT /books/{book_id}/status
```
Body:
```json
{
  "status": "reading"
}
```

### Delete book
```http
DELETE /books/{book_id}
```

## Testing

### Backend service tests
```bash
pytest tests/backend/test_books_service.py
```

### Backend route tests
```bash
pytest tests/backend/test_books_routes.py
```

### Run all tests
```bash
python -m pytest . -v
from the app folder
```

## Deployment Guidance (AWS)

A practical target deployment is:

- Frontend: S3 static site hosting
- Optional: CloudFront
- Backend: EC2 instance running FastAPI behind Nginx/systemd
- Database: PostgreSQL (RDS was used)
- Secrets: environment variables or AWS Systems Manager Parameter Store / Secrets Manager

## AWS Well-Architected Alignment

### Operational Excellence
- Clear layered backend (`routes/services/repositories/external`)
- Context-based state separation on frontend
- README and test structure for easier operation and maintenance

### Security
- API keys should remain on backend only
- Input validation via Pydantic schemas
- Mock user handling isolated in a dependency and ready for real auth

### Reliability
- External API errors are isolated from persistence
- Saved library data is stored locally in PostgreSQL so reads do not depend on Google Books availability
- Search layer deduplicates repeated results and can be made tolerant of partial external failures

### Performance Efficiency
- Debounced search requests
- SavedBooksContext caches bookshelf data between pages
- Save/delete/status updates avoid unnecessary full-page refetches where possible

### Cost Optimization
- Persisting book metadata reduces repeated third-party API calls
- Static frontend hosting on S3 is inexpensive
- A small EC2/RDS setup is enough for the project scope

### Sustainability
- Avoids redundant fetches
- Keeps architecture simple and right-sized
- Uses local persistence instead of recomputing or recalling external data for every read

## Known must Upgrades
-User auth with JWT
-Better UX/UI
-UI Accessibility

## Demo Flow

1. Open Search page
2. Search for a book
3. Preview or Save it
4. Navigate to My Books
5. See the book under `Want to Read`
6. Advance status to `Reading`, then `Finished`
7. Delete a book from the shelf

## Deliverables

- Source code repository
- README with setup/testing/deployment instructions
- Backend tests
- Optional AWS deployment
