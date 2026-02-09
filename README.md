
# Task Management System (MERN Stack)

## Project Description

This project is a full-stack Task Management System developed using the MERN stack.
It allows users to register, login, create projects, and manage tasks under each project.

---

## Features

### Authentication

* User Registration
* User Login
* JWT-based authentication
* Protected routes

### Project Management

* Create Project
* View Projects
* Update Project
* Delete Project

### Task Management

* Create Task under a Project
* Update Task
* Delete Task
* Track Task Status (Todo, In Progress, Done)

---

## Technology Stack

### Frontend

* React
* React Router

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### Authentication

* JWT
* bcrypt

---

## Folder Structure

```
task-management/
  ├── frontend/
  ├── backend/
```

---

## Setup Instructions

### Backend

```
cd backend
npm install
```

Create `.env` file:

```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret
PORT=5000
```

Run:

```
npm start
```

---

### Frontend

```
cd frontend
npm install
npm run dev
```

---
