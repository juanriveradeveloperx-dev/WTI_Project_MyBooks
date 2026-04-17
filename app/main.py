from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.books import router as books_router

# Create the main FastAPI application instance.
app = FastAPI()

# Allow the local frontend and deployed frontend to consume this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://wit-my-book-shelf.s3-website.us-east-2.amazonaws.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all book-related endpoints under the /books prefix.
app.include_router(books_router)


@app.get("/")
def root():
    """Basic health-check endpoint.

    Receives:
    - Nothing.

    Returns:
    - dict: a small message confirming that the backend is running.

    Purpose:
    - Gives the frontend, tests, or developers a quick way to verify that the
      API is alive.
    """
    return {"message": "backend working"}
