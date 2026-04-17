import requests

# Base endpoint used to query the external Google Books API.
GOOGLE_ENDPOINT = "https://www.googleapis.com/books/v1/volumes"

# API key used for requests against Google Books.
KEY = "AIzaSyAytMhb-j0abdcirWgsHR54JcJipnqTghY"


def search_google_books(query: str):
    """Search books in Google Books across several paginated requests.

    Receives:
    - query (str): the search text entered by the user.

    Returns:
    - dict: a raw payload in the shape {"items": [...]}.

    Purpose:
    - Requests up to 3 Google Books pages.
    - Merges all page results into a single list.
    - Raises the error if page 1 fails.
    - Keeps partial results if a later page fails.
    """
    all_items = []

    # Google Books pagination is controlled with startIndex.
    max_results = 40
    pages = 3

    for page in range(pages):
        # Each loop builds one page request.
        params = {
            "q": query,
            "key": KEY,
            "maxResults": max_results,
            "startIndex": page * max_results,
        }

        try:
            response = requests.get(GOOGLE_ENDPOINT, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            items = data.get("items", [])

            # Stop early if Google Books has no more items to return.
            if not items:
                break

            # Accumulate items from every successful page into one list.
            all_items.extend(items)

        except requests.RequestException as e:
            print(f"[GOOGLE SEARCH ERROR] page={page} error={e}")

            # If the first page fails, the caller should receive the full failure.
            if page == 0:
                raise

            # If a later page fails, keep the results gathered so far.
            break

    return {"items": all_items}
