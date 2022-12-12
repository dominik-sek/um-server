/*
  Warnings:

  - Added the required column `grade` to the `grade` table without a default value. This is not possible if the table is not empty.

*/

CREATE SCHEMA IF NOT EXISTS school;
set search_path = school;
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- AlterTable
ALTER TABLE "grade" ADD COLUMN     "grade" SMALLINT NOT NULL;


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
