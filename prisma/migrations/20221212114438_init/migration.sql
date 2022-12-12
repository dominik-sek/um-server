CREATE SCHEMA IF NOT EXISTS school;
set search_path = school;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "street" VARCHAR(64),
    "street_number" SMALLINT,
    "zip_code" INTEGER,
    "state" VARCHAR(64),
    "country" VARCHAR(64),
    "city" VARCHAR,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" SERIAL NOT NULL,
    "address_id" INTEGER NOT NULL,
    "email" VARCHAR(64),
    "phone_number" INTEGER,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "degree_course" (
    "id" SERIAL NOT NULL,
    "faculty_id" INTEGER NOT NULL,
    "name" VARCHAR,
    "semester_number" VARCHAR,
    "studies_type" SMALLINT,

    CONSTRAINT "degree_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "degree_course_student" (
    "degree_course_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "gradebook_student_id" INTEGER NOT NULL,

    CONSTRAINT "degree_course_student_pkey" PRIMARY KEY ("degree_course_id","gradebook_student_id")
);

-- CreateTable
CREATE TABLE "faculty" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "date" DATE,
    "gradebook_student_id" INTEGER NOT NULL,

    CONSTRAINT "grade_pkey" PRIMARY KEY ("id","subject_id")
);

-- CreateTable
CREATE TABLE "gradebook" (
    "gradebook_number" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,

    CONSTRAINT "gradebook_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "person" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "name" VARCHAR(64),
    "surname" VARCHAR(64),
    "pesel" BIGINT,
    "date_of_birth" DATE,
    "scientific_title" VARCHAR,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "degree_course_id" INTEGER NOT NULL,
    "name" VARCHAR,
    "ects" SMALLINT,
    "semester" SMALLINT,
    "type" VARCHAR,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id","teacher_id")
);

-- CreateTable
CREATE TABLE "user" (
    "person_id" INTEGER NOT NULL,
    "login" VARCHAR,
    "password" VARCHAR,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("person_id")
);

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "degree_course" ADD CONSTRAINT "degree_course_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "degree_course_student" ADD CONSTRAINT "degree_course_student_degree_course_id_fkey" FOREIGN KEY ("degree_course_id") REFERENCES "degree_course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "degree_course_student" ADD CONSTRAINT "degree_course_student_gradebook_student_id_fkey" FOREIGN KEY ("gradebook_student_id") REFERENCES "gradebook"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_gradebook_student_id_fkey" FOREIGN KEY ("gradebook_student_id") REFERENCES "gradebook"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_subject_id_teacher_id_fkey" FOREIGN KEY ("subject_id", "teacher_id") REFERENCES "subject"("id", "teacher_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gradebook" ADD CONSTRAINT "gradebook_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_degree_course_id_fkey" FOREIGN KEY ("degree_course_id") REFERENCES "degree_course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

INSERT INTO school.role (name) values ('student');
INSERT INTO school.role (name) values ('teacher');
INSERT INTO school.role (name) values ('admin');
CREATE OR REPLACE FUNCTION school.generate_student_id_and_platform_user() RETURNS trigger as $generate_student_id_and_platform_user$
   	BEGIN	
		IF new.role_id = 1 THEN
			INSERT INTO school.gradebook (gradebook_number,student_id) VALUES (10000+new.id,new.id);
			INSERT INTO school.user (person_id, login, password, role_id) values (new.id,CONCAT(lower(new.surname),(SELECT gradebook_number from school.gradebook where student_id = new.id)), (select crypt(cast(new.pesel as text) ,gen_salt('bf')) ), new.role_id );
		ELSE 
			INSERT INTO school.user (person_id,login, password, role_id) values (new.id,CONCAT(lower(new.name),lower(new.surname),new.id),(select crypt(cast(new.pesel as text),gen_salt('bf'))), new.role_id);
		END IF;
  		RETURN NULL;
  	END;
 $generate_student_id_and_platform_user$ LANGUAGE plpgsql;
 DROP TRIGGER IF EXISTS generate_student_id_and_platform_user ON school.person;
 CREATE TRIGGER generate_student_id_and_platform_user AFTER INSERT ON school.person FOR EACH ROW EXECUTE FUNCTION school.generate_student_id_and_platform_user();
