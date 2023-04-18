import { Router } from 'express';
import prisma from '../../../prisma';
import { authRole, authRoleOrPerson } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
import { address, contact, library_access, person, personal } from '@prisma/client';
import moment from 'moment';
import {getUserRole} from "../../../functions/getUserRole";

const router = Router();
router.get('/', authRole([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]),async (req, res) => {
  try {
    let userRole = await getUserRole(req);
    let result;

    if (userRole === UserRole.ADMIN) {
      result = await prisma.person.findMany({
        include: {
          address: true,
          contact: true,
          personal: true,
          library_access: true,
          faculty: true,
          course: true,
          gradebook: {
            include: {
              course_students: {
                include: {
                  course : true,
                }
              }
            }
          },
          account: {
            select: {
              username: true,
              account_images: {
                select: {
                  avatar_url: true,
                  background_url: true,
                }
              }
            }
          }
        },
      });
    }
    else {
      result = await prisma.person.findMany({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          role: true,
          account: {
            select: {
              account_images: {
                select: {
                  avatar_url: true,
                }
              }
            }
          }
        }
      });
    }
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/profile', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  try {
    const result = await prisma.person.findUnique({
      where: {
        id: Number(req.user?.person_id),
      },
      include: {
        address: true,
        contact: true,
        personal: true,
        library_access: true,
        faculty: true,
        course: true,
        gradebook: {
          select: {
            gradebook_id: true,
            semester: true,
            department_students: {
              select: {
                department: true
              },
            },
            course_students: {
              select: {
                course: true,
              }
            },
          },
        },
        account: {
          select: {
            account_images: {
              select: {
                avatar_url: true,
                background_url: true,
              }
            },
            last_login: true,
          }
        }
      },

    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/:id', authRoleOrPerson(UserRole.ADMIN), async (req, res) => {
  try {
    const result = await prisma.person.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        address: true,
        contact: true,
        personal: true,
        library_access: true,
        gradebook: true,

      },
    });

    res.status(200).send(result);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }

});
router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const newPerson = await prisma.person.create({
      data: {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        pesel: Number(req.body.pesel),
        role: req.body.role,
        birth_date: new Date(new Date(req.body.birth_date).toISOString().slice(0, 19).replace('T', ' ') + '.000000'),
        gender: req.body.gender,
        
        address: {
          create: {
            city: req.body.city,
            street: req.body.street,
            country: req.body.country,
            postal_code: req.body.postal_code,
            state: req.body.state,
          }
        },
        contact: {
          create: {
            email: req.body.email,
            phone_number: Number(req.body.phone_number),
          }
        },
        personal: {
          create: {
            disabled: req.body.disabled,
            married: req.body.married,
          }
        },
        library_access: {
          create: {
            has_access: '0'
          }
        }
      },
    });

    const result = await prisma.person.findUnique({
      where: {
        id: newPerson.id,
      },
      include: {
        address: true,
        contact: true,
        personal: true,
        gradebook: true,
      },
    });
    if (req.body.role === UserRole.STUDENT) {      
      await prisma.department_students.create({
        data: {
          department_id: Number(req.body.department_id),
          gradebook_id: result!.gradebook!.gradebook_id,
        }
      });
      const courses = await prisma.course.findMany({
        where: {
          department: Number(req.body.department_id),
          semester:result!.gradebook!.semester,
        }
      })
      
      if (courses) {
        for (let i = 0; i < courses.length; i++) {
          await prisma.course_students.create({
            data: {
              course_id: courses[i].id,
              gradebook_id: result!.gradebook!.gradebook_id,
            }
          });
        }
      }
    
    }
    
    res.status(201).json(result);

  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }

});
router.put('/profile/avatar', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  try {
    const result = await prisma.account.update({
      where: {
        person_id: req.user?.person_id
      },
      data: {
        account_images: {
          upsert: {
            update: {
              avatar_url: req.body.avatar_url
            },
            create: {
              avatar_url: req.body.avatar_url,
              background_url: ''
            }

          },
        }
      },
    });
    res.status(200).send({
        id: result.person_id,
        avatar_url: req.body.avatar_url
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/profile/background', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  try {
    const result = await prisma.account.update({
      where: {
        person_id: req.user?.person_id
      },
      data: {
        account_images: {
          update: {
            background_url: req.body.background_url
          }
        }
      },
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', authRoleOrPerson(UserRole.ADMIN), async (req, res) => {
  try {
    const result = await prisma.person.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        first_name: req.body.first_name || undefined,
        last_name: req.body.last_name || undefined,
        pesel: Number(req.body.pesel) || undefined,
        role: req.body.role || undefined,
        birth_date: moment(req.body.birth_date, 'DD/MM/YYYY').toDate() || undefined,
        gender: req.body.gender || undefined,
        title: req.body.title || undefined,

        address: {
          update: {
            city: req.body.address?.city || undefined,
            street: req.body.address?.street || undefined,
            country: req.body.address?.country || undefined,
            postal_code: req.body.address?.postal_code || undefined,
            state: req.body.address?.state || undefined,
          }
        },
        contact: {
          update: {
            email: req.body.contact?.email || undefined,
            phone_number: Number(req.body.contact?.phone_number) || undefined,
          }
        },
        personal: {
          update: {
            disabled: req.body.personal?.disabled || undefined,
            married: req.body.personal?.married || undefined,
          }
        },
        library_access: {
          update: {
            has_access: req.body.library_access?.has_access || undefined,
          }
        }
      },

    });
    res.status(200).send(result);
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }

});
router.delete('/:id', authRole(UserRole.ADMIN), async (req, res) => {

  try {
    const result = await prisma.person.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.status(204).send(result);

  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});


export default router;
