const inquirer = require("inquirer");
const myDB = require("./db");



const loginPrompt = [
    {
        name: "username",
        type: "input",
        message: "Please enter your username"
    }
];

const starterPrompt = [
    {
        name: "actionitem",
        type: "list",
        message: "What would you like to do?",
        choices: [
            new inquirer.Separator("---- Department Items ----"),
            {
                name: "  View All Employees",
                value: "viewEmp"
            },
            {
                name: "  View Employees by Specific Manager",
                value: "getEmpMgr"
            },
            {
                name: "  View All Roles",
                value: "viewRoles"
            },
            {
                name: "  View All Departments",
                value: "viewDept"
            },
            {
                name: "  View One Department's Budget",
                value: "getOneBudget"
            },
            {
                name: "  View All Department Budgets",
                value: "getAllBudgets"
            },

            new inquirer.Separator("---- Role Items ----"),
            {
                name: "  Add A Department",
                value: "addDept"
            },
            {
                name: "  Add A Role",
                value: "addRole"
            },
            {
                name: "  Add An Employee",
                value: "addEmp"
            },

            new inquirer.Separator("---- Update ----"),
            {
                name: "  Update Employee's Role",
                value: "updateEmpRole"
            },
            {
                name: "  Update Role's Department",
                value: "updateRoleDept"
            },
            {
                name: "  Update Role's Salary",
                value: "updateRoleSalary"
            },

            new inquirer.Separator("---- Delete an item----"),
            {
                name: "  Delete A Department",
                value: "deleteDept"
            },
            {
                name: "  Delete A Role",
                value: "deleteRole"
            },
            {
                name: "  Delete An Employee",
                value: "deleteEmp"
            },

            new inquirer.Separator("---- EXIT ----"),
            {
                name: "  Exit\n  . . . . . . . . .\n\n",
                value: "exit"
            }
        ]
    },
]


async function getEMSUser(){
    try {

        let login = await inquirer.prompt(loginPrompt);
        let result = await myDB.setDBUser(login);
        console.log(result);
    }   catch (error) {
        console.log(error);
        
    }
}



async function getUserInput() {
    try {

        await getEMSUser();

        let keepGoing = true;

        while (keepGoing === true) {

            const getAction = await inquirer.prompt(starterPrompt);

            switch (getAction.actionitem) {
                case ("exit"):
                    keepGoing = false;
                    myDB.closeDB();
                    break;
                    case ("addDept"):
                    const newDept = await inquirer.prompt([
                        {
                            name: "name",
                            type: "input",
                            message: "Enter the name of the new department:"
                        }
                    ]);
            
                    let result = await myDB.insertNewDept(newDept);
                    console.log(result);
                    break;
                    case ("viewDept"):
                    const allDepts = await myDB.getAllDepartments();
                    console.table(allDepts);
                    break;
                    case ("getAllBudgets"):
                    const allBudgets = await myDB.getAllDeptUtilBudget();
                    console.table(allBudgets);
                    break;
                    case ("getOneBudget"):
                    await getOneDeptBudget();
                    break;
                    case ("deleteDept"):
                    await deleteDepartment();
                    break;
                    case ("addRole"):
                    await addNewRole();
                    break;
                    case ("updateRoleSalary"):
                    await updateRoleSalary();
                    break;
                    case ("updateRoleDept"):
                    await updateRoleDept();
                    break;
                    case ("viewRoles"):
                    const allRoles = await myDB.getAllRoles();
                    console.table(allRoles);
                    break;
                    case ("deleteRole"):
                    await deleteRole();
                    break;
                    case ("addEmp"):
                    await addNewEmployee();
                    break;
                    case ("viewEmp"):
                    const allEmps = await myDB.getAllEmployeeData();
                    console.table(allEmps);
                    break;
                    case ("updateEmpRole"):
                    await updateEmpRole();
                    break;
                    case ("getEmpMgr"):
                    await getEmpByManager();
                    break;
                    case ("deleteEmp"):
                    await deleteEmployee();
                    break;
                    default:
                    console.log(getAction.actionitem);
                    break;
            }
        }

    } catch (error) {
        console.log(error);

    }
}

