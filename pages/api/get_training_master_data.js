export default async function handler(req, res) {
    if (req.method === 'GET') {
      const { Program_Id } = req.query;
  
      if (!Program_Id) {
        return res.status(400).json({ error: 'Program_Id is required' });
      }
  
      try {
        // Fetch the training data from Prisma (assuming it's already in the database)
        const trainingData = await prisma.trainingData_Master.findUnique({
          where: {
            Program_Id: parseInt(Program_Id),
          },
        });
  
        if (!trainingData) {
          return res.status(404).json({ error: 'Training data not found' });
        }
  
        // Return the training data
        res.status(200).json(trainingData);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }