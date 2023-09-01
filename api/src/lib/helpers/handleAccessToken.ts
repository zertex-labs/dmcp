export function handleAccessToken(token: string | undefined): {
  ok: boolean;
  message?: string;
} {
  // let token = socket.handshake.headers.authorization;
  if (!token) {
    return { ok: false, message: 'Unauthorized. WS access token is required' };
  }

  token = token.replace(/\s/g, '');
  if (token !== process.env.WS_ACCESS_TOKEN) {
    return { ok: false, message: 'Unauthorized. WS access token is invalid' };
  }

  return { ok: true };
}

export default handleAccessToken;
