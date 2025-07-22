import PropTypes from "prop-types";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { MessengerContext } from "../components/MessengerContext";

function RequireNoAuth({ children }) {
  const { isAuthenticated } = useContext(MessengerContext);
  console.log("RequireNoAuth Check:", isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

RequireNoAuth.propTypes = {
  children: PropTypes.node,
};

export default RequireNoAuth;
