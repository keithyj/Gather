import { describe, expect, it } from "vitest";
import { confirmationErrorKind, signInErrorMessage, signUpErrorMessage } from "./auth-errors";

describe("authentication error copy", () => {
  it("explains confirmation delivery restrictions and rate limits", () => {
    expect(signUpErrorMessage({ code: "email_address_not_authorized" })).toContain(
      "configure hosted email delivery"
    );
    expect(signUpErrorMessage({ code: "over_email_send_rate_limit" })).toContain("Wait a while");
  });

  it("distinguishes unconfirmed accounts without enabling email enumeration", () => {
    expect(signInErrorMessage({ code: "email_not_confirmed" }, false)).toContain("Confirm your email");
    expect(signInErrorMessage({ code: "invalid_credentials" }, false)).toContain("email address or password");
    expect(signInErrorMessage({ code: "invalid_credentials" }, true)).toContain("username or password");
  });

  it("classifies expired and browser-mismatched confirmation callbacks", () => {
    expect(confirmationErrorKind("otp_expired")).toBe("confirmation_expired");
    expect(confirmationErrorKind("flow_state_expired")).toBe("confirmation_expired");
    expect(confirmationErrorKind("bad_code_verifier")).toBe("confirmation_browser_mismatch");
    expect(confirmationErrorKind("unexpected_failure")).toBe("confirmation_unavailable");
  });
});
