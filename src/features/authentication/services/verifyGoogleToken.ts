import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../../../config/env";

const client = new OAuth2Client(GOOGLE_CLIENT_ID as string);

export async function verifyGoogleToken(token: string) {
  console.log("Verifying Google token:", token);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID as string,
  });

  const payload = ticket.getPayload();

  return payload;
}