import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { EmployeeId, Password } = req.body;

    if (!EmployeeId || !Password) {
      return res.status(400).json({ message: 'EmployeeId and Password are required.' });
    }

    try {
      // Call external API for authentication
      const response = await fetch('http://10.40.20.93:300/api/Login/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ EmployeeId, Password }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        // Normalize the success message for frontend compatibility
        const normalizedData = {
          ...data,
          message: "Login Successful"
        };
        return res.status(200).json(normalizedData);
      } else {
        console.error('External API login failed:', data);
        return res.status(response.status).json(data);
      }
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
