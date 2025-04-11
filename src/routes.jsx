import SignUp from "./components/SignUp";
import App from "./App.jsx";

const routes = [
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/sign_up",
        element: <SignUp />
    },
    {
        path: "/sign_in",
        element: <App />
    }
];
  
export default routes;
