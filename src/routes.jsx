import SignIn from "./components/SignIn";
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
        element: <SignIn />
    }
];
  
export default routes;
