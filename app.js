const inquirer = require("inquirer");
const myDB = require("./index");



const starterPrompt = [
    {
        name: "actionitem",
        type: "list",
        message: "What would you like to do?",
        choices: [
            new inquirer.Separator("---- Department Items ----"),
            {
                name: "Add a department",
                value: "addDept"
            },
            {
                name: "View all departments",
                value: "viewDept"
            },
            new inquirer.Separator("---- Role Items ----"),
            {
                name: "Add an employee role",
                value: "addRole"
            },
            {
                name: "View all employee roles",
                value: "viewRoles"
            },
            new inquirer.Separator("---- Employee Items ----"),
            {
                name: "Add an employee",
                value: "addEmp"
            },
            {
                name: "View all employees",
                value: "viewEmp"
            },
            new inquirer.Separator(),
            {
                name: "Exit",
                value: "exit"
            }
        ]
    },
]


async function getUserInput() {
    try {

        let keepGoing = true;

        while (keepGoing === true) {

            const getAction = await inquirer.prompt(starterPrompt);

            switch (getAction.actionitem) {
                case ("exit"):
                    console.log(getAction.actionitem);
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

                case ("addRole"):
                    await addNewRole();
                    break;

                case ("viewRoles"):
                    const allRoles = await myDB.getAllRoles();
                    console.table(allRoles);
                    break;

                case ("addEmp"):
                    await addNewEmployee();
                    break;

                case ("viewEmp"):
                    const allEmps = await myDB.getAllEmployeeData();
                    console.log("view emp")
                    console.table(allEmps);
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
                message: "Enter new employee's first name: "
            },
            {
                name: "last_name",
                type: "input",
                message: "Enter new employee's last name: ",
            },
            {
                name: "role_id",
                type: "list",
                message: "Select new employee's role: ",
                choices: roleChoices
            }
        ]);

       


        let empPartB = await getEmpManager(empPartA.role_id, roleList);
        

        let newEmp = {...empPartA,...empPartB};
 
        

        let result = await myDB.insertNewEmp(newEmp);
        console.log(result);


    } catch (error) {
        console.log(error);

    }
}

async function getEmpManager(empRoleID, roleList) {

    let deptId = null;

    
    for (let i = 0; i < roleList.length; i++) {
        if(roleList[i].id === empRoleID){
          
            deptId = roleList[i].department_id;
            break;
        }
    }
  
    let managerList = await myDB.getEmployeeByDept(deptId);
  

    let managerChoice = [{name: "None", value: null}];

    for(let j = 0; j < managerList.length;j++){
        let tmpObj = {};
        tmpObj.name = managerList[j].Employee +", "+ managerList[j].title;
        tmpObj.value = managerList[j].id;
        managerChoice.push(tmpObj);
    }
    
    
    

    let manager = await inquirer.prompt([
        {
            name: "manager_id",
            type: "list",
            message: "Select new employee's manager: ",
            choices: managerChoice
        }
    ]);

   
    
    return manager;

}




getUserInput();