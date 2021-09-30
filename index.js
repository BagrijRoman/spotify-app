const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello world!')
});

const PORT = 8888;

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`)
})