import React, { createContext, useState } from 'react';

export const MessengerContext = createContext();

export const MessengerProvider = ({ children }) => {
    const BASE_URL = 'http://localhost:3000';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    function updateUser(userData) {
        setUser(userData);
    }

    return (
        <MessengerContext.Provider value={{ 
            BASE_URL, 
            isAuthenticated, 
            setIsAuthenticated,
            user, 
            setUser,
            updateUser 
        }}>
            {children}
        </MessengerContext.Provider>
    );
};
