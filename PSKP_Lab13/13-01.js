const { Sequelize } = require('sequelize');
const express = require('express');
const SequelizeService = require('./services.js');

const prefix = '/api';
const app = express();

const service = new SequelizeService;

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

app.use(express.json());
app.use(express.static('static'))
app.get('/', (req, res) => { res.sendFile('C:\\bstu_labs\\labs-6-sem\\pskp\\PSKP_Lab13\\static\\index.html'); });

app.get(prefix + '/faculties', (req, res) => service.getFaculties(res))
    .get(prefix + '/pulpits', (req, res) => service.getPulpits(res))
    .get(prefix + '/teachers', (req, res) => service.getTeachers(res))
    .get(prefix + '/subjects', (req, res) => service.getSubjects(res))
    .get(prefix + '/auditoriumstypes', (req, res) => service.getAuditoriumTypes(res))
    .get(prefix + '/auditoriums', (req, res) => service.getAuditoriums(res))
    .get(prefix + '/faculties/:xyz/subjects', (req, res) => service.getFacultySubjects(res, req.params['xyz']))
    .get(prefix + '/auditoriumtypes/:xyz/auditoriums', (req, res) => service.getAuditoriumTypesAuditoriums(res, req.params['xyz']))
    .get(prefix + '/auditoriumsbetween10and60', (req, res) => service.getAuditoriumsbetween10And60(res))
    .get(prefix + '/transaction', (req, res) => service.transaction(res));

app.post(prefix + '/faculties', (req, res) => service.insertFaculty(res, req.body))
    .post(prefix + '/pulpits', (req, res) => service.insertPulpit(res, req.body))
    .post(prefix + '/teachers', (req, res) => service.insertTeacher(res, req.body))
    .post(prefix + '/subjects', (req, res) => service.insertSubject(res, req.body))
    .post(prefix + '/auditoriumstypes', (req, res) => service.insertAuditoriumType(res, req.body))
    .post(prefix + '/auditoriums', (req, res) => service.insertAuditorium(res, req.body));

app.put(prefix + '/faculties', (req, res) => service.updateFaculty(res, req.body))
    .put(prefix + '/pulpits', (req, res) => service.updatePulpit(res, req.body))
    .put(prefix + '/teachers', (req, res) => service.updateTeacher(res, req.body))
    .put(prefix + '/subjects', (req, res) => service.updateSubject(res, req.body))
    .put(prefix + '/auditoriumstypes', (req, res) => service.updateAuditoriumType(res, req.body))
    .put(prefix + '/auditoriums', (req, res) => service.updateAuditorium(res, req.body));

app.delete(prefix + '/faculties/:faculty', (req, res) => service.deleteFaculty(res, req.params['faculty']))
    .delete(prefix + '/pulpits/:pulpit', (req, res) => service.deletePulpit(res, req.params['pulpit']))
    .delete(prefix + '/subjects/:subject', (req, res) => service.deleteSubject(res, req.params['subject']))
    .delete(prefix + '/teachers/:teacher', (req, res) => service.deleteTeacher(res, req.params['teacher']))
    .delete(prefix + '/auditoriumtypes/:type', (req, res) => service.deleteAuditoriumType(res, req.params['type']))
    .delete(prefix + '/auditoriums/:auditorium', (req, res) => service.deleteAuditorium(res, req.params['auditorium']));

sequelize.authenticate()
    .then(() => { console.log('[OK] Connected to database.\n'); })
    .catch(err => {
        console.log('[ERROR] Sequelize: ', err);
        sequelize.close();
    });

app.listen(3000);