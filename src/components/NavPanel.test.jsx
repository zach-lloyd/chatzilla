import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MessengerContext } from "./MessengerContext";
import NavPanel from "./NavPanel";

const mockSetIsAuthenticated = vi.fn();
const mockUpdateUser = vi.fn();
const mockProcessErrors = vi.fn((errorData) => [errorData.error]);
const mockTogglePresence = vi.fn();

const renderWithProviders = (component, providerProps = {}) => {
  return render(
    <MessengerContext.Provider
      // Merge default mock values with any custom props for the test.
      value={{
        setIsAuthenticated: mockSetIsAuthenticated,
        updateUser: mockUpdateUser,
        processErrors: mockProcessErrors,
        mockTogglePresence: mockTogglePresence,
        BASE_URL: "http://localhost:3000",
        csrfToken: "test-token",
        ...providerProps, // This allows for passing in a mock user.
      }}
    >
      <MemoryRouter>{component}</MemoryRouter>
    </MessengerContext.Provider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NavPanel Component", () => {
  // Test 1: Toggle NavPanel.
  test("toggles panel visibility", async () => {
    const mockUser = { username: "tester", presence: true };

    renderWithProviders(<NavPanel />, {
      user: mockUser,
      togglePresence: mockTogglePresence,
    });

    expect(screen.queryByText("tester")).toBeNull();

    await userEvent.click(screen.getByLabelText("Open navigation panel"));
    const username = await screen.findByText("tester");
    expect(username).toBeInTheDocument();
  });

  // Test 2: Test Users tab.
  test("clicking 'Users' button selects the Users tab", async () => {
    const mockUser = { username: "tester", presence: true };

    renderWithProviders(<NavPanel />, {
      user: mockUser,
      togglePresence: mockTogglePresence,
    });

    await userEvent.click(screen.getByLabelText("Open navigation panel"));
    const usersTabButton = screen.getByRole("tab", { name: /users/i });
    await userEvent.click(usersTabButton);

    expect(usersTabButton).toHaveAttribute("aria-selected", "true");

    const roomsTabButton = screen.getByRole("tab", { name: /rooms/i });
    expect(roomsTabButton).toHaveAttribute("aria-selected", "false");
  });

  // Test 3: Test toggle visibility button.
  test("User can toggle online visibility", async () => {
    const mockUser = { username: "tester", presence: true };

    renderWithProviders(<NavPanel />, {
      user: mockUser,
      togglePresence: mockTogglePresence,
    });

    await userEvent.click(screen.getByLabelText("Open navigation panel"));

    const usersTabButton = screen.getByRole("tab", { name: /users/i });
    await userEvent.click(usersTabButton);

    await userEvent.click(
      screen.getByRole("button", { name: /disable presence/i })
    );

    expect(mockTogglePresence).toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /disable presence/i })
    ).toBeInTheDocument();
  });

  test("User can toggle online visibility", async () => {
    const mockUser = { username: "tester", presence: true };

    renderWithProviders(<NavPanel />, {
      user: mockUser,
      togglePresence: mockTogglePresence,
    });

    await userEvent.click(screen.getByLabelText("Open navigation panel"));
    const roomsTabButton = screen.getByRole("tab", { name: /rooms/i });

    // Make sure the default rooms tab is displayed. This is the default tab so
    // no clicking should be necessary.
    expect(roomsTabButton).toHaveAttribute("aria-selected", "true");

    await userEvent.click(
      screen.getByRole("button", { name: /create new room/i })
    );

    expect(screen.getByText("Create a Room")).toBeInTheDocument();
  });
});
