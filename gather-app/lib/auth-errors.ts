export type AuthErrorLike = { code?: string; status?: number } | null;

export function signUpErrorMessage(error: AuthErrorLike) {
  switch (error?.code) {
    case "email_address_not_authorized":
      return "This Supabase project cannot send confirmation emails to that address yet. The project owner must configure hosted email delivery.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many confirmation emails have been requested. Wait a while before trying again.";
    case "weak_password":
      return "Choose a stronger password and try again.";
    case "email_provider_disabled":
    case "signup_disabled":
      return "New email accounts are temporarily unavailable.";
    default:
      return "We couldn’t create that account. Try another username, or sign in if you already have an account.";
  }
}

export function signInErrorMessage(error: AuthErrorLike, usedUsername: boolean) {
  switch (error?.code) {
    case "email_not_confirmed":
      return "Confirm your email before signing in. Check your inbox and spam folder.";
    case "over_request_rate_limit":
      return "Too many sign-in attempts. Wait a few minutes before trying again.";
    case "unexpected_failure":
      return "Authentication is temporarily unavailable. Please try again shortly.";
    case "invalid_credentials":
    case "user_not_found":
    default:
      return usedUsername
        ? "That username or password is not recognised."
        : "That email address or password is not recognised.";
  }
}

export function confirmationErrorKind(code: string | undefined) {
  if (code === "otp_expired" || code === "flow_state_expired") return "confirmation_expired";
  if (code === "bad_code_verifier" || code === "flow_state_not_found") return "confirmation_browser_mismatch";
  return "confirmation_unavailable";
}
