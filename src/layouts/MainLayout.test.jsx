import MainLayout from "./MainLayout";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { server } from "../setupTests";
import { MessengerContext } from "../components/MessengerContext";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const mockSetUser = vi.fn();
const mockSetIsAuthenticated = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

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

describe("MainLayout", () => {
  // Test 1: Logged in user.
  test("renders correctly for logged in user", async () => {
    const mockCurrentUser = {
      id: 1,
      username: "tester",
      email: "tester@gmail.com",
      presence: true,
    };

    const MockHomePage = () => <div>Home Page Content</div>;

    renderWithProviders(
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<MockHomePage />} />
        </Route>
      </Routes>,
      { user: mockCurrentUser },
      { initialRoutes: ["/"] }
    );

    expect(screen.getByText(/logged in as:/i)).toBeInTheDocument();
    expect(screen.getByText(/tester/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /log out/i })
    ).toBeInTheDocument();
  });

  // Test 2: Missing user.
  test("renders correct message when user is missing", async () => {
    const MockHomePage = () => <div>Home Page Content</div>;

    renderWithProviders(
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<MockHomePage />} />
        </Route>
      </Routes>,
      { user: null },
      { initialRoutes: ["/"] }
    );

    expect(screen.getByText(/user or email missing/i)).toBeInTheDocument();
  });

  // Test 3: Test log out button.
  test("log out button works correctly", async () => {
    const mockCurrentUser = {
      id: 1,
      username: "tester",
      email: "tester@gmail.com",
      presence: true,
    };

    const MockHomePage = () => <div>Home Page Content</div>;

    server.use(
      http.delete("http://localhost:3000/users/sign_out", () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderWithProviders(
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<MockHomePage />} />
        </Route>
      </Routes>,
      { user: mockCurrentUser },
      { initialRoutes: ["/"] }
    );

    const logOutButton = await screen.findByRole("button", {
      name: /log out/i,
    });
    await userEvent.click(logOutButton);

    expect(mockSetUser).toBeCalledWith(null);
    expect(mockSetIsAuthenticated).toBeCalledWith(false);
  });
});
