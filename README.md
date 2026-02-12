1️⃣ Clone the repository
git clone https://github.com/OrinamiD/swagger-demo.git
cd <project-folder>

2️⃣ Install dependencies

Using npm:

npm install

🔐 Environment Variables

Create a .env file in the root directory and add:

PORT= <Your_port_number>
MONGODB_URL=your_mongodb_connection_string
NODE_ENV=development


Example:

PORT=5000
MONGODB_URL=mongodb://127.0.0.1:27017/sampledb
NODE_ENV=development

▶️ Running the Server
Development Mode

If using TypeScript:

npm run dev


(If you use ts-node or nodemon, ensure it is configured in package.json.)

Production Mode

Build the project:

npm run build


Then start:

npm start

📚 API Documentation (Swagger)

After starting the server, visit:

http://localhost:5000/api-docs


You will see the interactive Swagger documentation.

🌐 Base URL
http://localhost:5000/api


Example:

POST http://localhost:5000/api/auth/register

📁 Project Structure
src/
 ├── configs/
 │    ├── db.config.ts
 │    └── swagger.config.ts
 ├── controllers/
 ├── middlewares/
 ├── routes/
 ├── models/
 └── index.ts

🔒 Security Features

Helmet for secure headers

Express rate limiting (100 requests per 15 minutes)

JSON error handling

Global error handling

🧪 Example Request (Register)
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "08012345678",
  "gender": "male"
}
