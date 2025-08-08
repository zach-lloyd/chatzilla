import { createContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";

// Normalize error messages into readable format. Export this function separately
// for testing purposes.
export function processErrors(errorData) {
  let statements = [];
  // Check if the 'errors' key exists and is an object.
  if (
    errorData &&
    typeof errorData.errors === "object" &&
    errorData.errors !== null
  ) {
    const validationErrors = errorData.errors;
    // Apply the flatMap logic to the nested validationErrors object.
    statements = Object.entries(validationErrors).flatMap(([key, messages]) => {
      // Ensure 'messages' is actually an array before mapping.
      if (Array.isArray(messages)) {
        return messages.map((message) => `${key} ${message}`);
      } else if (typeof messages === "string") {
        // Handle case where value might be a single string.
        return [`${key} ${messages}`];
      }
      console.warn(
        `Expected array or string for key '${key}' inside 'errors', but got:`,
        messages
      );
      return []; // Ignore if format is unexpected for this key.
    });
  } else if (errorData && typeof errorData.error === "string") {
    statements.push(errorData.error);
  } else if (
    errorData &&
    errorData.status &&
    Array.isArray(errorData.status.errors) &&
    // The errors object is nested within status for this particular error,
    // so need to first call status to be able to access it.
    errorData.status.errors[0] === "Username contains inappropriate language."
  ) {
    statements.push(errorData.status.errors[0]);
  } else {
    // Handle cases where the error format is unexpected (e.g., a simple
    // string error).
    console.error("Error format unexpected:", errorData);
    statements = ["Sign-in failed. Please check your credentials."];
  }

  return statements;
}

export const MessengerContext = createContext();

export const MessengerProvider = ({ children }) => {
  const BASE_URL = import.meta.env.PROD
    ? import.meta.env.VITE_API_URL
    : "http://localhost:3000";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  // Get CSRF token from the backend and store for later use.
  useEffect(() => {
    const fetchCsrf = async () => {
      const res = await fetch(`${BASE_URL}/csrf-token`, {
        credentials: "include",
      });
      const { csrfToken } = await res.json();
      setCsrfToken(csrfToken);
      // Also store token in global window so non-React code can use it.
      window.CSRF_TOKEN = csrfToken;
    };
    fetchCsrf();
  }, [BASE_URL]);

  // Memoized helper so child components can refresh the user object
  // without triggering unnecessary re-renders.
  const updateUser = useCallback((userData) => {
    console.log("Context: updateUser called. Calling setUser with:", userData);
    setUser(userData);
  }, []);

  // Allow the user to toggle whether they show up as online or offline.
  const togglePresence = async () => {
    if (!user) return;
    try {
      const resp = await fetch(`${BASE_URL}/users/${user.id}/toggle_presence`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      const data = await resp.json();
      setUser((u) => ({ ...u, presence: data.presence }));
    } catch (err) {
      console.error("Error toggling presence:", err);
    }
  };

  return (
    <MessengerContext.Provider
      value={{
        BASE_URL,
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        updateUser,
        processErrors,
        togglePresence,
        csrfToken,
      }}
    >
      {children}
    </MessengerContext.Provider>
  );
};

// This is needed to handle "missing in props validation" error raised by ESLint.
MessengerProvider.propTypes = {
  children: PropTypes.node,
};
