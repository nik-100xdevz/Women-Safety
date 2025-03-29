import express from 'express';
const app = express();

import cors from 'cors'

import userRouter from './router/user.router.js';
import reportRouter from './router/report.router.js';
import commentRouter from './router/comment.router.js';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the we-safe API');
});

app.use('/api/v1/user', userRouter);
app.use('/api/v1/report', reportRouter);
app.use('/api/v1/comment', commentRouter);

export default app;