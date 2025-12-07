export default async function handler(req, res) {
  // Simple endpoint just for PIN validation
  // This prevents loading full YouTube data when just validating PIN

  // Check if this is a validation request
  if (req.method !== 'GET') {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  // Get the PIN from headers
  const userPin = req.headers['x-auth-pin'];
  const serverPin = process.env.AUTH_PIN;

  // If a PIN is set in Vercel, we must enforce it
  if (serverPin && userPin !== serverPin) {
    return res.status(401).json({ error: { message: "Invalid Access PIN" } });
  }

  // If no server PIN is set, or if PINs match, validation succeeds
  return res.status(200).json({ success: true, message: "PIN validation successful" });
}