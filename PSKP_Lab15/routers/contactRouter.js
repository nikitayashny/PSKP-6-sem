const express = require('express');
const contactRouter = express.Router();
const contactController = require('../controllers/contactController');

contactRouter.get('/', contactController.getAllContacts);
contactRouter.get('/id', contactController.getContact);

contactRouter.get('/add', contactController.addContactGet);
contactRouter.post('/add', contactController.addContactPost);

contactRouter.get('/update', contactController.editContactGet);
contactRouter.post('/update', contactController.editContactPost);

contactRouter.post('/delete', contactController.deleteContact);

module.exports = contactRouter;