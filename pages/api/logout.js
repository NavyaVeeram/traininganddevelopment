export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Clear the cookie by setting Max-Age=0
    res.setHeader('Set-Cookie', 'isLoggedIn=; Path=/; HttpOnly; Max-Age=0');
    return res.status(200).json({ message: 'Logged out successfully' });
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}