async function addNewRole() {
    try {
        const allDepts = await myDB.getAllDepartments();
        let choicesArr = [];
        for (let i = 0; i < allDepts.length; i++) {
            let tmpObj = {};
            tmpObj.name = allDepts[i].name;
            tmpObj.value = allDepts[i].id;
            choicesArr.push(tmpObj);
        }


        const newRole = await inquirer.prompt([
            {
                name: "title",
                type: "input",
                message: "Enter new employee role: "
            },
            {
                name: "salary",
                type: "input",
                message: "Enter salary for new role: ",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "department_id",
                type: "list",
                message: "Which department does this role belong to?",
                choices: choicesArr
            }
        ]);

        let result = await myDB.insertNewRole(newRole);
        console.log(result);

    } catch (error) {
        console.log(error);

    }
}


async function addNewEmployee() {
    try {

        let roleList = await myDB.getAllRoles();
        let roleChoices = [];

      
        for (let i = 0; i < roleList.length; i++) {
            let tmpObj = {};
            tmpObj.name = roleList[i].title;
            tmpObj.value = roleList[i].id;
            roleChoices.push(tmpObj);
        }


        let empPartA = await inquirer.prompt([
            {
                name: "first_name",
                type: "input",
                message: "Enter employee's first name: "
            },
            {
                name: "last_name",
                type: "input",
                message: "Enter employee's last name: ",
            },
            {
                name: "role_id",
                type: "list",
                message: "Select employee's role: ",
                choices: roleChoices
            }
        ]);

        let empPartB = await getEmpManager(empPartA.role_id, roleList);
  

        let newEmp = { ...empPartA, ...empPartB };

        let result = await myDB.insertNewEmp(newEmp);
        console.log(result);


    } catch (error) {
        console.log(error);

    }
}

async function getEmpManager(empRoleID, roleList, excludeID) {

    let deptId = null;


    for (let i = 0; i < roleList.length; i++) {
        if (roleList[i].id === empRoleID) {
            deptId = roleList[i].department_id;
            break;
        }
    }
  
    let managerList = await myDB.getEmployeeByDept(deptId);

    let managerChoice = [{ name: "None", value: null }];

    for (let j = 0; j < managerList.length; j++) {
        let tmpObj = {};
        if (managerList[j].id === excludeID) { continue; };
        tmpObj.name = managerList[j].Employee + ", " + managerList[j].title;
        tmpObj.value = managerList[j].id;
        managerChoice.push(tmpObj);
    }



    let manager = await inquirer.prompt([
        {
            name: "manager_id",
            type: "list",
            message: "Select employee's manager: ",
            choices: managerChoice
        }
    ]);
    return manager;

}


async function updateEmpRole() {
    try {

        let empList = await myDB.getEmployeeList();
       

        let empChoices = [];

        for (let i = 0; i < empList.length; i++) {
            let tmpObj = {};
            tmpObj.name = `${empList[i].Employee} - Current Title: ${empList[i].title}`;
            tmpObj.value = { id: empList[i].id, manager: empList[i].manager_id, role: empList[i].role_id };
            empChoices.push(tmpObj);
        }

        let roleList = await myDB.getAllRoles();

        let roleChoices = [];

   
        for (let i = 0; i < roleList.length; i++) {
            let tmpObj = {};
            tmpObj.name = roleList[i].title;
            tmpObj.value = roleList[i].id;
            roleChoices.push(tmpObj);
        }


        let updateParam = await inquirer.prompt([
            {
                name: "currentInfo",
                type: "list",
                message: "Select employee to update: ",
                choices: empChoices
            },
            {
                name: "role_id",
                type: "list",
                message: "Select employee's new role: ",
                choices: roleChoices
            },
            {
                name: "update_mgr",
                type: "list",
                message: "Update employee's manager?",
                choices: [
                    "Yes",
                    "No"
                ]

            }
        ]);

 

        if (updateParam.update_mgr === "Yes") {
            let newMgr = await getEmpManager(updateParam.role_id, roleList, updateParam.currentInfo.id);
            updateParam.manager = newMgr.manager_id;
        }


        let updateEmp = {};

        updateEmp.id = updateParam.currentInfo.id;
        updateEmp.role_id = updateParam.role_id;

        if (updateParam.update_mgr === "Yes") {
            updateEmp.manager_id = updateParam.manager;
        }
        else if (updateParam.update_mgr === "No") {
            updateEmp.manager_id = updateParam.currentInfo.manager;
        }


        let result = await myDB.updateEmpRoleMgr(updateEmp);

        console.log(result);

    } catch (error) {
        console.log(error);

    }
}

