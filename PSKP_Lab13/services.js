const { Sequelize, Op, Transaction } = require('sequelize');

const {
    faculty,
    pulpit,
    subject,
    teacher,
    auditorium_type,
    auditorium
  } = require('./models/models.js');

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

class SequelizeService {

    // ==================================  SELECT  ================================

    getFaculties = async res => { res.json(await faculty.findAll()); }

    getPulpits = async res => { res.json(await pulpit.findAll()); }

    getSubjects = async res => { res.json(await subject.findAll()); }

    getTeachers = async res => { res.json(await teacher.findAll()); }

    getAuditoriumTypes = async res => { res.json(await auditorium_type.findAll()); }

    getAuditoriums = async res => { res.json(await auditorium.findAll()); }

    getFacultySubjects = async (res, xyz) => {
        try {
            const foundFaculty = await faculty.findByPk(xyz);
          
          if (!foundFaculty) {
            this.sendCustomError(res, 404, `Cannot find faculty with name "${facultyName}"`);
          } else {
            const pulpits = await pulpit.findAll({ where: { faculty: foundFaculty.faculty } });
            
            if (!pulpits) {
              this.sendCustomError(res, 404, `Cannot find pulpits for faculty "${facultyName}"`);
            } else {
              const pulpitIds = pulpits.map(pulpit => pulpit.pulpit);
              const subjects = await subject.findAll({ where: { pulpit: pulpitIds } });
              
              res.json({
                faculty: foundFaculty.faculty,
                faculty_name: foundFaculty.faculty_name,
                subjects: subjects.map(subject => ({
                  subject: subject.subject,
                  subject_name: subject.subject_name
                }))
              });
            }
          }
        } catch (err) {
          this.sendError(res, err);
        }
      }    
    
      getAuditoriumTypesAuditoriums = async (res, xyz) => {
        try {
          const foundAuditoriumType = await auditorium_type.findByPk(xyz);
      
          if (!foundAuditoriumType) {
            this.sendCustomError(res, 404, `Cannot find auditorium type "${xyz}"`);
          } else {
            const auditoriums = await auditorium.findAll({ where: { auditorium_type: foundAuditoriumType.auditorium_type } });
      
            res.json({
              auditorium_type: foundAuditoriumType.auditorium_type,
              auditorium_typename: foundAuditoriumType.auditorium_typename,
              auditoriums: auditoriums.map(auditorium => ({
                auditorium: auditorium.auditorium,
                auditorium_name: auditorium.auditorium_name,
                auditorium_capacity: auditorium.auditorium_capacity
              }))
            });
          }
        } catch (err) {
          this.sendError(res, err);
        }
      }

    getAuditoriumsbetween10And60 = async res => {
        const auditoriumsbetween10And60 = await auditorium.scope('between10And60').findAll();
        if (auditoriumsbetween10And60.length == 0)
            this.sendCustomError(res, 404, 'Cannot find auditoriums with capacity between 10 and 60');
        else
            res.json(auditoriumsbetween10And60);
    }

    // =================================  INSERT  =================================

    insertFaculty = async (res, dto) => {
        try { res.status(201).json(await faculty.create(dto)); }
        catch (err) { this.sendError(res, err); }
    }

    insertPulpit = async (res, dto) => {
        try { res.status(201).json(await pulpit.create(dto)); }
        catch (err) { this.sendError(res, err); }
    }

    insertSubject = async (res, dto) => {
        try { res.status(201).json(await subject.create(dto)); }
        catch (err) { this.sendError(res, err); }
    }

    insertTeacher = async (res, dto) => {
        try { res.status(201).json(await teacher.create(dto)); }
        catch (err) { this.sendError(res, err); }
    }

    insertAuditoriumType = async (res, dto) => {
        try { res.status(201).json(await auditorium_type.create(dto)); }
        catch (err) { this.sendError(res, err); }
    }

