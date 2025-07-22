import PropTypes from "prop-types";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { MessengerContext } from "../components/MessengerContext";

function RequireAuth({ children }) {
  const { isAuthenticated } = useContext(MessengerContext);
  console.log("RequireAuth Check:", isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/sign_in" replace />;
}

RequireAuth.propTypes = {
  children: PropTypes.node,
};

export default RequireAuth;