async function getOneDeptBudget() {
    try {

        let deptList = await myDB.getAllDepartments();

        let deptChoices = [];

  
        for (let i = 0; i < deptList.length; i++) {
            let tmpObj = {};
            tmpObj.name = deptList[i].name;
            tmpObj.value = deptList[i].id;
            deptChoices.push(tmpObj);
        }

        let dept = await inquirer.prompt([
            {
                name: "id",
                type: "list",
                message: "Select department: ",
                choices: deptChoices
            }
        ]);

        console.log(dept.id)

        let deptBudget = await myDB.getOneDeptBudget(dept.id);

        console.table(deptBudget);

    } catch (error) {
        console.log(error);

    }
}

async function deleteEmployee() {
    try {

        let empList = await myDB.getEmployeeList();


        let empChoices = [];

        for (let i = 0; i < empList.length; i++) {
            let tmpObj = {};
            tmpObj.name = `${empList[i].Employee} - ${empList[i].title}`;
            tmpObj.value = empList[i].id;
            empChoices.push(tmpObj);
        }

        let deleteEmp = await inquirer.prompt([
            {
                name: "id",
                type: "list",
                message: "Select employee to delete: ",
                choices: empChoices
            }
        ]);

        console.log(deleteEmp);


        let result = await myDB.deleteEmployee(deleteEmp);

        console.log(result);



    } catch (error) {
        console.log(error);

    }

}

async function getEmpByManager() {
    try {

        let managerList = await myDB.getManagerList();

        let mgrChoices = [];

        for (let i = 0; i < managerList.length; i++) {
            let tmpObj = {};
            tmpObj.name = `${managerList[i].Manager} - ${managerList[i].title} - Direct Reports: ${managerList[i].Num_DirectReports} `;
            tmpObj.value = managerList[i].id;
            mgrChoices.push(tmpObj);
        }

        let empList = await inquirer.prompt([
            {
                name: "manager_id",
                type: "list",
                message: "Select manager: ",
                choices: mgrChoices
            }
        ]);

        let results = await myDB.getEmpByMgr(empList);

        console.table(results);

    } catch (error) {
        console.log(error);

    }
}

async function deleteRole() {
    try {

        let roleList = await myDB.getRoleEmpCount();


        let roleChoices = [];
        for (let i = 0; i < roleList.length; i++) {
            let tmpObj = {};
            tmpObj.name = `${roleList[i].title} - # Employees: ${roleList[i].EmployeeCount}`;

            if (roleList[i].EmployeeCount > 0) {
                tmpObj.value = { id: roleList[i].id, canDelete: false };
            }
            else {
                tmpObj.value = { id: roleList[i].id, canDelete: true };
            }
            roleChoices.push(tmpObj);
        }

        let delRole = await inquirer.prompt([
            {
                name: "selected",
                type: "list",
                message: "Select Role to Delete: ",
                choices: roleChoices
            }
        ]);



        let result = "";

        if (delRole.selected.canDelete === true) {
            result = await myDB.deleteRole(delRole.selected);
        }
        else if (delRole.selected.canDelete === false) {
            result = "!! WARNING !! \nCannot delete a role that has employees. \nPlease re-assign employees before deleting this role.\n";
        }

        console.log(result);

    } catch (error) {
        console.log(error);

    }
}

