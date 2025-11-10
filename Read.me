Task Manager API
This is a simple backend project I built using Node.js, Express, and MongoDB.
It allows users to create an account, log in, and manage their daily tasks.
I also added features like password reset via email, error handling, and authentication using JWT.

What the project does
•	Lets users register and log in securely
•	Protects passwords using bcrypt
•	Sends password reset emails when a user forgets their password
•	Allows users to create, read, update, and delete their tasks
•	Includes proper error handling and token-based authentication
•   Allows automatic email reminders sent for upcoming tasks
•   Includes fixTask.js helps fix task-related issues or formatting errors
•   Seed data for reminders (seedTestReminder.js)
•   Automated tests for tasks (testTasks.js)
•	Postman Collection:Ready-to-use API endpoints in TaskManagerAPI.postman_collection.json



Tools and Technologies
•	Node.js and Express.js — for the server and routes
•	MongoDB (Mongoose) — for the database
•	JWT (JSON Web Token) — for authentication
•	Nodemailer — to send password reset emails
•	dotenv — for environment variables
•   Scheduling:node-cron (for task reminder)
•   Environment:ESM modules
•   Luxon: timezone handling
•   Express-validator: request validation
•   Testing:Seed scripts and test files



Folder Structure

Here’s how I arranged my project files:
task-manager-api/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── taskController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── protectTaskOwnership.js
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   ├── reminderRoutes.js       
│   └── testEmails.js
├── utils/
│   ├── email.js
│   └── fixTask.js               
├── jobs/
│   └── reminderJob.js
├── seed/
│   └── seedTestReminder.js
├── test/
│   └── testTasks.js
├── postman/
│   └── TaskManagerAPI.postman_collection.json   
├── .env
├── package.json
└── server.js

What Each Extra Feature Does
	1.	jobs/reminderJob.js
	•	Cron job that runs periodically and checks pending tasks due today
	•	Sends email reminders using the user’s timezone
	•	Marks reminderSent = true to prevent duplicate emails
	2.	routes/reminderRoutes.js
	•	Optional route to manually trigger the reminder job for testing or demo purposes
	3.	seed/seedTestReminder.js
	•	Script to populate test tasks in the database, especially useful to see reminders working without creating tasks manually
	4.	routes/testEmails.js
	•	Route to test sending emails independently of the cron job
	•	Ensures your Nodemailer setup is working


How to Run the Project
1.	Clone this repository
git clone https://github.com/princess279/tasks-manager-api.git
cd task-manager-api 

2.	Install all dependencies
npm run dev

3. .env Setup

You’ll need to create a .env file in your root folder and add these details:

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/task_manager
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=1d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your_email>
EMAIL_PASS=<your_email_app_password>

PORT=4000

4.	Test the endpoints using Postman or any API tool
Example URLs:
•	http://localhost:4000/api/auth/register
•	http://localhost:4000/api/tasks

Postman API Collection

You can easily test all API endpoints using the included Postman collection.

Location
postman/TaskManagerAPI.postman_collection.json

How to Use
	1.	Open Postman
	2.	Go to File → Import
	3.	Select postman/TaskManagerAPI.postman_collection.json
	4.	You’ll see folders organized as:
	•	Auth
	•	Tasks
	•	Reminders (excluding manual trigger route)
	•	Utilities (Dev only)

 Authentication
	•	Login using /api/auth/login to get your Bearer Token
	•	For protected routes, open Authorization → Bearer Token
	•	Paste the token you received

Example Testing Flow
	1.	Register → /api/auth/register
	2.	Login → /api/auth/login (copy token)
	3.	Create Task → /api/tasks
	4.	(Optional) Add the manual reminder route later if needed
	5.	Check automatic reminders in terminal or email
	6.	Delete / Complete Tasks → /api/tasks/:id

⸻

Add Manual Reminder Trigger Later (Optional)

If you want to include the manual reminder trigger route in your Postman later:

Method-Postman
URL:http://localhost:4000/api/reminders/trigger
Auth:Bearer Token (use your login token)
Description:Manually trigger reminder job to send pending reminders immediately

Expected success response
{
  "message": "Reminders triggered successfully"
}

Notes
•	Make sure MongoDB is running or you’re connected to your Atlas cluster.
•	Use tools like Postman or Thunder Client to test the endpoints.

Why This Project?

This project demonstrates full backend capabilities: authentication, CRUD operations, email integration, scheduled tasks, and testing. It’s an excellent example of a production-ready RESTful API.

This project helped me understand how authentication, environment variables, and MongoDB connections work in real-world APIs.
It also made me more comfortable with backend folder structure and organizing controllers, models, and routes properly.

Author

Precious Ogabu N.
Built as part of my backend development learning journey 💚