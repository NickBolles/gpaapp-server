var defaultAssign = {
  "assignName": "Default Assign",
  "dueDate": 827834,
  "completed":false,
  "tPts": 0,
  "sPts": 0,
  "weight": 0,
  "modified": 1409456073,
  "notes": "This is the Default Assignment",
  "tags": ["default"]
};
var defaultCourse = {
  "courseName": "Default Course",
  "instructor": "Instructor's Name",
  "completed": false,
  "credits": 3,
  "tPts": 100,
  "sPts": 100,
  "modified": 1409456073,
  "notes":"This is the default Course",
  "tags":["default"],
  "assigns": [defaultAssign]
};
var defaultTerm = {
  termName: "Default Term",
  termType: "Semester",
  termSDate: 1234873278,
  termEDate:12393487,
  completed: false,
  notes:"This is the default term",
  tags: "default",
  courses:[defaultCourse]
};
module.exports = {
  mode: "development", //development, test, production
  sessionId: "88v37g3m9sFwBx78Fy44J98243z28W",
  //for use on local development machine, high logging
  development: {
    port: 8081,
    msgPort: 8083,
    db:{
      username: "devgpasrv",
      pass: "C7OBSdqsysrkGoiyISGvKmYE5LVKJw",
      host: "localhost",
      port: "27017",
      database: "gpaappdev",
      options: ""
    },
    log:{
      console:{
        logFile:"",
        logLevel:0
      },
      db:{
        url:"",
        logLevel:0
      }
    },
    defaultTerm: defaultTerm
  },
  //Test is the state in which the server is running on the external server, but with development settings
  "test": {
    port: 8081,
    msgPort: 8083,
    db:{
      username: "devgpasrv",
      pass: "C7OBSdqsysrkGoiyISGvKmYE5LVKJw",
      host: "localhost",
      port: "27017",
      database: "gpaappdev",
      options: ""
    },
    log:{
      console:{
        logFile:"",
        logLevel:3
      },
      db:{
        url:"",
        logLevel:4
      }
    },
    defaultTerm: defaultTerm
  },
  //Server is in a stable state and running on the external server
  "production": {
    port: 8080,
    msgPort: 8082,
    db:{
      username: "gpasrv",
      pass: "qR83LSl2NlHmqEWY3YXPsF61abIX6V",
      host: "localhost",
      port: "27017",
      database: "gpaapp",
      options: ""
    },
    log:{
      console:{
        logFile:"",
        logLevel:3
      },
      db:{
        url:"",
        logLevel:4
      }
    },
    defaultTerm: defaultTerm
  },
  "applications": [
    "gpaapp"
  ]

};