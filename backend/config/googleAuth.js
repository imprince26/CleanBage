import { OAuth2Client } from 'google-oauth2-client';
import dotenv from 'dotenv';

dotenv.config();

// Create OAuth client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate Google OAuth URL
export const getGoogleAuthURL = () => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  });
};

// Get Google user profile
export const getGoogleUser = async (code) => {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Get user info
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    }
  );

  const data = await response.json();
  return data;
};

export default { getGoogleAuthURL, getGoogleUser };