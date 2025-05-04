import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../components/Logo';

function AuthLayout() {
  return (
    <div className="container-fluid p-0">
      {/* row with zero gutters and full-viewport height */}
      <div className="row g-0 min-vh-100">
        {/* each col takes 6/12 = 50% of width */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
          <Logo />
        </div>
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
          <Outlet /> {/* SignIn or SignUp */}
        </div>
      </div>
    </div>
  );
}
export default AuthLayout;