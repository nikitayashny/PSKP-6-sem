const contactService = require('../services/contactService');

module.exports = {

    async getAllContacts(req, res) {
        try {
            const contacts = await contactService.getAllContacts();
            res.render('contacts', {
                buttonsEnabled: true,
                contacts: contacts
            });
        } catch (err) { console.log(err); }
    },

    async getContact(req, res) {
        try {
            if (req.query.id) {
                const contact = await contactService.getContact(req.query.id);
                res.json(contact);
            } else {
                res.end('Parameter not found');
            }
        } catch (err) { console.log(err); }
    },

    async addContactPost(req, res) {
        if (req.body.name && req.body.phone) {
            await contactService.addContact(req.body)
                .then(result => res.json(result))
                .catch(err => console.error(err.message));
        } else {
            res.end('Parameters not found');
        }
    },

    async addContactGet(req, res) {
        let contacts = [];
        contacts = await contactService.getAllContacts();
        res.render('newContact', {
            buttonsEnabled: false,
            contacts: contacts
        });
    },

    async editContactPost(req, res) {
        if (req.query.id && req.body.name && req.body.phone) {
            await contactService.editContact(req.query.id, req.body)
                .then(result => res.json(result))
                .catch(err => console.error(err.message));
        } else {
            res.end('Parameters not found');
        }
    },

    async editContactGet(req, res) {
        let contacts = [], contact;
        contacts = await contactService.getAllContacts();
        contact = await contactService.getContact(req.query.id);
        res.render('editContact', {
            buttonsEnabled: false,
            contacts: contacts,
            thisContact: contact
        });
    },

    async deleteContact(req, res) {
        if (req.query.id) {
            await contactService.deleteContact(req.query.id)
                .then(result => res.json(result))
                .catch(err => console.error(err.message));
        } else {
            res.end('Parameters not found');
        }
    }
};