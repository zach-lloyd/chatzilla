import React from 'react';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div style={{ minWidth: '320px', maxWidth: '400px' }}> 
        <Outlet /> {/* Renders SignInPage or SignUpPage */}
      </div>
    </div>
  );
}
export default AuthLayout;