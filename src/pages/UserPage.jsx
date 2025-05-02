import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { MessengerContext } from '../components/MessengerContext'; 
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function UserPage() {
    const { userId } = useParams();
    const { 
        BASE_URL, 
        user, 
        csrfToken,
        setUser,
        setIsAuthenticated 
    } = useContext(MessengerContext);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const deleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
          return;
        }
      
        try {
          const res = await fetch(`${BASE_URL}/users`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'X-CSRF-Token': csrfToken,         
              'Accept':       'application/json'
            }
          });
      
          if (res.ok) {
            console.log("Account deleted");
            setUser(null);
            setIsAuthenticated(false);
            navigate("/sign_up"); 
          } else {
            const err = await res.json();
            alert(`Failed to delete account: ${err.error || err}`);
          }
        } catch (err) {
          alert(`Network error: ${err.message}`);
        }
    } 

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const url = `${BASE_URL}/users/${userId}`;
        console.log(`Workspaceing user data from: ${url}`); 

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Received user data:", data);
                setSelectedUser(data);
            } else {
                const errorData = await response.json();
                console.error(`Error fetching user page (${response.status}):`, errorData);
                setError(errorData.error || `Failed to load user page (status: ${response.status})`);
            }
        } catch (err) {
            console.error("Network error fetching user page:", err);
            setError(`Network error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [BASE_URL, userId, setSelectedUser]); 

    // Effect for initial data load
    useEffect(() => {
        fetchUserData(); // Call the memoized function
    }, [fetchUserData]);

    if (loading) {
        return <div>Loading room...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (!selectedUser) {
        return <div>User page not found.</div>; 
    }

    return (
        <>
            <h1>{selectedUser.username}</h1>
            <h2>Room Memberships</h2>
            {Array.isArray(selectedUser.rooms) && selectedUser.rooms.length > 0 ? (
            <ul>
                {selectedUser.rooms.map(room => (
                <li key={room.id}>
                    <Link to={`/rooms/${room.id}`}>{room.name}</Link>
                </li>
                ))}
            </ul>
            ) : (
            <p>This user isn’t a member of any rooms yet.</p>
            )}
            {
                user.id === selectedUser.id ? 
                <button onClick={deleteAccount}>Delete Account</button> :
                <></>
            }
        </>
    )
}

export default UserPage;