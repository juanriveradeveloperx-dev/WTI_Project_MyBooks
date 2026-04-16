import requests
import os

GOOGLE_ENDPOINT = "https://www.googleapis.com/books/v1/volumes"
KEY = os.getenv("GOOGLE_KEY")

def search_google_books(query: str):
    all_items = []

    max_results = 40
    pages = 3

    for page in range(pages):
        params = {
            "q": query,
            "key": KEY,
            "maxResults": max_results,
            "startIndex": page * max_results
        }

        try:
            response = requests.get(GOOGLE_ENDPOINT, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            items = data.get("items", [])

            if not items:
                break

            all_items.extend(items)

        except requests.RequestException as e:
            print(f"[GOOGLE SEARCH ERROR] page={page} error={e}")

            # if first page fails, let caller know search failed
            if page == 0:
                raise

            # if later page fails, keep partial results
            break

    return {"items": all_items}
   