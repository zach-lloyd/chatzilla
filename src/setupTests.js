import "@testing-library/jest-dom";
import { http, HttpResponse } from "msw";

// I'm using an Offcanvas component from React-Bootstrap for the NavPanel.
// This component checks the screen size by calling a browser function called
// window.matchMedia. To effectively test the NavPanel, I need to mock this
// function, which is the purpose of the below code.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { setupServer } from "msw/node";

// Includes a default handler for certain routes to silence warning about lack
// of a matching request handler. If a test needs to access the actual room list,
// I will need to override this using server.use().
export const server = setupServer(
  http.get("http://localhost:3000/rooms", () => {
    return HttpResponse.json([]);
  }),
  http.get("http://localhost:3000/users", () => {
    return HttpResponse.json([]);
  }),
  http.delete("http://localhost:3000/rooms/101/membership", () => {
    return HttpResponse.json([]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
