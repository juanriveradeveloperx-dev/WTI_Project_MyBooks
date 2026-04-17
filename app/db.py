import os
from dotenv import load_dotenv
import psycopg

# Load environment variables once when this module is imported.
load_dotenv()


def get_connection():
    """Create and return a new PostgreSQL connection.

    Receives:
    - No direct arguments. Database settings are read from environment variables.

    Returns:
    - A psycopg connection object ready to execute SQL queries.

    Purpose:
    - Centralizes database connection creation so repositories do not repeat
      the same PostgreSQL configuration in multiple places.
    """
    return psycopg.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT"),
        connect_timeout=10,
    )
