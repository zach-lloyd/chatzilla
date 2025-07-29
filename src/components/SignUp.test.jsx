import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../setupTests";
import { MessengerContext } from "./MessengerContext";
import SignUp from "./SignUp";

const mockSetIsAuthenticated = vi.fn();
const mockUpdateUser = vi.fn();
const mockProcessErrors = vi.fn((errorData) => [errorData.error]);

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SignUp Component", () => {
  // Test 1: Successful Sign-Up.
  test("allows a user to sign up successfully", async () => {
    const mockUser = { id: 1, email: "test@example.com", username: "tester" };

    server.use(
      http.post("http://localhost:3000/users", () => {
        // Return a 201 Created status for a successful registration
        return HttpResponse.json(mockUser, { status: 201 });
      })
    );

    renderWithProviders(<SignUp />);

    await userEvent.type(
      screen.getByPlaceholderText("Email"),
      "test@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("Username"), "test");
    await userEvent.type(screen.getByPlaceholderText("Password"), "password");
    await userEvent.type(
      screen.getByPlaceholderText("Confirm Password"),
      "password"
    );
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mockUpdateUser).toHaveBeenCalledWith(mockUser);
    expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  // Test 2: Failed Sign-Up.
  test("displays an error message on failed sign-in", async () => {
    const mockError = { error: "Invalid Email or password." };

    server.use(
      http.post("http://localhost:3000/users", () => {
        return HttpResponse.json(mockError, { status: 401 });
      })
    );

    renderWithProviders(<SignUp />);

    await userEvent.type(screen.getByPlaceholderText("Email"), "wrong");
    await userEvent.type(screen.getByPlaceholderText("Username"), "test");
    await userEvent.type(screen.getByPlaceholderText("Password"), "password");
    await userEvent.type(
      screen.getByPlaceholderText("Confirm Password"),
      "password"
    );
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    const errorMessage = await screen.findByText(/invalid email or password/i);
    expect(errorMessage).toBeInTheDocument();

    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
  });

  // Test 3: Initial Render.
  test("renders the form elements correctly", () => {
    renderWithProviders(<SignUp />);

    expect(
      screen.getByRole("heading", { name: /sign up/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/already joined/i)).toBeInTheDocument();
  });
});
