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
        <ul>
        {
            type === "users" ? (
                items.map(user => <li key={user.id}>{user.username}</li>)
            ) : type === "rooms" ? (
                items.map(room => (
                    <li key={room.id}>
                        <Link to={`/rooms/${room.id}`}>
                            {room.name}
                        </Link>
                    </li>
                ))
            ) : null 
        }
        </ul>
    );
}

export default ItemList;