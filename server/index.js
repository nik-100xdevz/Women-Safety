import app from './app.js';
import connectDB from './db/db.js';
import { config } from 'dotenv';

const PORT = config.port || 5000;

connectDB().then(()=>{
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((e)=>{
  console.log("error",e)
})
