import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import circuitRoutes from './routes/circuits';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar límite para circuitos grandes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/circuits', circuitRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend simulador op-amp funcionando.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
