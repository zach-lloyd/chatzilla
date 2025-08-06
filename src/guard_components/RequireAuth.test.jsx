import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { MessengerContext } from "../components/MessengerContext";
import RequireAuth from "./RequireAuth";

const renderWithProviders = (
  component,
  providerProps = {},
  routerProps = {}
) => {
  const defaultProps = {
    isAuthenticated: false,
  };

  return render(
    <MessengerContext.Provider
      value={{
        BASE_URL: "http://localhost:3000",
        csrfToken: "test-token",
        ...defaultProps,
        ...providerProps,
      }}
    >
      <MemoryRouter initialEntries={routerProps.initialRoutes}>
        {component}
      </MemoryRouter>
    </MessengerContext.Provider>
  );
};

describe("RequireAuth guard component", () => {
  // Test 1: Renders children for authenticated users.
  test("renders children when isAuthenticated is true", () => {
    const ProtectedComponent = () => <div>Protected Content</div>;
    const SignInPage = () => <h1>Sign In</h1>;

    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <ProtectedComponent />
            </RequireAuth>
          }
        />
        <Route path="/sign_in" element={<SignInPage />} />
      </Routes>,
      { isAuthenticated: true },
      { initialRoutes: ["/"] }
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  // Test 2: Doesn't render content if user not authenticated.
  test("navigates to sign-in page if user is not authenticated", () => {
    const ProtectedComponent = () => <div>Protected Content</div>;
    const SignInPage = () => <h1>Sign In</h1>;

    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <ProtectedComponent />
            </RequireAuth>
          }
        />
        <Route path="/sign_in" element={<SignInPage />} />
      </Routes>,
      { isAuthenticated: false },
      { initialRoutes: ["/"] }
    );

    expect(
      screen.getByRole("heading", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).toBeNull();
  });
});
