import express from "express";
import * as dotenv from 'dotenv';

//Load environment variables
dotenv.config();

// Express app
const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(req.path, req.method);
});

// Listen for requests
app.listen(process.env.PORT, () => console.log(`Server started on port http://localhost:${process.env.PORT}/`));

app.get('/', (req, res) => {
    res.json({
        msg: 'Welcome to the app'
    })
});