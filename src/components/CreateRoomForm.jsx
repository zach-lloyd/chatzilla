import React, { useState, useContext } from 'react';
import { MessengerContext } from './MessengerContext';

function CreateRoomForm() {
    const [roomName, setRoomName] = useState("");
    const [roomDescription, setRoomDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const DESCRIPTION_LENGTH = 300;
    const { 
        BASE_URL, 
    } = useContext(MessengerContext);

    const handleRoomCreation = async () => {
        const response = await fetch(`${BASE_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                room: {
                    name: roomName,
                    description: roomDescription,
                    public: isPublic,
                }
            }),
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Room successfully created:', data);
            // The response might include the created room object. 
            // If Devise is sending a session cookie, your browser has it now (assuming same domain or correct CORS).
        } else {
            // If it fails validation, etc.
            const errorData = await response.json();
            console.error('Error creating room:', errorData);
            console.log(JSON.stringify(errorData));
        }
    }

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
