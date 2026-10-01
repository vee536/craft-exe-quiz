import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import questionsRouter from './routes/questions.js';
import eventsRouter from './routes/events.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/questions', questionsRouter);
app.use('/api/events', eventsRouter);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n🟢 CRAFT.exe API Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
