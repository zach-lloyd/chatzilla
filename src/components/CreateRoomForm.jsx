import React, { useState } from 'react';

function CreateRoomForm() {
    const [roomName, setRoomName] = useState("");
    const [roomDescription, setRoomDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const DESCRIPTION_LENGTH = 300;

    return (
        <div>
            <input 
                type="text" 
                placeholder="Name your room..." 
                value={roomName} 
                onChange={(e) => setRoomName(e.target.value)} 
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
        </div>
    )
}

export default CreateRoomForm;
