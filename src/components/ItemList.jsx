import React, { useState, useEffect } from 'react';

function ItemList({ type }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/${type}`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            setItems(data);
        });
    }, [type]);

    console.log(items);

    return (
        <ul>
        {
            type === "users" ?
            items.map(user => <li>{user.username}</li>) :
            items.map(room => <li>{room.name}</li>)
        }
        </ul>
    )
}

export default ItemList;