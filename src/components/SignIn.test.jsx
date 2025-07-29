import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../setupTests";
import { MessengerContext } from "./MessengerContext";
import SignIn from "./SignIn";

// Mock context values.
const mockSetIsAuthenticated = vi.fn();
const mockUpdateUser = vi.fn();
const mockProcessErrors = vi.fn((errorData) => [errorData.error]);

// A helper to render the component with all necessary providers.
const renderWithProviders = (component) => {
  return render(
    <MessengerContext.Provider
      value={{
        BASE_URL: "http://localhost:3000",
        setIsAuthenticated: mockSetIsAuthenticated,
        updateUser: mockUpdateUser,
        processErrors: mockProcessErrors,
        csrfToken: "test-token",
      }}
    >
      <MemoryRouter>{component}</MemoryRouter>
    </MessengerContext.Provider>
  );
};

// Clear mock history before each test.
beforeEach(() => {
  vi.clearAllMocks();
});

describe("SignIn Component", () => {
  // Test 1: Successful Sign-In.
  test("allows a user to sign in successfully", async () => {
    const mockUser = { id: 1, email: "test@example.com", username: "tester" };

    server.use(
      http.post("http://localhost:3000/users/sign_in", () => {
        return HttpResponse.json(mockUser);
      })
    );

    renderWithProviders(<SignIn />);

    // Simulate user input.
    await userEvent.type(
      screen.getByPlaceholderText("Email"),
      "test@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("Password"), "password");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert that context functions were called correctly.
    expect(mockUpdateUser).toHaveBeenCalledWith(mockUser);
    expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
    // Ensure no error messages are shown.
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  // Test 2: Failed Sign-In.
  test("displays an error message on failed sign-in", async () => {
    const mockError = { error: "Invalid Email or password." };

    server.use(
      http.post("http://localhost:3000/users/sign_in", () => {
        return HttpResponse.json(mockError, { status: 401 });
      })
    );

    renderWithProviders(<SignIn />);

    // Simulate user input.
    await userEvent.type(
      screen.getByPlaceholderText("Email"),
      "wrong@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Password"),
      "wrongpassword"
    );
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert that the error message is displayed on the screen.
    // Use findByText because the error appears asynchronously.
    const errorMessage = await screen.findByText(/invalid email or password/i);
    expect(errorMessage).toBeInTheDocument();

    // Assert that success functions were NOT called.
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
  });

  // Test 3: Initial Render.
  test("renders the form elements correctly", () => {
    renderWithProviders(<SignIn />);

    expect(
      screen.getByRole("heading", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/first time user/i)).toBeInTheDocument();
  });
});
