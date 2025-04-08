import React, { useState, useContext } from 'react';
import { MessengerContext } from './MessengerContext';
import { Link } from "react-router-dom";

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { 
        BASE_URL, 
        handleAuthentication,
        updateUser
    } = useContext(MessengerContext);
    

    const handleSignIn = async () => {
        const response = await fetch(`${BASE_URL}/users/sign_in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // Devise expects params in the shape: { user: { email, password, ... } }
            body: JSON.stringify({
                user: {
                    email,
                    password
                }
            }),
            credentials: 'include'
        });
    
        if (response.ok) {
            const data = await response.json();
            console.log('Sign in success:', data);
            // The response might include the created user object. 
            // If Devise is sending a session cookie, your browser has it now (assuming same domain or correct CORS).
            handleAuthentication(true);
            updateUser(data);
        } else {
            // If it fails validation or password mismatch, etc.
            const errorData = await response.json();
            console.error('Sign in error:', errorData);
            alert(JSON.stringify(errorData));
        }
    };

    return (
        <div className="card p-4 shadow-sm">
            <h2 className="card-title mb-4">Sign In</h2>
            <div className="mb-3">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
            </div>
            <div className="mb-3">
                <input 
                    type="password" 
                    className="form-control"
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
            </div>
            <button onClick={handleSignIn} className="btn btn-primary w-100">Sign In</button>
            <p>First time user?</p>
            <Link to="/sign_up">Sign Up</Link>
        </div>
    );
}

export default SignIn;