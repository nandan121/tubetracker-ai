
export default async function handler(req, res) {
  // 1. Authenticate the User
  // We check the PIN sent from the frontend against the Environment Variable
  const userPin = req.headers['x-auth-pin'];
  const serverPin = process.env.AUTH_PIN;

  // If a PIN is set in Vercel, we must enforce it.
  if (serverPin && userPin !== serverPin) {
    return res.status(401).json({ error: { message: "Invalid Access PIN" } });
  }

  // 2. Prepare the Request
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "Server Configuration Error: API_KEY is missing." } });
  }

  const { endpoint, ...queryParams } = req.query;
  
  // Whitelist allowed endpoints for security
  const allowedEndpoints = ['search', 'channels', 'playlistItems'];
  if (!allowedEndpoints.includes(endpoint)) {
    return res.status(400).json({ error: { message: "Invalid API Endpoint" } });
  }

  // 3. Call YouTube API
  // We construct the URL here on the server. The browser never sees this.
  const baseUrl = 'https://www.googleapis.com/youtube/v3';
  const queryString = new URLSearchParams({
    ...queryParams,
    key: apiKey // Inject the key securely here
  }).toString();

  try {
    const response = await fetch(`${baseUrl}/${endpoint}?${queryString}`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // 4. Return Data to Frontend
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: { message: "Internal Server Error contacting YouTube" } });
  }
}
