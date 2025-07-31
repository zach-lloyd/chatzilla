import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../setupTests";
import { MessengerContext } from "./MessengerContext";
import CreateRoomForm from "./CreateRoomForm";

// Mock context values.
const mockOnClose = vi.fn();
const mockHidePanel = vi.fn();

// Because this component uses useNavigate, I need to mock it.
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// It also uses the browser's alert() function, so need to mock that too.
vi.spyOn(window, "alert").mockImplementation(() => {});

// A helper to render the component with all necessary providers.
const renderWithProviders = (component) => {
  return render(
    <MessengerContext.Provider
      value={{
        BASE_URL: "http://localhost:3000",
        mockOnClose: mockOnClose,
        mockHidePanel: mockHidePanel,
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

describe("CreateRoomForm Component", () => {
  // Test 1: Form successfully renders.
  test("form for creating a room successfully renders", async () => {
    renderWithProviders(
      <CreateRoomForm onClose={mockOnClose} hidePanel={mockHidePanel} />
    );

    const roomName = await screen.findByPlaceholderText("Name your room...");
    expect(roomName).toBeInTheDocument();

    const description = await screen.findByPlaceholderText(
      "Describe your room..."
    );
    expect(description).toBeInTheDocument();

    const checkbox = await screen.findByLabelText("Public");
    expect(checkbox).toBeChecked();

    expect(
      screen.getByRole("button", { name: /create room/i })
    ).toBeInTheDocument();
  });

  // Test 2: Test room creation.
  test("user can successfully create a room", async () => {
    const mockRoom = { id: 1, name: "Test Room" };

    server.use(
      http.post("http://localhost:3000/rooms", () => {
        return HttpResponse.json(mockRoom, { status: 201 });
      })
    );

    renderWithProviders(
      <CreateRoomForm onClose={mockOnClose} hidePanel={mockHidePanel} />
    );

    await userEvent.type(
      screen.getByPlaceholderText("Name your room..."),
      "Test Room"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Describe your room..."),
      "This is a fake room for testing purposes."
    );

    await userEvent.click(screen.getByRole("button", { name: /create room/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/rooms/1");
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockHidePanel).toHaveBeenCalled();
  });

  // Test 3: Test room creation.
  test("user can successfully create a room", async () => {
    const mockRoom = { id: 1, name: "Test Room" };

    server.use(
      http.post("http://localhost:3000/rooms", () => {
        return HttpResponse.json(mockRoom, { status: 201 });
      })
    );

    renderWithProviders(
      <CreateRoomForm onClose={mockOnClose} hidePanel={mockHidePanel} />
    );

    await userEvent.type(
      screen.getByPlaceholderText("Name your room..."),
      "Test Room"
    );

    await userEvent.type(
      screen.getByPlaceholderText("Describe your room..."),
      "This is a fake room for testing purposes."
    );

    await userEvent.click(screen.getByRole("button", { name: /create room/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/rooms/1");
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockHidePanel).toHaveBeenCalled();
  });
});
