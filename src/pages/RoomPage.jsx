import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MessengerContext } from '../components/MessengerContext'; 
import SubmitButton from "../assets/send.png";
import { getConsumer, disconnectConsumer } from '../services/cable'; // <-- Import consumer logic

function RoomPage() {
    const { roomId } = useParams(); 
    const { BASE_URL, user } = useContext(MessengerContext);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messageText, setMessageText] = useState("");
    const subscriptionRef = useRef(null);

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
                    setMessages(data.messages || []);
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

    // Effect for Action Cable subscription
    useEffect(() => {
        if (!roomId) return; // Don't subscribe if roomId isn't available yet

        const consumer = getConsumer();
        console.log(`Attempting to subscribe to RoomChannel with room_id: ${roomId}`);

        const subscription = consumer.subscriptions.create(
            { channel: "RoomChannel", room_id: roomId }, // Match channel name and pass params
            {
                // Called when the subscription is ready for use
                connected() {
                    console.log(`Connected to RoomChannel ${roomId}`);
                },

                // Called when the subscription is rejected by the server
                rejected() {
                    console.error(`Subscription rejected for RoomChannel ${roomId}`);
                    setError("Could not connect to the chat room. Authorization failed.");
                },

                // Called when the subscription is terminated by the server
                disconnected() {
                    console.log(`Disconnected from RoomChannel ${roomId}`);
                },

                // Called when data is broadcast from the server on this channel
                received(messageData) {
                    console.log("Received message:", messageData);
                    // --- Add the new message to the state ---
                    setMessages(prevMessages => {
                        // Check if message already exists by id to prevent duplicates
                        if (prevMessages.some(msg => msg.id === messageData.id)) {
                            return prevMessages;
                        }
                        return [...prevMessages, messageData];
                    });
                }
            }
        );

        // Store the subscription in the ref
        subscriptionRef.current = subscription;

        // --- Cleanup function ---
        // This runs when the component unmounts or roomId changes
        return () => {
            console.log(`Unsubscribing from RoomChannel ${roomId}`);
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
            // Disconnect consumer if no other subscriptions are active
            disconnectConsumer();
        };

    }, [roomId]); // Re-run effect if roomId changes

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
                // const data = await response.json(); // data should be the created room object { id: ..., name: ..., ... }
                console.log('Message submitted via POST successfully');
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

    const joinRoom = async () => {
        const url = `${BASE_URL}/memberships`;
        const payload = { membership: { user_id: user.id, room_id: roomId } };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json(); // data should be the created membership object 
                console.log('Room successfully joined:', data);
            } else {
                const errorData = await response.json();
                console.error(`Error joining room (${response.status}):`, errorData);
                alert(`Error: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Network error joining room:", error);
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

            {/* --- Message Display Area --- */}
            <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                {(
                    // Check if room exists and is public
                    room?.public ||
                    // OR check if user exists, room.users is an array, AND the user's ID is found in the room.users array
                    (user && Array.isArray(room?.users) && room.users.some(member => member.id === user.id))
                    // The ?. optional chaining prevents errors if room or room.users is initially null/undefined
                    // Array.isArray ensures .some() is only called on an actual array
                ) ? (
                    // --- JSX to display messages (if authorized) ---
                    <> 
                        <h2>Messages</h2>
                        {/* Ensure messages state exists and is an array */}
                        {Array.isArray(messages) && messages.length > 0 ? (
                            <ul>
                                {messages.map(msg => (
                                    <li key={msg.id}>
                                        <strong>{msg.user?.username || 'User'}</strong> ({new Date(msg.created_at).toLocaleString()}):
                                        <p style={{ margin: '0 0 0 10px', padding: 0 }}>{msg.body}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No messages yet.</p>
                        )}
                    </>
                ) : (
                    // --- JSX for unauthorized ---
                    // Check if the room data has loaded before declaring unauthorized
                    // (Avoid showing this during initial loading state)
                    !loading && room ? (
                        <>
                            <h2>You are not authorized to view messages. Join the room or ensure it's public.</h2>
                            <button onClick={joinRoom}>Join Room</button>
                        </>
                    ) : null // Don't show anything during load or if room doesn't exist
                )}
            </div>
            {/* --- --- */}

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