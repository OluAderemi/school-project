# school-project
A cloud based microservices application
This code is a Node.js application that serves as a backend for a matchmaking service.
The main functionalities and components:

1. Dependencies: The application requires several npm packages, including Express.js for creating the server, MongoDB for database operations, bcrypt for password hashing, jwt for token-based authentication, uuid for generating unique identifiers, cors for handling Cross-Origin Resource Sharing, and dotenv for loading environment variables.

2. Endpoints:
   - `/perform-matching`: This endpoint performs matchmaking between users based on their preferences such as gender, age range, and location. It calculates the distance between users using the Haversine formula and ranks potential matches based on distance and motive interest.
   - `/signup`: Allows users to sign up by providing an email and password. It hashes the password using bcrypt and stores the user data in the MongoDB database.
   - `/login`: Handles user login. It checks the provided email and password, compares the password hash stored in the database, and issues a JWT token upon successful authentication.
   - `/forgot-password`: Handles password reset functionality. It updates the user's password in the database after verifying the newPassword and confirmPassword match.
   - `/user`: Retrieves individual user data based on their userId.
   - `/addmatch`: Allows users to add a match to their list of matches.
   - `/users`: Retrieves multiple users' data based on their userIds.
   - `/user`: Updates user information in the database.
   - `/messages`: Retrieves messages between two users based on their userIds.
   - `/message`: Adds a message to the database.

3. Database Operations:
   - The application connects to a MongoDB database using the MongoClient.
   - It performs various CRUD (Create, Read, Update, Delete) operations on the `users` and `messages` collections.

4. Error Handling: The application handles errors gracefully and sends appropriate HTTP status codes and error messages.

5. Middleware:
   - CORS middleware is used to enable Cross-Origin Resource Sharing, allowing the frontend to make requests to the backend from a different origin.
   - JSON middleware is used to parse incoming JSON requests.
   - Error handling middleware is used to catch and log errors.

Overall, this code provides a robust backend for a matchmaking service, handling user authentication, profile management, matchmaking, and messaging functionalities.
![image](https://github.com/OluAderemi/school-project/assets/87879500/adf7e9a6-15ed-41ba-a24d-ce704204f92f)
