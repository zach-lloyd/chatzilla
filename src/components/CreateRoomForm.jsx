import { useState, useContext } from "react";
import { MessengerContext } from "./MessengerContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function CreateRoomForm({ onClose, hidePanel }) {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  // The default is public, but users can choose to create private rooms where
  // only members can view the messages.
  const [isPublic, setIsPublic] = useState(true);
  // Limit the length of the description of the room to 300 characters.
  const DESCRIPTION_LENGTH = 300;
  const { BASE_URL, csrfToken } = useContext(MessengerContext);
  const navigate = useNavigate();

  // Create the room using the information specified by the user.
  const handleRoomCreation = async () => {
    const url = `${BASE_URL}/rooms`;
    const payload = {
      room: { name: roomName, description: roomDescription, public: isPublic },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Room successfully created:", data);
        // If room creation was successful, navigate to the new room's page and
        // close the form for creating a room.
        if (data && data.id) {
          console.log(`Navigating to /rooms/${data.id}`);
          navigate(`/rooms/${data.id}`);
          onClose();
          hidePanel();
        } else {
          console.error("Created room data missing ID:", data);
        }
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
    <div style={{ zIndex: 1000 }} className="d-flex flex-column">
      <input
        type="text"
        placeholder="Name your room..."
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        required
        className="mb-2"
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

      <button onClick={handleRoomCreation} className="btn btn-monster w-100">
        Create Room
      </button>
    </div>
  );
}

export default CreateRoomForm;

// This is needed to handle "missing in props validation" error raised by ESLint.
CreateRoomForm.propTypes = {
  onClose: PropTypes.node,
  hidePanel: PropTypes.node,
};
