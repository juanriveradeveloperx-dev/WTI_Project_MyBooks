def get_current_user_id():
    """Return the id of the authenticated user.

    Returns:
    - int: the current user id.

    Purpose:
    - Acts as a temporary authentication mock while the project does not yet
      have a real login / token validation flow.
    """
    # Temporary mock value. In a real application this would come from a token,
    # session, or authentication middleware.
    return 1
