API
============
       <appname>/api/<userActions>
| Method | URL           | Action  |
| :---:  |-------------| ----------|
|  **GPA App** |||
| GET | gpaapp/api/usercount | Get the users that are registered with the gpaapp |
| GET | gpaapp/api/getnews   | Get news for the app, will be an array of the last 3, with an optional parameter to specify which ones to get|
| GET | gpaapp/api/appversion   | Get most current version of the app |
| POST | gpaapp/api/appversion   | Check to see if a version of the app is compatible with the current server version |
| GET | gpaapp/api/serverversion | Get the current version of the server |
| POST | gpaapp/api/serverversion | Get the compatible app versions with a specified server version |
| GET | gpaapp/api/getstartupscript | Get a javascript file to execute on startup |
| **Users** |||
| GET | gpaapp/api/user/metadata | Gets a users gpaapp metaData |
| **Data** |||
| GET | gpaapp/api/data | Gets the gpaapp data |
| POST | gpaapp/api/data | Merge the posted data into the saved data |