import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MessengerContext } from "../components/MessengerContext";
import SubmitButton from "../assets/send.png";
import { Link } from "react-router-dom";
import { getConsumer, disconnectConsumer } from "../services/cable";

function RoomPage() {
  const { roomId } = useParams();
  const { BASE_URL, user, csrfToken } = useContext(MessengerContext);
  const [room, setRoom] = useState(null);
  // The messages that have been posted in this room.
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track the array of user IDs that are currently displaying as online.
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [messageText, setMessageText] = useState("");
  const subscriptionRef = useRef(null);

  console.log(`User presence enabled: ${user.presence}`);

  const fetchRoomData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const url = `${BASE_URL}/rooms/${roomId}`;
    console.log(`Workspaceing room data from: ${url}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Received room data:", data);
        setRoom(data);
        setMessages(data.messages || []);
      } else {
        const errorData = await response.json();
        console.error(`Error fetching room (${response.status}):`, errorData);
        setError(
          errorData.error || `Failed to load room (status: ${response.status})`
        );
      }
    } catch (err) {
      console.error("Network error fetching room:", err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [roomId, BASE_URL]);

  // Effect for initial load of the applicable room's data.
  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  // Effect for Action Cable room subscription.
  useEffect(() => {
    if (!roomId) return; // Don't subscribe if roomId isn't available yet.

    const consumer = getConsumer();
    console.log(
      `Attempting to subscribe to RoomChannel with room_id: ${roomId}`
    );

    const subscription = consumer.subscriptions.create(
      { channel: "RoomChannel", room_id: roomId }, // Match channel name and pass params.
      {
        // Called when the subscription is ready for use.
        connected() {
          console.log(`Connected to RoomChannel ${roomId}`);
        },

        // Called when the subscription is rejected by the server.
        rejected() {
          console.error(`Subscription rejected for RoomChannel ${roomId}`);
          setError("Could not connect to the chat room. Authorization failed.");
        },

        // Called when the subscription is terminated by the server.
        disconnected() {
          console.log(`Disconnected from RoomChannel ${roomId}`);
        },

        // Called when data is broadcast from the server on this channel.
        received(messageData) {
          console.log("Received message:", messageData);
          // Add the new message to the state.
          setMessages((prevMessages) => {
            // Check if message already exists by id to prevent duplicates.
            if (prevMessages.some((msg) => msg.id === messageData.id)) {
              return prevMessages;
            }
            return [...prevMessages, messageData];
          });
        },
      }
    );

    subscriptionRef.current = subscription;

    // This runs when the component unmounts or roomId changes.
    return () => {
      console.log(`Unsubscribing from RoomChannel ${roomId}`);

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      // Disconnect consumer if no other subscriptions are active.
      disconnectConsumer();
    };
  }, [roomId]);

  // Subscribe to Presence channel.
  useEffect(() => {
    const consumer = getConsumer();
    const presenceSub = consumer.subscriptions.create(
      { channel: "PresenceChannel" },
      {
        connected() {
          console.log("Connected to PresenceChannel");
        },
        received(data) {
          // data.online_user_ids is the array that broadcasts from Rails.
          console.log("PresenceChannel received:", data.online_user_ids);
          setOnlineUserIds(data.online_user_ids);
        },
      }
    );

    return () => {
      presenceSub.unsubscribe();
    };
  }, [roomId]);

  const submitMessage = async () => {
    // Don't submit empty messages.
    if (messageText.trim() === "") {
      return;
    }

    const url = `${BASE_URL}/rooms/${roomId}/messages`;
    const payload = { message: { body: messageText } };

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
        console.log("Message submitted via POST successfully");
        setMessageText("");
      } else {
        const errorData = await response.json();
        console.error(
          `Error submitting message (${response.status}):`,
          errorData
        );
        alert(`Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Network error submitting message:", error);
      alert(`Network error: ${error.message}`);
    }
  };

  const joinRoom = async () => {
    const url = `${BASE_URL}/rooms/${roomId}/membership`;

    // Ensure user and roomId are available before attempting to join.
    if (!user || !roomId) {
      console.error("User or Room ID missing, cannot join room.");
      alert("Cannot join room at this time.");
      return;
    }

    const payload = { membership: { user_id: user.id, room_id: roomId } };

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
        console.log("Room successfully joined:", data);
        // Call fetchRoomData again to update the UI.
        fetchRoomData();
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
    if (!window.confirm("Are you sure you want to leave this room?")) {
      return; // Stop if user cancels.
    }

    const url = `${BASE_URL}/rooms/${roomId}/membership`;
    console.log(`Attempting to DELETE membership at: ${url}`);

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });

      // Handle Success (Status 204 No Content is expected).
      if (response.ok || response.status === 204) {
        console.log("Successfully left the room.");
        // This will update the 'room' state, causing the component to re-render,
        // hide messages/input, and show the "Join Room" button again.
        fetchRoomData();
      } else {
        let errorData = {
          error: `Failed to leave room (status: ${response.status})`,
        };
        try {
          // Try to parse error JSON, but handle cases where body might be
          // empty/non-JSON.
          if (
            response.headers.get("content-type")?.includes("application/json")
          ) {
            errorData = await response.json();
          }
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
        }
        console.error(`Error leaving room (${response.status}):`, errorData);

        setError(
          errorData.error || `Failed to leave room (status: ${response.status})`
        );
      }
    } catch (error) {
      console.error("Network error leaving room:", error);
      setError(`Network error: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading room...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  if (!room) {
    return <div>Room not found.</div>; // Should ideally be handled by error state.
  }

  const isMember =
    user &&
    Array.isArray(room?.users) &&
    room.users.some((member) => member.id === user.id);
  const canViewMessages = room?.public || isMember;
  const allMembers = Array.isArray(room.users) ? room.users : [];
  const onlineMembers = allMembers.filter((u) => onlineUserIds.includes(u.id));
  const offlineMembers = allMembers.filter(
    (u) => !onlineUserIds.includes(u.id)
  );

  return (
    <div className="container-fluid row mt-5">
      <div className="col-12 col-md-9">
        {/* Message Display Area */}
        <div
          style={{
            height: "400px",
            overflowY: "scroll",
            border: "1px solid #ccc",
            marginBottom: "10px",
            padding: "10px",
          }}
        >
          {
            // Check whether user is authorized to view messages in this room and
            // if so, display them.
            canViewMessages ? (
              <>
                <h2>Messages</h2>
                {/* Ensure messages state exists and is an array */}
                {Array.isArray(messages) && messages.length > 0 ? (
                  <ul className="list-unstyled d-flex flex-column">
                    {messages.map((msg) => (
                      <li
                        key={msg.id}
                        style={{
                          backgroundColor:
                            msg.user?.username === user.username
                              ? "#7AC142"
                              : "#402468",
                          alignSelf:
                            msg.user?.username === user.username
                              ? "end"
                              : "start",
                        }}
                        className="mb-2 rounded w-50 p-2"
                      >
                        <strong>{msg.user?.username || "User"}</strong> (
                        {new Date(msg.created_at).toLocaleString()}):
                        <p style={{ margin: "0 0 0 10px", padding: 0 }}>
                          {msg.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No messages yet.</p>
                )}
              </>
            ) : // Check if the room data has loaded before determining the user
            // is unauthorized.
            !loading && room ? (
              <>
                <h2>
                  You are not authorized to view messages. Join the room to view
                  messages.
                </h2>
              </>
            ) : null // Don't show anything during load or if room doesn't exist.
          }
        </div>

        {isMember ? ( // Show input for posting messages only if user is a member.
          <div className="d-flex justify-content-between">
            <textarea
              type="text"
              placeholder="Tell the room what's on your mind..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{
                width: "63vw",
                backgroundColor: "#402468",
                color: "#ffffff",
              }}
              className="rounded"
            />

            <button
              onClick={submitMessage}
              type="button"
              style={{ width: "6vw", padding: 0 }}
            >
              <img
                src={SubmitButton}
                alt="Send message"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </button>
          </div>
        ) : (
          !loading &&
          room &&
          !isMember && (
            <button onClick={joinRoom} className="btn-monster">
              Join Room
            </button>
          )
        )}
      </div>

      <div className="col-12 col-md-3">
        <h1>{room.name}</h1>
        <p>{room.description || <i>No description</i>}</p>
        <p>
          <strong>Status:</strong> {room.public ? "Public" : "Private"}
        </p>
        {isMember ? (
          <button onClick={leaveRoom} className="btn-monster">
            Leave Room
          </button>
        ) : (
          <></>
        )}

        <hr />

        <h2>Members ({allMembers.length})</h2>

        {/* Display the users that are online. */}
        <h3>Online ({onlineMembers.length})</h3>
        {onlineMembers.length > 0 ? (
          <ul className="list-unstyled">
            {onlineMembers.map((u) => (
              <Link key={u.id} to={`/users/${u.id}`}>
                <li className="ps-2 user-background">
                  {u.username || `User ${u.id}`}
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <p>No one is online right now.</p>
        )}

        {/* Display the users that are offline. */}
        <h3>Offline ({offlineMembers.length})</h3>
        {offlineMembers.length > 0 ? (
          <ul className="list-unstyled">
            {offlineMembers.map((u) => (
              <Link key={u.id} to={`/users/${u.id}`}>
                <li className="ps-2 user-background">
                  {u.username || `User ${u.id}`}
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <p>Everyone’s online!</p>
        )}
      </div>
    </div>
  );
}

export default RoomPage;
