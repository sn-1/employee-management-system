USE employee_mgmtDB;

INSERT INTO department(name)
VALUES ("Marketing"),("Technology"),("Finance"),("Legal"),("Operations");

SELECT * FROM department;

INSERT INTO emp_role(title,salary,department_id)
VALUES 
("Marketing Specialist",50000.00,1),
("Marketing Lead",85000.00,1),
("Product Manager",100000.00,1),
("Software Engineer",60000.00,2),
("Senior Software Engineer",85000.00,2),
("Lead Engineer",110000.00,2),
("Accounts Payable Analyst",55000.00,3),
("Accounts Receivable Analyst",55000.00,3),
("Accounts Lead",80000.00,3),
("Corporate Associate Attorney",80000.00,4),
("Senior Corporate Counsel",180000.00,4),
("Operations Analyst",50000.00,5),
("Operations Manager",90000.00,5);

SELECT * FROM emp_role;

SELECT 
	d.id,
	d.name,
    er.id as ER_ID,
    er.title,
    er.salary
FROM department d
	INNER JOIN emp_role er on er.department_id = d.id
ORDER BY d.id, er.salary ASC;

INSERT INTO employee(first_name, last_name,role_id)
VALUES
("ken","Nguyen",1),
("Mike","Chen",2),
("Ariel","Boden",3),
("Kimbery","Roman",4),
("Mikeyla","Cocos",4),
("Drew","Nomson",5),
("Matthew","Heather",6),
("Nicole","kitman",7),
("Bill","Oxfoed",8),
("John","Murphy",8),
("Tracy","Robinson",9),
("Riley","Joanne",10),
("Dominic","kotop",11),
("Alex","Remberko",12),
("Nina","lay",12),
("Jonson","Colye",13);

SELECT * FROM employee;

UPDATE employee SET manager_id = 2 WHERE id = 1;
UPDATE employee SET manager_id = 3 WHERE id = 2;
UPDATE employee SET manager_id = 7 WHERE id = 4;
UPDATE employee SET manager_id = 7 WHERE id = 5;
UPDATE employee SET manager_id = 7 WHERE id = 6;
UPDATE employee SET manager_id = 11 WHERE id = 8;
UPDATE employee SET manager_id = 11 WHERE id = 9;
UPDATE employee SET manager_id = 11 WHERE id = 10;
UPDATE employee SET manager_id = 13 WHERE id = 12;
UPDATE employee SET manager_id = 16 WHERE id = 14;
UPDATE employee SET manager_id = 16 WHERE id = 15;

SELECT * FROM employee;

SELECT
	emp.first_name
    ,emp.last_name
    ,concat(mngr.first_name, " ", mngr.last_name) as Manager
    ,dpt.name as Department
    ,er.title    
FROM employee emp
	INNER JOIN emp_role er on er.id = emp.role_id
    INNER JOIN department dpt on dpt.id = er.department_id
	LEFt JOIN employee mngr on mngr.id = emp.manager_id
ORDER BY emp.id;