import React, { useState, useContext } from 'react';
import { MessengerContext } from './MessengerContext';
import { useNavigate } from 'react-router-dom';

function CreateRoomForm() {
    const [roomName, setRoomName] = useState("");
    const [roomDescription, setRoomDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const DESCRIPTION_LENGTH = 300;
    const { 
        BASE_URL, 
    } = useContext(MessengerContext);
    const navigate = useNavigate();

    const handleRoomCreation = async () => {
        const url = `${BASE_URL}/rooms`;
        const payload = { room: { name: roomName, description: roomDescription, public: isPublic } };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json(); // data should be the created room object { id: ..., name: ..., ... }
                console.log('Room successfully created:', data);

                // --- Navigate to the new room's page ---
                if (data && data.id) {
                    console.log(`Navigating to /rooms/${data.id}`);
                    navigate(`/rooms/${data.id}`); // <-- Use navigate
                } else {
                    console.error("Created room data missing ID:", data);
                }
                // ---

                // No need to clear form here as we are navigating away
            } else {
                const errorData = await response.json();
                console.error(`Error creating room (${response.status}):`, errorData);
                alert(`Error: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Network error creating room:", error);
            alert(`Network error: ${error.message}`);
        }
    };

    return (
        <div>
            <input 
                type="text" 
                placeholder="Name your room..." 
                value={roomName} 
                onChange={(e) => setRoomName(e.target.value)} 
                required
            />
            <textarea 
                maxLength={DESCRIPTION_LENGTH}
                placeholder="Describe your room..." 
                value={roomDescription} 
                onChange={(e) => setRoomDescription(e.target.value)} 
            />
            <label>
                <input 
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                />
                Public
            </label>
            <button onClick={handleRoomCreation} className="btn btn-primary w-100">Create Room</button>
        </div>
    )
}

export default CreateRoomForm;