    insertAuditorium = async (res, dto) => {
        try { res.status(201).json(await auditorium.create(dto)); }
        catch (err) { this.sendError(res, err); }
    }

    // =================================  UPDATE  =================================

    updateFaculty = async (res, dto) => {
        try {
            const facultyToUpdate = await faculty.findByPk(dto.faculty);
            if (!facultyToUpdate)
                this.sendCustomError(res, 404, `Cannot find faculty = ${dto.faculty}`);
            else {
                await faculty.update(dto, { where: { faculty: dto.faculty } })
                    .then(async () => {
                        res.json(await faculty.findByPk(dto.faculty));
                    });
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updatePulpit = async (res, dto) => {
        try {
            const pulpitToUpdate = await pulpit.findByPk(dto.pulpit);
            const facultyToUpdate = await faculty.findByPk(dto.faculty);
            if (!pulpitToUpdate)
                this.sendCustomError(res, 404, `Cannot find pulpit = ${dto.pulpit}`);
            else if (!facultyToUpdate)
                this.sendCustomError(res, 404, `Cannot find faculty = ${dto.faculty}`);
            else {
                await pulpit.update(dto, { where: { pulpit: dto.pulpit } })
                    .then(async () => {
                        res.json(await pulpit.findByPk(dto.pulpit));
                    });
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updateSubject = async (res, dto) => {
        try {
            const subjectToUpdate = await subject.findByPk(dto.subject);
            const pulpitToUpdate = await pulpit.findByPk(dto.pulpit);
            if (!subjectToUpdate)
                this.sendCustomError(res, 404, `Cannot find subject = ${dto.subject}`);
            else if (!pulpitToUpdate)
                this.sendCustomError(res, 404, `Cannot find pulpit = ${dto.pulpit}`);
            else {
                await subject.update(dto, { where: { subject: dto.subject } })
                    .then(async () => {
                        res.json(await subject.findByPk(dto.subject));
                    });
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updateTeacher = async (res, dto) => {
        try {
            const teacherToUpdate = await teacher.findByPk(dto.teacher);
            const pulpitToUpdate = await pulpit.findByPk(dto.pulpit);
            if (!teacherToUpdate)
                this.sendCustomError(res, 404, `Cannot find teacher = ${dto.teacher}`);
            else if (!pulpitToUpdate)
                this.sendCustomError(res, 404, `Cannot find pulpit = ${dto.pulpit}`);
            else {
                await teacher.update(dto, { where: { teacher: dto.teacher } })
                    .then(async () => {
                        res.json(await teacher.findByPk(dto.teacher));
                    });
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updateAuditoriumType = async (res, dto) => {
        try {
            const typeToUpdate = await auditorium_type.findByPk(dto.auditorium_type);
            if (!typeToUpdate)
                this.sendCustomError(res, 404, `Cannot find auditorium_type = ${dto.auditorium_type}`);
            else {
                await auditorium_type.update(dto, { where: { auditorium_type: dto.auditorium_type } })
                    .then(async () => {
                        res.json(await auditorium_type.findByPk(dto.auditorium_type));
                    });
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updateAuditorium = async (res, dto) => {
        try {
            const auditoriumToUpdate = await auditorium.findByPk(dto.auditorium);
            const typeToUpdate = await auditorium_type.findByPk(dto.auditorium_type);
            if (!auditoriumToUpdate)
                this.sendCustomError(res, 404, `Cannot find auditorium = ${dto.auditorium}`);
            else if (!typeToUpdate)
                this.sendCustomError(res, 404, `Cannot find auditorium_type = ${dto.auditorium_type}`);
            else {
                await auditorium.update(dto, { where: { auditorium: dto.auditorium } })
                    .then(async () => {
                        res.json(await auditorium.findByPk(dto.auditorium));
                    });
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    // =================================  DELETE  =================================

    deleteFaculty = async (res, faculty_id) => {
        try {
            const facultyToDelete = await faculty.findByPk(faculty_id);
            await faculty.destroy({ where: { faculty: faculty_id } })
                .then(() => {
                    if (!facultyToDelete)
                        this.sendCustomError(res, 404, `Cannot find faculty = ${faculty_id}`);
                    else
                        res.json(facultyToDelete);
                });
        }
        catch (err) { this.sendError(res, err); }
    }

    deletePulpit = async (res, pulpit_id) => {
        try {
            const pulpitToDelete = await pulpit.findByPk(pulpit_id);
            await pulpit.destroy({ where: { pulpit: pulpit_id } })
                .then(() => {
                    if (!pulpitToDelete)
                        this.sendCustomError(res, 404, `Cannot find pulpit = ${pulpit_id}`);
                    else
                        res.json(pulpitToDelete);
                });
        }
        catch (err) { this.sendError(res, err); }
    }

    deleteSubject = async (res, subject_id) => {
        try {
            const subjectToDelete = await subject.findByPk(subject_id);
            await subject.destroy({ where: { subject: subject_id } })
                .then(() => {
                    if (!subjectToDelete)
                        this.sendCustomError(res, 404, `Cannot find subject = ${subject_id}`);
                    else
                        res.json(subjectToDelete);
                });
        }
        catch (err) { this.sendError(res, err); }
    }

    deleteAuditoriumType = async (res, type_id) => {
        try {
            const typeToDelete = await auditorium_type.findByPk(type_id);
            await auditorium_type.destroy({ where: { auditorium_type: type_id } })
                .then(() => {
                    if (!typeToDelete)
                        this.sendCustomError(res, 404, `Cannot find auditorium_type = ${type_id}`);
                    else
                        res.json(typeToDelete);
                });
        }
        catch (err) { this.sendError(res, err); }
    }

    deleteAuditorium = async (res, auditorium_id) => {
        try {
            const auditoriumToDelete = await auditorium.findByPk(auditorium_id);
            await auditorium.destroy({ where: { auditorium: auditorium_id } })
                .then(() => {
                    if (!auditoriumToDelete)
                        this.sendCustomError(res, 404, `Cannot find auditorium = ${auditorium_id}`);
                    else
                        res.json(auditoriumToDelete);
                });
        }
        catch (err) { this.sendError(res, err); }
    }

    deleteTeacher = async (res, teacher_id) => {
        try {
            const teacherToDelete = await teacher.findByPk(teacher_id);
            await teacher.destroy({ where: { teacher: teacher_id } })
                .then(() => {
                    if (!teacherToDelete)
                        this.sendCustomError(res, 404, `Cannot find teacher = ${teacher_id}`);
                    else
                        res.json(teacherToDelete);
                });
        }
        catch (err) { this.sendError(res, err); }
    }

    // ===============================  TRANSACTION  ==============================

    transaction = async res => {
        sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED })
            .then(trans => {
                auditorium.update(
                    { auditorium_capacity: 1 },
                    {
                        where: { auditorium_capacity: { [Op.gte]: 0 } },
                        transaction: trans
                    })
                    .then(() => {
                        res.json({ 'message': 'Check out console logs' });
                        console.log('----- All capacities changed to 1');
                        console.log('----- Waiting 10 seconds...');
                        setTimeout(() => {
                            trans.rollback();
                            console.log('----- Values rolled back');
                        }, 10000);
                    }).catch(err => {
                        trans.rollback();
                        console.log(err);
                    });
            }).catch(err => console.log(err));
    }

    // ===============================  ERROR UTILS  ==============================

    sendError = async (res, err) => {
        if (err)
            res.status(409).json({
                code: err.original?.code,
                name: err?.name,
                detail: err.original?.detail,
                message: err.message
            });
        else
            this.sendCustomError(res, 409, err);
    }

    sendCustomError = async (res, code, message) => {
        res.status(code).json({ code: code, errorMessage: message });
    }
}

module.exports = SequelizeService;