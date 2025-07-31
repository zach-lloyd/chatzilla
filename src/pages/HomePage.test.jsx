import { render, screen } from "@testing-library/react";
import HomePage from "./HomePage";

// Brief test to confirm that the welcome message is correctly rendered on the
// home page.
test("renders the welcome heading", () => {
  render(<HomePage />);

  const headingElement = screen.getByRole("heading", {
    name: /welcome! open the sidebar and join some rooms!/i,
  });

  expect(headingElement).toBeInTheDocument();
});