async function deleteDepartment() {
    try {

        let deptList = await myDB.getAllDepartments();

        let deptChoices = [];

        for (let i = 0; i < deptList.length; i++) {
            let tmpObj = {};
            tmpObj.name = deptList[i].name;
            tmpObj.value = deptList[i].id;
            deptChoices.push(tmpObj);
        }


        let delDept = await inquirer.prompt([
            {
                name: "id",
                type: "list",
                message: "Select Department to Delete: ",
                choices: deptChoices
            },
            {
                name: "confirm",
                type: "list",
                message: "!! WARNING !! \n  Any roles in this deparment will now have a department of NULL. \n  Proceed with department deletion?: ",
                choices: [
                    "No",
                    "Yes"
                ]
            }
        ]);


        let result = "";

        if (delDept.confirm === "Yes") {
            result = await myDB.deleteDept(delDept);
        }
        else {
            result = "Canceling 'Delete A Department'";
        }

        console.log(result);

    } catch (error) {
        console.log(error);

    }
}

async function updateRoleDept() {
    try {

        let roleList = await myDB.getAllRoles();
        let roleChoices = [];

        for (let i = 0; i < roleList.length; i++) {
            let tmpObj = {};
            tmpObj.name = `${roleList[i].title} - Current Dept: ${roleList[i].department}`;
            tmpObj.value = roleList[i].id;
            roleChoices.push(tmpObj);
        }

        let deptList = await myDB.getAllDepartments();

        let deptChoices = [];

        for (let i = 0; i < deptList.length; i++) {
            let tmpObj = {};
            tmpObj.name = deptList[i].name;
            tmpObj.value = deptList[i].id;
            deptChoices.push(tmpObj);
        }

        let roleDept = await inquirer.prompt([
            {
                name: "id",
                type: "list",
                message: "Select role to update: ",
                choices: roleChoices
            },
            {
                name: "department_id",
                type: "list",
                message: "Select role's new department: ",
                choices: deptChoices
            },
            {
                name: "confirm",
                type: "list",
                message: "Are you sure you want to update this role to a new department?",
                choices: [
                    "No",
                    "Yes"
                ]
            }
        ]);

        console.log(roleDept);

        let result = "";

        if (roleDept.confirm === "Yes") {
            result = await myDB.updateRoleDept(roleDept);
        }
        else {
            result = "\ncanceling update role's department. . . .\n"
        }

        console.log(result);

    } catch (error) {
        console.log(error);
    }
}


async function updateRoleSalary() {
    try {


        let roleList = await myDB.getAllRoles();
        let roleChoices = [];

    
        for (let i = 0; i < roleList.length; i++) {
            let tmpObj = {};
            tmpObj.name = `${roleList[i].title} - Current Salary: ${roleList[i].salary}`;
            tmpObj.value = roleList[i].id;
            roleChoices.push(tmpObj);
        }

        let roleSalary = await inquirer.prompt([
            {
                name: "id",
                type: "list",
                message: "Select role to update: ",
                choices: roleChoices
            },
            {
                name: "salary",
                type: "input",
                message: "Enter new salary for  role: ",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "confirm",
                type: "list",
                message: "Are you sure you want to update this role's salary?",
                choices: [
                    "No",
                    "Yes"
                ]
            }
        ]);

        console.log(roleSalary);

        let result = "";

        if(roleSalary.confirm === "Yes"){
            result = await myDB.updateRoleSalary(roleSalary);
        }
        else{
            result = "\ncancelling update role's salary. . . .\n";
        }

        console.log(result);

    } catch (error) {
        console.log(error);
    }
}

getUserInput();