Running the Server
To run the server, use the following command:

//////////////////
npm start
////////////////////
Configuration
Before running the server, make sure to rename the global configuration file .env.demo to .env and set up the necessary environment variables as per your environment.


.env.demo to .env


Owner
This project is owned by Ankit Dhatterwal.

Video Tutorial
For instructions on how to use the project, please refer to the following video tutorial:

https://drive.google.com/uc?id=1IxCW_A7b4Ih7ubpudidGuU5OnSlnJi1Y&export=download



Database Setup
Make sure you have MySQL installed and running. Below is the SQL script for setting up the required database and table:

DDL

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS todo;

-- Use the created database
USE todo;

-- Create todo_list table
CREATE TABLE IF NOT EXISTS todo_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_path VARCHAR(255),
    completed BOOLEAN DEFAULT false
);



Feel free to reach out to Ankit Dhatterwal for any queries or assistance regarding the project
contect no 8239668355
.