const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class PrismaService {

    // ==============================================  SELECT  ============================================

    getFaculties = async res => res.json(await prisma.faculty.findMany());

    getPulpits = async res => res.json(await prisma.pulpit.findMany({
        select: {
            pulpit: true,
            pulpit_name: true,
            _count: {
                select: { Teacher: true }
            }
        }
    }));

    getSubjects = async res => res.json(await prisma.subject.findMany());

    getTeachers = async res => res.json(await prisma.teacher.findMany());

    getAuditoriumTypes = async res => res.json(await prisma.auditoriumType.findMany());

    getAuditoriums = async res => res.json(await prisma.auditorium.findMany());

    getFacultySubjects = async (res, xyz) => {
        try {
            const facultyToFind = await prisma.faculty.findUnique({ where: { faculty: xyz } });
            if (!facultyToFind)
                this.sendCustomError(res, 404, `Cannot find faculty = ${xyz}`);
            else {
                res.json(await prisma.faculty.findMany({
                    where: { faculty: xyz },
                    select: {
                        faculty: true,
                        Pulpit: {
                            select: {
                                pulpit: true,
                                Subject: { 
                                    select: { 
                                        subject_name: true 
                                    } 
                                }
                            }
                        }
                    }
                }));
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    getTypesAuditoriums = async (res, xyz) => {
        try {
            const typeToFind = await prisma.auditoriumType.findUnique({ where: { auditorium_type: xyz } });
            if (!typeToFind)
                this.sendCustomError(res, 404, `Cannot find auditorium_type = ${xyz}`);
            else {
                res.json(await prisma.auditoriumType.findMany({
                    where: { auditorium_type: xyz },
                    select: {
                        auditorium_type: true,
                        Auditorium: { select: { auditorium: true } }
                    }
                }));
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    getComputerAuditoriums1k = async res => {
        try {
            const auditoriums = await prisma.auditorium.findMany({
                where: {
                    auditorium_type: 'ЛБ-К',
                    auditorium: {
                        contains: '-1'
                    }
                },
            });
            res.json(auditoriums);
        } catch (err) {
            this.sendError(res, err);
        }
    }

    getPuplitsWithoutTeachers = async res => {
        try {
            const pulpitsWithoutTeachers = await prisma.pulpit.findMany({
                where: {
                    Teacher: { none: {} }
                }
            });
            if (pulpitsWithoutTeachers.length === 0)
                this.sendCustomError(res, 404, 'There is no pulpits without teachers');
            else
                res.json(pulpitsWithoutTeachers);
        }
        catch (err) { this.sendError(res, err); }
    }

    getPulpitsWithVladimir = async res => {
        try {
            const pulpitsWithVladimir = await prisma.pulpit.findMany({
                where: {
                    Teacher: {
                        some: {
                            teacher_name: { contains: 'Владимир' }
                        }
                    }
                },
                select: {
                    pulpit: true,
                    pulpit_name: true,
                    Teacher: {
                        select: {
                            teacher_name: true
                        }
                    }
                }
            });
            if (pulpitsWithVladimir.length === 0)
                this.sendCustomError(res, 404, 'There is no pulpits with teachers named "Vladimir"');
            else
                res.json(pulpitsWithVladimir);
        }
        catch (err) { this.sendError(res, err); }
    }

    getAuditoriumsWithSameTypeAndCapacity = async res => {
        try {
            const sameAuditoriums = await prisma.auditorium.groupBy({
                by: ['auditorium_capacity', 'auditorium_type'],
                _count: { auditorium: true },
                having: {
                    auditorium: {
                        _count: { gt: 1 }
                    }
                }
            });
            if (sameAuditoriums.length === 0)
                this.sendCustomError(res, 404, 'There is no auditoriums with same type and capacity');
            else
                res.json(sameAuditoriums);
        }
        catch (err) { this.sendError(res, err); }
    }

    // =============================================  INSERT  =============================================

    insertFaculty = async (res, dto) => {
        try {
            const { faculty, faculty_name, Pulpit } = dto;
            const facultyExists = await prisma.faculty.findFirst({ where: { faculty } });

            if (facultyExists)
                this.sendCustomError(res, 409, `There is already faculty = ${faculty}`);
            else
                res.status(201).json(await prisma.faculty.create({
                    data: {
                        faculty,
                        faculty_name,
                        Pulpit: {
                            createMany: {
                                data: Pulpit.map(pulpitData => ({
                                    pulpit: pulpitData.pulpit,
                                    pulpit_name: pulpitData.pulpit_name
                                }))
                            }
                        }
                    },
                    include: {
                        Pulpit: true
                    }
                }));
        }
        catch (err) { this.sendError(res, err); }
    }

    insertPulpit = async (res, dto) => {
        try {
            const { pulpit, pulpit_name, faculty, faculty_name } = dto;
            const pulpitExists = await prisma.pulpit.findFirst({ where: { pulpit } });

            if (pulpitExists)
                this.sendCustomError(res, 409, `There is already pulpit = ${dto.pulpit}`);
            else
                res.status(201).json(await prisma.pulpit.create({
                    data: {
                        pulpit,
                        pulpit_name,
                        Faculty: {
                            connectOrCreate: {
                                where: { faculty },
                                create: {
                                    faculty,
                                    faculty_name
                                }                                
                            }
                        }
                    },
                    select: {
                        pulpit: true,
                        pulpit_name: true,
                        Faculty: true
                    }
                }));
        }
        catch (err) { this.sendError(res, err); }
    }

    insertSubject = async (res, dto) => {
        try {
            const { subject, subject_name, pulpit } = dto;
            const subjectExists = await prisma.subject.findFirst({ where: { subject } });
            const pulpitExists = await prisma.pulpit.findFirst({ where: { pulpit } });

            if (subjectExists)
                this.sendCustomError(res, 409, `There is already subject = ${subject}`);
            else if (!pulpitExists)
                this.sendCustomError(res, 404, `Cannot find pulpit = ${pulpit}`);
            else
                res.status(201).json(await prisma.subject.create({
                    data: {
                        subject,
                        subject_name,
                        pulpit
                    }
                }));
        }
        catch (err) { console.log(err); this.sendError(res, err); }
    }

    insertTeacher = async (res, dto) => {
        try {
            const { teacher, teacher_name, pulpit } = dto;
            const teacherExists = await prisma.teacher.findFirst({ where: { teacher } });
            const pulpitExists = await prisma.pulpit.findFirst({ where: { pulpit } });

            if (teacherExists)
                this.sendCustomError(res, 409, `There is already teacher = ${teacher}`);
            else if (!pulpitExists)
                this.sendCustomError(res, 404, `Cannot find pulpit = ${pulpit}`);
            else
                res.status(201).json(await prisma.teacher.create({
                    data: {
                        teacher,
                        teacher_name,
                        pulpit
                    }
                }));
        }
        catch (err) { this.sendError(res, err); }
    }

    insertAuditoriumType = async (res, dto) => {
        try {
            const { auditorium_type, auditorium_typename } = dto;
            const typeExists = await prisma.auditoriumType.findFirst({ where: { auditorium_type } });

            if (typeExists)
                this.sendCustomError(res, 409, `There is already auditorium_type = ${auditorium_type}`);
            else
                res.status(201).json(await prisma.auditoriumType.create({
                    data: {
                        auditorium_type,
                        auditorium_typename
                    }
                }));
        }
        catch (err) { this.sendError(res, err); }
    }

    insertAuditorium = async (res, dto) => {
        try {
            const { auditorium, auditorium_name, auditorium_capacity, auditorium_type } = dto;
            const auditoriumExists = await prisma.auditorium.findFirst({ where: { auditorium } });
            const typeExists = await prisma.auditoriumType.findFirst({ where: { auditorium_type } });

            if (auditoriumExists)
                this.sendCustomError(res, 409, `There is already auditorium = ${auditorium}`);
            else if (!typeExists)
                this.sendCustomError(res, 404, `Cannot find auditorium_type = ${auditorium_type}`);
            else
                res.status(201).json(await prisma.auditorium.create({
                    data: {
                        auditorium,
                        auditorium_name,
                        auditorium_capacity,
                        auditorium_type
                    }
                }));
        }
        catch (err) { this.sendError(res, err); }
    }

    // =============================================  UPDATE  =============================================

    updateFaculty = async (res, dto) => {
        try {
            const { faculty, faculty_name } = dto;
            const facultyToUpdate = await prisma.faculty.findUnique({ where: { faculty } });
            if (!facultyToUpdate)
                this.sendCustomError(res, 404, `Cannot find faculty = ${faculty}`);
            else {
                await prisma.faculty.update({
                    where: { faculty },
                    data: { faculty_name }
                }).then(async () => res.json(await prisma.faculty.findUnique({ where: { faculty } })));
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updatePulpit = async (res, dto) => {
        try {
            const { pulpit, pulpit_name, faculty } = dto;
            const pulpitToUpdate = await prisma.pulpit.findUnique({ where: { pulpit } });
            const facultyToUpdate = await prisma.faculty.findUnique({ where: { faculty } });

            if (!pulpitToUpdate)
                this.sendCustomError(res, 404, `Cannot find pulpit = ${pulpit}`);
            else if (!facultyToUpdate)
                this.sendCustomError(res, 404, `Cannot find faculty = ${faculty}`);
            else {
                await prisma.pulpit.update({
                    where: { pulpit },
                    data: {
                        pulpit_name,
                        faculty
                    }
                }).then(async () => res.json(await prisma.pulpit.findUnique({ where: { pulpit } })));
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updateSubject = async (res, dto) => {
        try {
            const { subject, subject_name, pulpit } = dto;
            const subjectToUpdate = await prisma.subject.findUnique({ where: { subject } });
            const pulpitToUpdate = await prisma.pulpit.findUnique({ where: { pulpit } });

            if (!subjectToUpdate)
                this.sendCustomError(res, 404, `Cannot find subject = ${subject}`);
            else if (!pulpitToUpdate)
                this.sendCustomError(res, 404, `Cannot find pulpit = ${pulpit}`);
            else {
                await prisma.subject.update({
                    where: { subject },
                    data: {
                        subject_name,
                        pulpit
                    }
                }).then(async () => res.json(await prisma.subject.findUnique({ where: { subject } })));
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updateTeacher = async (res, dto) => {
        try {
            const { teacher, teacher_name, pulpit } = dto;
            const teacherToUpdate = await prisma.teacher.findUnique({ where: { teacher } });
            const pulpitToUpdate = await prisma.pulpit.findUnique({ where: { pulpit } });

            if (!teacherToUpdate)
                this.sendCustomError(res, 404, `Cannot find teacher = ${teacher}`);
            else if (!pulpitToUpdate)
                this.sendCustomError(res, 404, `Cannot find pulpit = ${pulpit}`);
            else {
                await prisma.teacher.update({
                    where: { teacher },
                    data: {
                        teacher_name,
                        pulpit
                    }
                }).then(async () => res.json(await prisma.teacher.findUnique({ where: { teacher } })));
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updateAuditoriumType = async (res, dto) => {
        try {
            const { auditorium_type, auditorium_typename } = dto;
            const typeToUpdate = await prisma.auditoriumType.findUnique({ where: { auditorium_type } });
            if (!typeToUpdate)
                this.sendCustomError(res, 404, `Cannot find auditorium_type = ${auditorium_type}`);
            else {
                await prisma.auditoriumType.update({
                    where: { auditorium_type },
                    data: { auditorium_typename }
                }).then(async () => res.json(await prisma.auditoriumType.findUnique({ where: { auditorium_type } })));
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    updateAuditorium = async (res, dto) => {
        try {
            const { auditorium, auditorium_name, auditorium_capacity, auditorium_type } = dto;
            const auditoriumToUpdate = await prisma.auditorium.findUnique({ where: { auditorium } });
            const typeToUpdate = await prisma.auditoriumType.findUnique({ where: { auditorium_type } });

            if (!auditoriumToUpdate)
                this.sendCustomError(res, 404, `Cannot find auditorium = ${auditorium}`);
            else if (!typeToUpdate)
                this.sendCustomError(res, 404, `Cannot find auditorium_type = ${auditorium_type}`);
            else {
                await prisma.auditorium.update({
                    where: { auditorium },
                    data: {
                        auditorium_name,
                        auditorium_capacity,
                        auditorium_type
                    }
                }).then(async () => res.json(await prisma.auditorium.findUnique({ where: { auditorium } })));
            }
        }
        catch (err) { this.sendError(res, err); }
    }

    // =============================================  DELETE  =============================================

    deleteFaculty = async (res, faculty_id) => {
        try {
            const facultyToDelete = await prisma.faculty.findUnique({ where: { faculty: faculty_id } });
            if (!facultyToDelete)
                this.sendCustomError(res, 404, `Cannot find faculty = ${faculty_id}`);
            else
                await prisma.faculty.delete({ where: { faculty: faculty_id } })
                    .then(() => res.json(facultyToDelete));
        }
        catch (err) { this.sendError(res, err); }
    }

    deletePulpit = async (res, pulpit_id) => {
        try {
            const pulpitToDelete = await prisma.pulpit.findUnique({ where: { pulpit: pulpit_id } });
            if (!pulpitToDelete)
                this.sendCustomError(res, 404, `Cannot find pulpit = ${pulpit_id}`);
            else
                await prisma.pulpit.delete({ where: { pulpit: pulpit_id } })
                    .then(() => res.json(pulpitToDelete));
        }
        catch (err) { this.sendError(res, err); }
    }

    deleteSubject = async (res, subject_id) => {
        try {
            const subjectToDelete = await prisma.subject.findUnique({ where: { subject: subject_id } });
            if (!subjectToDelete)
                this.sendCustomError(res, 404, `Cannot find subject = ${subject_id}`);
            else
                await prisma.subject.delete({ where: { subject: subject_id } })
                    .then(() => res.json(subjectToDelete));
        }
        catch (err) { this.sendError(res, err); }
    }

    deleteTeacher = async (res, teacher_id) => {
        try {
            const teacherToDelete = await prisma.teacher.findUnique({ where: { teacher: teacher_id } });
            if (!teacherToDelete)
                this.sendCustomError(res, 404, `Cannot find teacher = ${teacher_id}`);
            else
                await prisma.teacher.delete({ where: { teacher: teacher_id } })
                    .then(() => res.json(teacherToDelete));
        }
        catch (err) { this.sendError(res, err); }
    }

    deleteAuditoriumType = async (res, type_id) => {
        try {
            const typeToDelete = await prisma.auditoriumType.findUnique({
                where: { auditorium_type: type_id }
            });
            if (!typeToDelete)
                this.sendCustomError(res, 404, `Cannot find auditorium_type = ${type_id}`);
            else
                await prisma.auditoriumType.delete({ where: { auditorium_type: type_id } })
                    .then(() => res.json(typeToDelete));
        }
        catch (err) { this.sendError(res, err); }
    }

    deleteAuditorium = async (res, auditorium_id) => {
        try {
            const auditoriumToDelete = await prisma.auditorium.findUnique({
                where: { auditorium: auditorium_id }
            });
            if (!auditoriumToDelete)
                this.sendCustomError(res, 404, `Cannot find auditorium = ${auditorium_id}`);
            else
                await prisma.auditorium.delete({ where: { auditorium: auditorium_id } })
                    .then(() => res.json(auditoriumToDelete));
        }
        catch (err) { this.sendError(res, err); }
    }

    // ===========================================  TRANSACTION  ==========================================

    transaction = async res => {
        try {
            await prisma.$transaction(async prisma => {
                await prisma.auditorium.updateMany({
                    data: {
                        auditorium_capacity: {
                            increment: 100
                        }
                    }
                });
                // throwing error rolles back the transaction
                throw new Error('Transaction rollback');
            });
        } catch (err) {
            console.log(`${err}`);
            this.sendCustomError(res, 200, `Transaction rolled back.`);
            return;
        }
    };

    // ============================================  FLUENT API  ==========================================

    getPulpitsByFacultyFluent = async (res, faculty_id) => {
        const pulpits = await prisma.faculty.findUnique({
            where: { faculty: faculty_id }
        })
            .Pulpit();
        if (pulpits)
            res.json(pulpits)
        else
            this.sendCustomError(res, 404, `Cannot find faculty = ${faculty_id}`);
    }

    // ===========================================  ERROR UTILS  ==========================================

    sendError = async (res, err) => {
        if (err)
            res.status(409).json({
                name: err?.name,
                code: err.code,
                detail: err.original?.detail,
                message: err.message
            });
        else
            this.sendCustomError(res, 409, err);
    }

    sendCustomError = async (res, code, message) => {
        res.status(code).json({ code, message });
    }
}

module.exports = PrismaService;