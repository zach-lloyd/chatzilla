import { useEffect, useContext } from "react";
import SignIn from "./components/SignIn.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { MessengerContext } from "./components/MessengerContext";

function App() {
  const { BASE_URL, isAuthenticated, setIsAuthenticated, user, setUser } =
    useContext(MessengerContext);

  useEffect(() => {
    // If the user comes back to this page via the browser’s Back button, refresh
    // the page so they don’t see old, possibly outdated state.
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) {
        window.location.reload();
      }
    });
  }, []);

  const handleSignOut = async () => {
    const response = await fetch(`${BASE_URL}/users/sign_out`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      console.log("Sign out success");
      // If signout was successful, reset the global authentication state
      // accordingly.
      setIsAuthenticated(false);
      setUser(null);
    } else {
      const errorData = await response.json();
      console.error("Sign out error:", errorData);
      alert(JSON.stringify(errorData));
    }
  };

  return (
    <div className="container-fluid d-flex flex-column p-0 m-0 min-vh-100">
      <main className="flex-grow-1 container-fluid d-flex flex-column">
        {!isAuthenticated ? (
          /* If user is not authenticated, show the sign in view */
          <div
            className="d-flex flex-column align-items-center 
                          justify-content-evenly gap-3 mb-4 flex-grow-1"
          >
            <div className="d-flex flex-column align-items-center gap-3">
              <div>
                <SignIn />
              </div>
            </div>
          </div>
        ) : (
          /* If user is authenticated, display username and log out button as header */
          <div className="mb-4 flex-grow-1">
            <div className="d-flex gap-3 w-100 justify-content-end">
              <p className="mb-2">
                You are logged in as: <strong>{user?.email}</strong>
              </p>
              <button
                onClick={handleSignOut}
                className="btn btn-danger mb-3 mt-1 me-1"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
