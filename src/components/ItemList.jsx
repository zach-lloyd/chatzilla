import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'; 
import { MessengerContext } from '../components/MessengerContext'; 


function ItemList({ type }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { BASE_URL } = useContext(MessengerContext); 

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        fetch(`${BASE_URL}/${type}`, {
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                // Handle HTTP errors (like 404, 500)
                throw new Error(`Failed to fetch ${type}, status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            setItems(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(`Error fetching ${type}:`, err);
            setError(err.message);
            setLoading(false);
        });
    }, [type, BASE_URL]);

    if (loading) return <p>Loading {type}...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <ul className="list-unstyled">
        {
            type === "users" ? (
                items.map(user => 
                    <Link to={`/users/${user.id}`}>
                        <li key={user.id} className="item-background ps-2">
                            {user.username}
                        </li>
                    </Link>
            )) : type === "rooms" ? (
                items.map(room => (
                    <Link to={`/rooms/${room.id}`}>
                        <li key={room.id} className="item-background ps-2">
                            {room.name}
                        </li>
                    </Link>
                ))
            ) : null 
        }
        </ul>
    );
}

export default ItemList;