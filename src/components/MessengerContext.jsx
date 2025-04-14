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

    function processErrors(errorData) {
        let statements = []; // Initialize an empty array for error messages

        // --- MODIFIED PART ---
        // Check if the 'errors' key exists and is an object
        if (errorData && typeof errorData.errors === 'object' && errorData.errors !== null) {
            const validationErrors = errorData.errors; // Access the nested object

            // Apply the flatMap logic to the nested validationErrors object
            statements = Object.entries(validationErrors).flatMap(([key, messages]) => {
                // Ensure 'messages' is actually an array before mapping.
                if (Array.isArray(messages)) {
                    return messages.map(message => `${key} ${message}`);
                } else if (typeof messages === 'string') {
                    // Handle case where value might be a single string
                    return [`${key} ${messages}`];
                }
                console.warn(`Expected array or string for key '${key}' inside 'errors', but got:`, messages);
                return []; // Ignore if format is unexpected for this key
            });
        } else if (errorData && typeof errorData.error === 'string') {
            statements.push(errorData.error);
        } else {
            // Handle cases where the error format is unexpected (e.g., a simple string error)
            console.error('Error format unexpected:', errorData);
            // You could try to display a generic message or stringify the whole errorData
            statements = ['Sign-in failed. Please check your credentials.'];
            // Or potentially: statements = [JSON.stringify(errorData)];
        }

       return statements;
    }

    return (
        <MessengerContext.Provider value={{ 
            BASE_URL, 
            isAuthenticated, 
            setIsAuthenticated,
            user, 
            setUser,
            updateUser,
            processErrors 
        }}>
            {children}
        </MessengerContext.Provider>
    );
};
