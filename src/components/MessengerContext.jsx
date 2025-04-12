import React, { createContext, useState, useCallback } from 'react';

export const MessengerContext = createContext();

export const MessengerProvider = ({ children }) => {
    const BASE_URL = 'http://localhost:3000';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    const updateUser = useCallback((userData) => {
        console.log("Context: updateUser called. Calling setUser with:", userData); 
        setUser(userData);
    }, []);

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
