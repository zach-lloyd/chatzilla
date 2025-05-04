import React, { useState, useContext } from 'react';
import { MessengerContext } from './MessengerContext';
import { Link } from "react-router-dom";

function SignUp() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState([]);
    const { 
        BASE_URL, 
        setIsAuthenticated,
        updateUser,
        processErrors,
        csrfToken
    } = useContext(MessengerContext);

    const handleSignUp = async () => {
        setErrors([]); // Clear out any existing errors
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-Token': csrfToken
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
            console.log(JSON.stringify(errorData));
            const statements = processErrors(errorData);
            setErrors(statements);
        }
    };

    return (
        <div className="card p-4 shadow-sm">
            <h2 className="card-title mb-4">Sign Up</h2>
            {errors.length > 0 && (
                 <ul className="text-danger mb-3">
                    {
                        errors.map((statement, index) => (
                            <li key={index}>{statement}</li>
                        ))
                    }
                </ul>
            )}
            <div className="mb-3">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                />
            </div>
            <div className="mb-3">
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required
                />
            </div>
            <div className="mb-3">
                <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                />
            </div>
            <div className="mb-3">
                <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Confirm Password" 
                    value={passwordConfirmation} 
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                />
            </div>
            <button onClick={handleSignUp} className="btn btn-monster w-100">Sign Up</button>
            <p>Already signed up?</p>
            <Link to="/sign_in">Sign In</Link>
        </div>
    );
}

export default SignUp;