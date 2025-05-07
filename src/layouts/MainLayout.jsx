import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom'; 
import { MessengerContext } from '../components/MessengerContext'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import NavPanel from "../components/NavPanel";

function MainLayout() {
  const { BASE_URL, user, setUser, setIsAuthenticated } = useContext(MessengerContext); 
  console.log('MainLayout Render - User from context:', user); 

  const handleSignOut = async () => {
    const response = await fetch(`${BASE_URL}/users/sign_out`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include'
    });

    if (response.ok) {
        console.log('Sign out success');
        setIsAuthenticated(false);
        setUser(null);
      // No need to navigate here, RequireAuth guard will handle redirect automatically
      // upon state change if the user tries to access protected routes again.
    } else {
        const errorData = await response.json();
        console.error('Sign out error:', errorData);
        alert(JSON.stringify(errorData));
    }
  };

  console.log('MainLayout Render - Does user exist?', !!user);
  console.log('MainLayout Render - Does user have email?', user?.email);

  return (
    <div className="container-fluid d-flex flex-column p-0 m-0 min-vh-100">
      <header className="p-0 d-flex justify-content-between align-items-center">
        <div>
          <NavPanel />
          {user && user.email && user.username ? (
            <span className="me-3">Logged in as: <strong>{user.username}</strong></span>
          ) : (
            <span className="me-3 text-danger">User or Email missing</span> 
          )}
          <button onClick={handleSignOut} className="btn btn-danger btn-sm">Log Out</button>
        </div>
      </header>

      <main className="flex-grow-1 container-fluid p-3">
         {/* The Outlet renders the matched child route (HomePage, ProfilePage, etc.) */}
         <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;