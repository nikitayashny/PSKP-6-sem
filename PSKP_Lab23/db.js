const fs = require('fs');
let phoneNumbers = require('./phoneNumbers');

function commit() {
    fs.writeFile(__dirname + '/phoneNumbers.json', JSON.stringify(phoneNumbers, null, 4), err => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}

module.exports =
{
    GetAll: () => { return phoneNumbers },

    Add(field) {
        const { name, number } = field;
        if (name && number) {
            phoneNumbers.push(
                {
                    name,
                    number
                });
            commit();
            return 1;
        }
        return 0;
    },

    Update(field) {
        const { name, number } = field;

        if (name, number) {
            let isNumber = phoneNumbers.find(phone => phone.number == number);


            isNumber.name = name;
            isNumber.number = number;

            commit();
            return 1;
        }
        return 0;
    },

    Delete(name) {
        if (name) {
            let isName = phoneNumbers.find(phone => phone.name == name);
            phoneNumbers = phoneNumbers.filter(phone => phone.name != name);
            commit();
            return 1;
        }
        return 0;
    }
};