const express = require('express');
const bodyParser = require('body-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.js');
const DB = require('./db.js');

const PORT = 5000;
const app = express();

app.use(bodyParser.json());
app.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get('/ts', (req, res) => {
    res.end(JSON.stringify(DB.GetAll(), null, 4));
});

app.post('/ts', (req, res) => {
    if (DB.Add(req.body))
        res.json({ message: '[OK] Succesfully added phonebook.' });
    else
        res.status(400).json({ message: '[ERROR] 400: [ERROR] 400: Invalid parameters..' });

});

app.put('/ts', async (req, res) => {
    if (DB.Update(req.body))
        res.json({ message: '[OK] Succesfully updated phonebook.' });
    else
        res.status(400).json({ message: '[ERROR] 400: Invalid parameters.' });

});

app.delete('/ts', (req, res) => {
    if (DB.Delete(req.query.name))
        res.json({ message: '[OK] Succesfully deleted phonebook.' });
    else
        res.status(400).json({ message: '[ERROR] 400: Invalid parameters.' });

});

app.listen(PORT, () => console.log(`[OK] Server running at localhost:${PORT}/\n`));