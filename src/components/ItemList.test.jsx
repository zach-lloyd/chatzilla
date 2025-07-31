import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MessengerContext } from "./MessengerContext";
import { http, HttpResponse } from "msw";
import { server } from "../setupTests";
import ItemList from "./ItemList";

const renderWithProviders = (component, providerProps = {}) => {
  return render(
    <MessengerContext.Provider
      // Merge default mock values with any custom props for the test.
      value={{
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

describe("ItemList Component", () => {
  // Test 1: Test 'Loading...' message.
  test("Verify 'Loading...' statement appears when the component renders", () => {
    renderWithProviders(<ItemList type="rooms" />);

    expect(screen.getByText("Loading rooms...")).toBeInTheDocument();
  });

  // Test 2: Test room list.
  test("Verify room list is displayed after a successful API call", async () => {
    const mockRooms = [
      { id: 1, name: "General" },
      { id: 2, name: "Random" },
    ];

    server.use(
      http.get("http://localhost:3000/rooms", () => {
        return HttpResponse.json(mockRooms, { status: 200 });
      })
    );
    renderWithProviders(<ItemList type="rooms" />);

    const firstRoom = await screen.findByText("General");
    expect(firstRoom).toBeInTheDocument();

    const secondRoom = await screen.findByText("Random");
    expect(secondRoom).toBeInTheDocument();
  });

  // Test 3: Test user list.
  test("Verify user list is displayed after a successful API call", async () => {
    const mockUsers = [
      { username: "tester", presence: true },
      { username: "tester2", presence: true },
    ];

    server.use(
      http.get("http://localhost:3000/users", () => {
        return HttpResponse.json(mockUsers, { status: 200 });
      })
    );
    renderWithProviders(<ItemList type="users" />);

    const firstUser = await screen.findByText("tester");
    expect(firstUser).toBeInTheDocument();

    const secondUser = await screen.findByText("tester2");
    expect(secondUser).toBeInTheDocument();
  });

  // Test 4: Test error message.
  test("Verify error message is displayed after an unsuccessful API call", async () => {
    const mockError = { error: "Failed to fetch rooms." };

    server.use(
      http.get("http://localhost:3000/rooms", () => {
        return HttpResponse.json(mockError, { status: 401 });
      })
    );
    renderWithProviders(<ItemList type="rooms" />);

    const errorMessage = await screen.findByText(/failed to fetch rooms/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
