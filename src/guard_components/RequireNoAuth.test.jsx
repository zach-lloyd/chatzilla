import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { MessengerContext } from "../components/MessengerContext";
import RequireNoAuth from "./RequireNoAuth";

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

describe("RequireNoAuth guard component", () => {
  // Test 1: Renders children if user not authenticated.
  test("renders children when isAuthenticated is false", async () => {
    const PublicComponent = () => <div>Public Content</div>;
    const SignInPage = () => <h1>Sign In</h1>;

    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <RequireNoAuth>
              <PublicComponent />
            </RequireNoAuth>
          }
        />
        <Route path="/sign_in" element={<SignInPage />} />
      </Routes>,
      { isAuthenticated: false },
      { initialRoutes: ["/"] }
    );

    expect(screen.getByText("Public Content")).toBeInTheDocument();
  });

  // Test 2: Doesn't render children if user authenticated.
  test("navigates to home page if user is authenticated", () => {
    const PublicComponent = () => <div>Public Content</div>;
    const WelcomePage = () => <h1>Welcome!</h1>;

    renderWithProviders(
      <Routes>
        <Route
          path="/sign_in"
          element={
            <RequireNoAuth>
              <PublicComponent />
            </RequireNoAuth>
          }
        />
        <Route path="/" element={<WelcomePage />} />
      </Routes>,
      { isAuthenticated: true },
      { initialRoutes: ["/sign_in"] }
    );

    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(screen.queryByText("Public Content")).toBeNull();
  });
});
