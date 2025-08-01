import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { server } from "../setupTests";
import { MessengerContext } from "../components/MessengerContext";
import UserPage from "./UserPage";

const mockSetIsAuthenticated = vi.fn();
const mockSetUser = vi.fn();

// Because this component uses useNavigate, I need to mock it.
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.spyOn(window, "confirm").mockReturnValue(true);

const renderWithProviders = (
  component,
  providerProps = {},
  routerProps = {}
) => {
  return render(
    <MessengerContext.Provider
      value={{
        BASE_URL: "http://localhost:3000",
        csrfToken: "test-token",
        setUser: mockSetUser,
        setIsAuthenticated: mockSetIsAuthenticated,
        ...providerProps,
      }}
    >
      <MemoryRouter initialEntries={routerProps.initialRoutes}>
        {component}
      </MemoryRouter>
    </MessengerContext.Provider>
  );
};

describe("UserPage", () => {
  // Test 1: Display of user data.
  test("page shows a loading screen then successfully fetches and displays \
    user's data", async () => {
    const mockPageUser = {
      id: 1,
      username: "tester",
      rooms: [{ id: 101, name: "Test Room" }],
    };

    const mockCurrentUser = { id: 1, username: "tester" };

    server.use(
      http.get("http://localhost:3000/users/1", () => {
        return HttpResponse.json(mockPageUser);
      })
    );

    renderWithProviders(
      // UserPage must be rendered inside a Route to get the :userId param.
      <Routes>
        <Route path="/users/:userId" element={<UserPage />} />
      </Routes>,
      { user: mockCurrentUser },
      // Use MemoryRouter to simulate being on the correct URL.
      { initialRoutes: ["/users/1"] }
    );

    expect(screen.getByText("Loading room...")).toBeInTheDocument();

    const username = await screen.findByText("tester");
    expect(username).toBeInTheDocument();

    const roomName = await screen.findByText("Test Room");
    expect(roomName).toBeInTheDocument();
  });

  // Test 2: Test Delete Account button for current user.
  test("'Delete Account' appears for logged-in user", async () => {
    const mockCurrentUser = { id: 1, username: "tester" };
    const mockPageUser = { id: 1, username: "tester" };

    server.use(
      http.get("http://localhost:3000/users/1", () => {
        return HttpResponse.json(mockPageUser);
      })
    );

    renderWithProviders(
      // UserPage must be rendered inside a Route to get the :userId param.
      <Routes>
        <Route path="/users/:userId" element={<UserPage />} />
      </Routes>,
      { user: mockCurrentUser },
      // Use MemoryRouter to simulate being on the correct URL.
      { initialRoutes: ["/users/1"] }
    );

    const deleteButton = await screen.findByRole("button", {
      name: /delete account/i,
    });
    expect(deleteButton).toBeInTheDocument();
  });

  // Test 3: Test no Delete Account button for other users.
  test("'Delete Account' does not appear for users other than current user", async () => {
    const mockCurrentUser = { id: 1, username: "tester" };
    const mockPageUser = { id: 2, username: "tester2" };

    server.use(
      http.get("http://localhost:3000/users/2", () => {
        return HttpResponse.json(mockPageUser);
      })
    );

    renderWithProviders(
      // UserPage must be rendered inside a Route to get the :userId param.
      <Routes>
        <Route path="/users/:userId" element={<UserPage />} />
      </Routes>,
      { user: mockCurrentUser },
      // Use MemoryRouter to simulate being on the correct URL.
      { initialRoutes: ["/users/2"] }
    );

    const deleteButton = screen.queryByRole("button", {
      name: /delete account/i,
    });

    expect(deleteButton).toBeNull();
  });

  // Test 4: Delete Account button works as expected.
  test("'Delete Account' button works as expected", async () => {
    const mockCurrentUser = { id: 1, username: "tester" };
    const mockPageUser = { id: 1, username: "tester" };

    server.use(
      http.delete("http://localhost:3000/users", () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    server.use(
      http.get("http://localhost:3000/users/1", () => {
        return HttpResponse.json(mockPageUser);
      })
    );

    renderWithProviders(
      // UserPage must be rendered inside a Route to get the :userId param.
      <Routes>
        <Route path="/users/:userId" element={<UserPage />} />
      </Routes>,
      { user: mockCurrentUser },
      // Use MemoryRouter to simulate being on the correct URL.
      { initialRoutes: ["/users/1"] }
    );

    const deleteButton = await screen.findByRole("button", {
      name: /delete account/i,
    });
    await userEvent.click(deleteButton);

    expect(window.confirm).toBeCalled();
    expect(mockSetIsAuthenticated).toBeCalledWith(false);
    expect(mockSetUser).toBeCalledWith(null);
    expect(mockNavigate).toBeCalledWith("/sign_up");
  });
});
