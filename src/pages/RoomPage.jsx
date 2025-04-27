import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
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

    const fetchRoomData = useCallback(async () => {
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
    }, [roomId, BASE_URL]); 

    // Effect for initial data load
    useEffect(() => {
        fetchRoomData(); // Call the memoized function
    }, [fetchRoomData]);

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
        const url = `${BASE_URL}/rooms/${roomId}/membership`;
        // Ensure user and roomId are available before attempting to join
        if (!user || !roomId) {
            console.error("User or Room ID missing, cannot join room.");
            alert("Cannot join room at this time.");
            return;
        }
        const payload = { membership: { user_id: user.id, room_id: roomId } };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Room successfully joined:', data);
                // 2. Call fetchRoomData again to update the UI
                fetchRoomData(); // <-- REFETCH DATA
            } else {
                const errorData = await response.json();
                console.error(`Error joining room (${response.status}):`, errorData);
                alert(`Error: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Network error joining room:", error);
            alert(`Network error: ${error.message}`);
        }
    };

    const leaveRoom = async () => {
        if (!window.confirm('Are you sure you want to leave this room?')) {
            return; // Stop if user cancels
        }
    
        const url = `${BASE_URL}/rooms/${roomId}/membership`;
        console.log(`Attempting to DELETE membership at: ${url}`);
    
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                    // 'Content-Type' is usually not needed for DELETE requests without a body
                },
                credentials: 'include' 
            });
    
            // Handle Success (Status 204 No Content is expected)
            if (response.ok || response.status === 204) {
                console.log('Successfully left the room.');
                // --- Update UI: Refetch room data ---
                // This will update the 'room' state, causing the component
                // to re-render, hide messages/input, and show the "Join Room" button again.
                fetchRoomData();
            } else {
                // Handle Errors (e.g., 404 Not Found, 403 Forbidden)
                let errorData = { error: `Failed to leave room (status: ${response.status})` }; // Default error
                try {
                    // Try to parse error JSON, but handle cases where body might be empty/non-JSON
                     if (response.headers.get("content-type")?.includes("application/json")) {
                         errorData = await response.json();
                     }
                } catch (parseError) {
                    console.error("Could not parse error response:", parseError);
                }
                console.error(`Error leaving room (${response.status}):`, errorData);
                // Use setError state or alert
                 setError(errorData.error || `Failed to leave room (status: ${response.status})`);
            }
        } catch (error) {
            // Handle Network Errors
            console.error("Network error leaving room:", error);
            setError(`Network error: ${error.message}`);
        }
    };

    if (loading) {
        return <div>Loading room...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (!room) {
        return <div>Room not found.</div>; // Should ideally be handled by error state
    }

    const isMember = user && Array.isArray(room?.users) && room.users.some(member => member.id === user.id);
    const canViewMessages = room?.public || isMember;

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
                    {room.users.map(user => (
                        <li key={user.id}>{user.username || `User ${user.id}`}</li>
                    ))}
                </ul>
            ) : (
                <p>No members found (or data format incorrect).</p>
            )}

            {/* --- Message Display Area --- */}
            <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                {canViewMessages ? (
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
                            <h2>You are not authorized to view messages. Join the room to view messages.</h2>
                        </>
                    ) : null // Don't show anything during load or if room doesn't exist
                )}
            </div>
            {/* --- --- */}

            {isMember ? ( // Show input only if user is a member
                <div>
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
                    <button onClick={leaveRoom}>Leave Room</button>
                </div>
            ) : (
                // Show Join button again here if needed, or maybe just rely on the one above
                // Depending on your desired layout, you might only need one Join button.
                // If the room is public but user isn't a member, show Join button?
                !loading && room && !isMember && (
                     <button onClick={joinRoom}>Join Room</button>
                )
            )}
        </div>
    );
}

export default RoomPage;