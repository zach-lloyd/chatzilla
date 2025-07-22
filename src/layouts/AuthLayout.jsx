import { Outlet } from "react-router-dom";
import Logo from "../components/Logo";

function AuthLayout() {
  return (
    <div className="container-fluid p-0">
      <div className="row g-0 min-vh-100 justify-content-center">
        <div
          className="col-12 col-md-6 d-flex justify-content-center 
                        align-items-center mt-5"
        >
          <Logo />
        </div>
        <div
          className="col-12 col-md-6 d-flex justify-content-center 
                        align-items-center"
        >
          <Outlet /> {/* SignIn or SignUp */}
        </div>
      </div>
    </div>
  );
}
export default AuthLayout;
