# **_Application for task and time managment_**
## ***Author: Cyprian Kozubek***
<sup>Application was created as a project for my engineering thesis on Wroclaw University of Science and Technology<sup>

## **Summary:**

The aim of this project is to design and implement a web application intended to support users in efficiently managing their professional, academic, and personal responsibilities. The application will allow users to add tasks to a calendar on a daily basis, with each task assignable to a specific category, enabling better organization of the daily schedule. The system will provide access to various calendar views — daily, weekly, monthly, and quarterly — allowing for flexible planning and monitoring of activities according to the user’s needs.

Among the available features, users will be able to define each task in detail by adding a description, setting reminders, assigning a status, and tracking progress. Additionally, users will be able to specify the estimated completion time, assign priorities, and set specific hours and locations for task execution. The application will also support recurring tasks that repeat automatically at defined intervals. For more complex responsibilities, users will be able to break them down into smaller subtasks and schedule their execution over multiple days. To facilitate task review, the system will offer a task list sorted by date or priority.

An important element of the application will be a gamification module, in which users will earn points and achievements for completing tasks on time. The rewards collected can be used to personalize the application's interface and to compare performance with previous periods through a ranking system. A comprehensive statistics and reporting panel will provide users with detailed summaries of completed tasks, time analysis, and insights into periods of highest productivity. The entire system will support multiple users through a login function, with each user having access only to their own data, ensuring privacy and security of stored information.

## **Technology stack:**

### Backend: Python 3.13 -> Django

### Frontend: JavaScript -> React

### Database: PostgreSQL


## **How to run on Windows11** #
Move into Backend directory:
```
cd /Backend/
```
Create and activate a Python enviroment
```
python3 -m venv .venv
/.venv/Scripts/activate
```
How to run Django server:
```
python manage.py runserver
```

Move into Frontend directory:
```
cd /Frontend/
```
Run React web server
```
npm start
```
Application will open your web browser on this [URL](http://localhost:3000/login) and log or create account.