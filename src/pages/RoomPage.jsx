import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { MessengerContext } from '../components/MessengerContext'; 
import SubmitButton from "../assets/send.png";

function RoomPage() {
    const { roomId } = useParams(); 
    const { BASE_URL } = useContext(MessengerContext);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messageText, setMessageText] = useState("");

    useEffect(() => {
        const fetchRoomData = async () => {
            setLoading(true);
            setError(null);
            const url = `${BASE_URL}/rooms/${roomId}`;
            console.log(`Workspaceing room data from: ${url}`);

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include' 
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Received room data:", data);
                    setRoom(data);
                } else {
                    const errorData = await response.json();
                    console.error(`Error fetching room (${response.status}):`, errorData);
                    setError(errorData.error || `Failed to load room (status: ${response.status})`);
                }
            } catch (err) {
                console.error("Network error fetching room:", err);
                setError(`Network error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [roomId, BASE_URL]); // Re-fetch if roomId or BASE_URL changes

    const submitMessage = async () => {
        if (messageText.trim() === '') {
            // Don't submit empty messages
            return;
        }
        const url = `${BASE_URL}/rooms/${roomId}/messages`;
        const payload = { message: { body: messageText } };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json(); // data should be the created room object { id: ..., name: ..., ... }
                console.log('Message successfully submitted:', data);
                setMessageText("");
            } else {
                const errorData = await response.json();
                console.error(`Error submitting message (${response.status}):`, errorData);
                alert(`Error: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Network error submitting message:", error);
            alert(`Network error: ${error.message}`);
        }
    }

    if (loading) {
        return <div>Loading room...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (!room) {
        return <div>Room not found.</div>; // Should ideally be handled by error state
    }

    return (
        <div>
            <h1>{room.name}</h1>
            <p>{room.description || <i>No description</i>}</p>
            <p><strong>Status:</strong> {room.public ? 'Public' : 'Private'}</p>

            <hr />

            <h2>Members ({room.users?.length || 0})</h2>
            {/* Check if room.users exists and is an array */}
            {Array.isArray(room.users) && room.users.length > 0 ? (
                <ul>
                    {/* Make sure your backend includes users with at least 'id' and 'username' */}
                    {room.users.map(user => (
                        <li key={user.id}>{user.username || `User ${user.id}`}</li>
                    ))}
                </ul>
            ) : (
                <p>No members found (or data format incorrect).</p>
            )}

            <input 
                type="text" 
                placeholder="Tell the room what's on your mind..." 
                value={messageText} 
                onChange={(e) => setMessageText(e.target.value)} 
            />
            <button onClick={submitMessage} type="button"> 
                <img
                    src={SubmitButton}
                    alt="Send message" // More concise alt text
                />
            </button>
        </div>
    );
}

export default RoomPage;