import requests

GOOGLE_ENDPOINT = "https://www.googleapis.com/books/v1/volumes"
KEY = "AIzaSyAytMhb-j0abdcirWgsHR54JcJipnqTghY"

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

        response = requests.get(GOOGLE_ENDPOINT, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        items = data.get("items", [])

        if not items:
            break

        all_items.extend(items)

    return {"items": all_items}