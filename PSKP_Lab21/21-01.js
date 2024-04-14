const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 5000;


import('webdav')
    .then(webdav => {
        const { createClient, AuthType } = webdav;

        const Error408 = (res, message) => res.status(408).send(`[ERROR] 408: ${message}`);
        const Error404 = (res, message) => res.status(404).send(`[ERROR] 404: ${message}`);

        const client = createClient('https://webdav.yandex.ru', {
            username: 'nikitayashniy',  
            password: 'vqkpgfieqgflahrh',
        });

        app.post('/md/:name', (req, res) => {
            const nameFile = `/${req.params.name}`;
            client.exists(nameFile).then(result => {
                if (!result) {
                    client.createDirectory(nameFile);
                    res.status(200).send('[OK] Directory succesfully created.');
                }
                else
                    Error408(res, `Failed to create folder with name = ${req.params.name}.`);
            });
        });


        app.post('/rd/:name', (req, res) => {
            const nameFile = `/${req.params.name}`;
            client.exists(nameFile).then(result => {
                if (result) {
                    client.deleteFile(nameFile);
                    res.status(200).send('[OK] Directory succesfully deleted.');
                }
                else
                    Error404(res, `There is no directory with name = ${req.params.name}.`);
            });
        });


        app.post('/up/:name', (req, res) => {
            try {
                const filePath = req.params.name;

                if (!fs.existsSync(filePath)) {
                    Error404(res, `There is no file with name = ${req.params.name}.`);
                    return;
                }

                let rs = fs.createReadStream(filePath);
                let ws = client.createWriteStream(req.params.name);
                rs.pipe(ws);
                res.status(200).send('[OK] File uploaded successfully.');
            }
            catch (err) {
                Error408(res, `Cannot upload file: ${err.message}.`);
            }
        });


        app.post('/down/:name', (req, res) => {
            const filePath = '/' + req.params.name;
            client
                .exists(filePath)
                .then(alreadyExists => {
                    if (alreadyExists) {
                        let rs = client.createReadStream(filePath);
                        let ws = fs.createWriteStream(Date.now() + req.params.name);
                        rs.pipe(ws);
                        rs.pipe(res);
                    }
                    else
                        Error404(res, `There is no file with name = ${req.params.name}.`);
                })
                .then(message => (message ? res.json(message) : null))
                .catch(err => { Error404(res, err.message); });
        });


        app.post('/del/:name', (req, res) => {
            const nameFile = req.params.name;
            client.exists(nameFile).then(result => {
                if (result) {
                    client.deleteFile(nameFile);
                    res.status(200).send('[OK] File deleted successfully.');
                }
                else
                    Error404(res, `There is no file with name = ${req.params.name}.`);
            });
        });


        app.post('/copy/:from/:to', (req, res) => {
            const nameFrom = req.params.from;
            const nameTo = `${req.params.to}`;
            client
                .exists(nameFrom)
                .then(result => {
                    if (result) {
                        client.copyFile(nameFrom, nameTo);
                        res.status(200).send('[OK] File copied successfully.');
                    }
                    else
                        Error404(res, `There is no file with name = ${req.params.from}.`);
                })
                .catch(err => Error408(res, err.message));
        });


        app.post('/move/:from/:to', (req, res) => {
            const nameFrom = req.params.from;
            const nameTo = req.params.to;
            client
                .exists(nameFrom)
                .then(result => {
                    if (result) {
                        client.moveFile(nameFrom, nameTo);
                        res.status(200).send('[OK] File moved successfully.');
                    }
                    else
                        Error404(res, `There is no file with name = ${req.params.from}.`);
                })
                .catch(err => Error408(res, err.message));
        });


        app.listen(PORT, () => console.log(`[OK] Server running at localhost:${PORT}/\n`));
    })
    .catch(err => console.error('[ERROR] WebDAV: ', err.message));