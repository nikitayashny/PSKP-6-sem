const { Sequelize, Op} = require('sequelize');

const sequelize = new Sequelize('UNIVER', 'sa', '1234',
{
    dialect: 'mssql', 
    pool: {
        max:5, 
        min:0, 
        acquire:30000, 
        idle:10000
    }
});

const teacher = sequelize.define(
    'teacher',
    {
        teacher: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        teacher_name: { type: Sequelize.STRING, allowNull: false }
    },
    {
        sequelize,
        tableName: 'teacher',
        timestamps: false
    }
);

const subject = sequelize.define(
    'subject',
    {
        subject: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        subject_name: { type: Sequelize.STRING, allowNull: false }
    },
    {
        sequelize,
        tableName: 'subject',
        timestamps: false
    }
);

const pulpit = sequelize.define(
    'pulpit',
    {
        pulpit: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        pulpit_name: { type: Sequelize.STRING, allowNull: false },
    },
    {
        sequelize,
        tableName: 'pulpit',
        timestamps: false
    }
);

pulpit.hasMany(teacher, {
    foreignKey: 'pulpit',
    sourceKey: 'pulpit'
});

pulpit.hasMany(subject, {
    foreignKey: 'pulpit',
    sourceKey: 'pulpit'
});

const faculty = sequelize.define(
    'faculty',
    {
        faculty: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        faculty_name: { type: Sequelize.STRING, allowNull: false }
    },
    {
        sequelize,
        tableName: 'faculty',
        timestamps: false,
        hooks: {
            beforeCreate: (fac) => { console.log('Data to insert: ', fac.dataValues); },
            afterCreate: (fac) => { console.log('Inserted data:  ', fac.dataValues); },
            beforeDestroy: () => { console.log('beforeDestroy hook:  '); }
        }
    }
);

faculty.hasMany(pulpit, {
    foreignKey: 'faculty',
    sourceKey: 'faculty'
});

const auditorium = sequelize.define(
    'auditorium',
    {
        auditorium: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        auditorium_name: { type: Sequelize.STRING, allowNull: false },
        auditorium_capacity: { type: Sequelize.INTEGER, allowNull: false }
    },
    {
        sequelize,
        tableName: 'auditorium',
        timestamps: false,
        scopes: {
            between10And60: {
                where: { auditorium_capacity: { [Op.between]: [10, 60] } }
            }
        }
    }
);

const auditorium_type = sequelize.define(
    'auditorium_type',
    {
        auditorium_type: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        auditorium_typename: { type: Sequelize.STRING, allowNull: false }
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'auditorium_type'
    }
);

auditorium_type.hasMany(auditorium, {
    foreignKey: 'auditorium_type',
    sourceKey: 'auditorium_type'
})

module.exports = {
    faculty,
    pulpit,
    subject,
    teacher,
    auditorium_type,
    auditorium
};