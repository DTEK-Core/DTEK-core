const INVITATION_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

export function isValidInvitationToken(token: string): boolean {
  return INVITATION_TOKEN_PATTERN.test(token);
}
