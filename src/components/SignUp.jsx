import React, { useState, useContext } from 'react';
import { MessengerContext } from './MessengerContext';
import { Link } from "react-router-dom";

function SignUp() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const { 
        BASE_URL, 
        setIsAuthenticated,
        updateUser
    } = useContext(MessengerContext);

    const handleSignUp = async () => {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // Devise expects params in the shape: { user: { email, password, ... } }
            body: JSON.stringify({
                user: {
                    email,
                    username,
                    password,
                    password_confirmation: passwordConfirmation
                }
            }),
            credentials: 'include'
        });
    
        if (response.ok) {
            const data = await response.json();
            console.log('Sign up success:', data);
            // The response might include the created user object. 
            // If Devise is sending a session cookie, your browser has it now (assuming same domain or correct CORS).
            setIsAuthenticated(true);
            updateUser(data);
        } else {
            // If it fails validation or password mismatch, etc.
            const errorData = await response.json();
            console.error('Sign up error:', errorData);
            alert(JSON.stringify(errorData));
        }
    };

    return (
        <div className="card p-4 shadow-sm">
            <h2 className="card-title mb-4">Sign Up</h2>
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
                    type="text" 
                    className="form-control" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
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
            <div className="mb-3">
                <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Confirm Password" 
                    value={passwordConfirmation} 
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
            </div>
            <button onClick={handleSignUp} className="btn btn-primary w-100">Sign Up</button>
            <p>Already signed up?</p>
            <Link to="/sign_in">Sign In</Link>
        </div>
    );
}

export default SignUp;