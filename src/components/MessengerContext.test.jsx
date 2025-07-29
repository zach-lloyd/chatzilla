import { processErrors } from "./MessengerContext.jsx";

describe("processErrors function", () => {
  test("handles standard Rails validation errors", () => {
    const errorData = { errors: { email: ["has already been taken"] } };
    const expected = ["email has already been taken"];
    expect(processErrors(errorData)).toEqual(expected);
  });

  test("handles simple string errors from Devise", () => {
    const errorData = { error: "Invalid Email or password." };
    const expected = ["Invalid Email or password."];
    expect(processErrors(errorData)).toEqual(expected);
  });

  test("handles the specific nested profanity error format", () => {
    const errorData = {
      status: {
        errors: ["Username contains inappropriate language."],
      },
    };
    const expected = ["Username contains inappropriate language."];
    expect(processErrors(errorData)).toEqual(expected);
  });

  test("returns a generic message for unexpected error formats", () => {
    expect(processErrors({})).toEqual([
      "Sign-in failed. Please check your credentials.",
    ]);

    expect(processErrors(null)).toEqual([
      "Sign-in failed. Please check your credentials.",
    ]);

    const weirdError = { data: { code: 500, message: "Server error" } };
    expect(processErrors(weirdError)).toEqual([
      "Sign-in failed. Please check your credentials.",
    ]);
  });

  test("handles a string value for a validation error", () => {
    const errorData = { errors: { password: "is too short" } };
    const expected = ["password is too short"];
    expect(processErrors(errorData)).toEqual(expected);
  });
});
