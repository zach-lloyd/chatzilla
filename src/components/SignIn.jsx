import React, { useState, useContext } from 'react';
import { MessengerContext } from './MessengerContext';
import { Link } from "react-router-dom";

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState([]);
    const { 
        BASE_URL, 
        setIsAuthenticated,
        updateUser,
        processErrors,
        csrfToken
    } = useContext(MessengerContext);
    

    const handleSignIn = async () => {
        setErrors([]); // Clear out any existing errors
        const response = await fetch(`${BASE_URL}/users/sign_in`, {
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
                    password,
                    presence: true
                }
            }),
            credentials: 'include'
        });
    
        if (response.ok) {
            const data = await response.json();
            console.log('Sign in success:', data);
            console.log('SignIn: Calling updateUser with:', data); 
            // The response might include the created user object. 
            // If Devise is sending a session cookie, your browser has it now (assuming same domain or correct CORS).
            updateUser(data);
            console.log('SignIn: Calling setIsAuthenticated(true)');
            setIsAuthenticated(true);
        } else {
            // If it fails validation or password mismatch, etc.
            const errorData = await response.json();
            console.error('Sign in error:', errorData);
            const statements = processErrors(errorData);
            setErrors(statements);
        }
    };

    return (
        <div className="card p-4 shadow-sm w-100 h-sm-100 w-md-75 mt-5">
            <h2 className="card-title mb-4">Sign In</h2>
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
            <button onClick={handleSignIn} className="btn btn-monster w-100">Sign In</button>
            <div className="d-flex gap-2">
                <p>First time user?</p>
                <Link className="text-custom-green" to="/sign_up">Sign Up</Link>
            </div>
        </div>
    );
}

export default SignIn;