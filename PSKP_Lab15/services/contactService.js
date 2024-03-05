const fs = require('fs');
const uuid = require('uuid');
const contacts = require('../contacts') || [];

const getAllContacts = async () => await contacts;

const getContact = async id => {
    const contact = await contacts.find(c => c.id === id);
    return contact ? contact : 'Not found'
};

const addContact = async data => {
    contacts.push({
        id: uuid.v4(),
        name: data.name,
        phone: data.phone
    });
    saveToFile();
    return contacts;
};

const editContact = async (id, data) => {
    const contact = await contacts.find(c => c.id === id);
    if (contact) {
        contact.name = data.name;
        contact.phone = data.phone;
    }
    saveToFile();
    return contacts;
};

const deleteContact = async id => {
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
        contacts.splice(index, 1);
    }
    await saveToFile();
    return contacts;
};

const saveToFile = async () => {
    try { await fs.promises.writeFile('./contacts.json', JSON.stringify(contacts, null, 4)); }
    catch (err) { console.log(err); }
}

module.exports = {
    getAllContacts,
    getContact,
    addContact,
    editContact,
    deleteContact
};