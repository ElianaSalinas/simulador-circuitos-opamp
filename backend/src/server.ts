import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'CircuitSim Op-Amp Backend running.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
