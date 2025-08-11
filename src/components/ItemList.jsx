import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { MessengerContext } from "../components/MessengerContext";
import PropTypes from "prop-types";

// Get a list of either rooms or users. Type should be either "rooms" or "users".
function ItemList({ type }) {
  const [items, setItems] = useState([]);
  // Used to display a loading message if needed.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { BASE_URL, csrfToken } = useContext(MessengerContext);

  // Get the applicable item list each time the type of items changes.
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/${type}`, {
      credentials: "include",
      headers: {
        "X-CSRF-Token": csrfToken,
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          // Handle HTTP errors.
          throw new Error(
            `Failed to fetch ${type}, status: ${response.status}`
          );
        }
        return response.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error fetching ${type}:`, err);
        setError(err.message);
        setLoading(false);
      });
  }, [type, BASE_URL]);

  if (loading) return <p>Loading {type}...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <ul className="list-unstyled">
      {type === "users"
        ? items.map((user) => (
            <Link key={user.id} to={`/users/${user.id}`}>
              <li className="item-background ps-2">{user.username}</li>
            </Link>
          ))
        : type === "rooms"
        ? items.map((room) => (
            <Link key={room.id} to={`/rooms/${room.id}`}>
              <li className="item-background ps-2">{room.name}</li>
            </Link>
          ))
        : null}
    </ul>
  );
}

export default ItemList;

// This is needed to handle "missing in props validation" error raised by ESLint.
ItemList.propTypes = {
  type: PropTypes.node,
};
