import { render, screen } from "@testing-library/react";
import Logo from "./Logo";

// The Logo component is very brief so requires very little testing, but the
// below short test just confirms that the logo's alt text is rendering correctly
// for screen readers.
test("renders the logo with correct alt text", () => {
  render(<Logo />);

  // Find the image by its accessibility role and name.
  const logoImage = screen.getByRole("img", { name: /cartoon monster/i });

  expect(logoImage).toBeInTheDocument();
});
