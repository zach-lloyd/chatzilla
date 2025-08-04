import { render, screen, within, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../setupTests";
import { MessengerContext } from "../components/MessengerContext";
import RoomPage from "./RoomPage";

const mockUnsubscribe = vi.fn();
// This ensures that the mocked create method below returns a fake subscription
// object. Without this, it will return undefined and Test 5 will fail.
const mockSubscriptionsCreate = vi.fn().mockReturnValue({
  unsubscribe: mockUnsubscribe,
});

vi.spyOn(window, "confirm").mockReturnValue(true);
// Need to mock the entire ../services/cable module. Replace the real getConsumer
// fn. with a fake one that returns a mock consumer object.
vi.mock("../services/cable", () => ({
  getConsumer: () => ({
    subscriptions: {
      create: mockSubscriptionsCreate,
    },
  }),
  disconnectConsumer: vi.fn(),
}));

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
        ...providerProps,
      }}
    >
      <MemoryRouter initialEntries={routerProps.initialRoutes}>
        {component}
      </MemoryRouter>
    </MessengerContext.Provider>
  );
};

describe("RoomPage", () => {
  // Test 1: Loading screen and room display.
  test("successful GET request displays loading screen then room page", async () => {
    const mockCurrentUser = {
      id: 1,
      username: "tester",
      presence: true,
    };

    const mockRoomData = {
      id: 101,
      name: "Test Room",
      description: "A room for testing.",
      public: true,
      users: [mockCurrentUser],
      messages: [{ id: 1, body: "Hello world", user: { username: "tester" } }],
    };

    server.use(
      http.get("http://localhost:3000/rooms/101", () => {
        return HttpResponse.json(mockRoomData);
      })
    );

    renderWithProviders(
      <Routes>
        <Route path="/rooms/:roomId" element={<RoomPage />} />
      </Routes>,
      { user: mockCurrentUser },
      { initialRoutes: ["/rooms/101"] }
    );

    expect(screen.getByText("Loading room...")).toBeInTheDocument();

    const roomName = await screen.findByRole("heading", { name: "Test Room" });
    expect(roomName).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  // Test 2: Error message.
  test("unsuccessful GET request displays error message", async () => {
    const mockCurrentUser = {
      id: 1,
      username: "tester",
      presence: true,
    };

    const mockRoomData = {
      id: 101,
      name: "Test Room",
      description: "A room for testing.",
      public: true,
      users: [mockCurrentUser],
      messages: [{ id: 1, body: "Hello world", user: { username: "tester" } }],
    };

    const mockError = { error: "Error." };

    server.use(
      http.get("http://localhost:3000/rooms/101", () => {
        return HttpResponse.json(mockError, { status: 500 });
      })
    );

    renderWithProviders(
      <Routes>
        <Route path="/rooms/:roomId" element={<RoomPage />} />
      </Routes>,
      { user: mockCurrentUser },
      { initialRoutes: ["/rooms/101"] }
    );

    const errorMessage = await screen.findByText(/error./i);
    expect(errorMessage).toBeInTheDocument();
  });

  // Test 3: Test Join Room button.
  test("'Join Room' button displays for non-member and works correctly", async () => {
    const mockCurrentUser = {
      id: 1,
      username: "tester",
      presence: true,
    };

    const mockRoomDataNotMember = {
      id: 101,
      name: "Test Room",
      description: "A room for testing.",
      public: true,
      users: [],
      messages: [],
    };

    server.use(
      http.get(
        "http://localhost:3000/rooms/101",
        () => HttpResponse.json(mockRoomDataNotMember),
        { once: true }
      )
    );

    renderWithProviders(
      <Routes>
        <Route path="/rooms/:roomId" element={<RoomPage />} />
      </Routes>,
      { user: mockCurrentUser },
      { initialRoutes: ["/rooms/101"] }
    );

    const joinButton = await screen.findByRole("button", {
      name: /join room/i,
    });

    expect(joinButton).toBeInTheDocument();
  });

  // Test 4: Leave Room button.
  test("'Leave Room' button displays and works correctly", async () => {
    const mockCurrentUser = {
      id: 1,
      username: "tester",
      presence: true,
    };

    const mockRoomData = {
      id: 101,
      name: "Test Room",
      description: "A room for testing.",
      public: true,
      users: [mockCurrentUser],
      messages: [],
    };

    server.use(
      http.get("http://localhost:3000/rooms/101", () => {
        return HttpResponse.json(mockRoomData);
      })
    );

    renderWithProviders(
      <Routes>
        <Route path="/rooms/:roomId" element={<RoomPage />} />
      </Routes>,
      { user: mockCurrentUser },
      { initialRoutes: ["/rooms/101"] }
    );

    const leaveButton = await screen.findByRole("button", {
      name: /leave room/i,
    });
    expect(leaveButton).toBeInTheDocument();

    await userEvent.click(leaveButton);
    expect(window.confirm).toBeCalled();
  });

  // Test 5: Test channel subscriptions.
  test("attempts to subscribe to RoomChannel and PresenceChannel on mount", () => {
    const mockCurrentUser = {
      id: 1,
      username: "tester",
      presence: true,
    };

    const mockRoomData = {
      id: 101,
      name: "Test Room",
      description: "A room for testing.",
      public: true,
      users: [mockCurrentUser],
      messages: [],
    };

    server.use(
      http.get("http://localhost:3000/rooms/101", () => {
        return HttpResponse.json(mockRoomData);
      })
    );

    renderWithProviders(
      <Routes>
        <Route path="/rooms/:roomId" element={<RoomPage />} />
      </Routes>,
      { user: mockCurrentUser },
      { initialRoutes: ["/rooms/101"] }
    );

    expect(mockSubscriptionsCreate).toHaveBeenCalledWith(
      { channel: "RoomChannel", room_id: "101" },
      expect.any(Object)
    );

    expect(mockSubscriptionsCreate).toHaveBeenCalledWith(
      { channel: "PresenceChannel" },
      expect.any(Object)
    );
  });

  // Test 6: Presence Channel updates.
  test("PresenceChannel updates online/offline members", async () => {
    const mockCurrentUser = {
      id: 1,
      username: "tester",
      presence: false,
    };

    const mockUser2 = {
      id: 2,
      username: "tester2",
      presence: false,
    };

    const mockRoomData = {
      id: 101,
      name: "Test Room",
      description: "A room for testing.",
      public: true,
      users: [mockCurrentUser, mockUser2],
      messages: [],
    };

    server.use(
      http.get("http://localhost:3000/rooms/101", () => {
        return HttpResponse.json(mockRoomData);
      })
    );

    renderWithProviders(
      <Routes>
        <Route path="/rooms/:roomId" element={<RoomPage />} />
      </Routes>,
      { user: mockCurrentUser },
      { initialRoutes: ["/rooms/101"] }
    );

    // Wait for the initial page load.
    await screen.findByRole("heading", { name: "Test Room" });
    const offlineList = screen
      .getByRole("heading", { name: /offline/i })
      .closest("div");
    expect(within(offlineList).getByText("tester")).toBeInTheDocument();
    expect(within(offlineList).getByText("tester2")).toBeInTheDocument();

    // Find the specific call to subscriptions.create for the PresenceChannel.
    const presenceChannelCall = mockSubscriptionsCreate.mock.calls.find(
      (call) => call[0].channel === "PresenceChannel"
    );
    // Extract the callbacks object (the second argument).
    const presenceChannelCallbacks = presenceChannelCall[1];

    // Manually trigger the 'received' function with mock data.
    act(() => {
      // Simulate tester2 coming online.
      presenceChannelCallbacks.received({ online_user_ids: [2] });
    });

    const onlineList = screen
      .getByRole("heading", { name: /online/i })
      .closest("div");
    expect(within(onlineList).getByText("tester2")).toBeInTheDocument();
    expect(within(offlineList).getByText("tester")).toBeInTheDocument();
  });
});
