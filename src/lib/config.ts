// New accounts can't sign in until an Executive (or Super Admin / Faculty Advisor) approves them,
// and deactivated accounts lose access. Set to false to let new sign-ups in immediately.
export const REQUIRE_APPROVAL = true;

// The current committee's tenure ends at the end of this day (India time). Shown as a
// countdown to every member; update it for each new tenure.
export const TENURE_END = "2027-03-15T23:59:59+05:30";
export const TENURE_END_LABEL = "15 March 2027";
