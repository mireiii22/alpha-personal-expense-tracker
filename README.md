# Personal Expense Tracker

A full-stack personal expense tracker built with Node.js, Express, MongoDB, and deployed to AWS free tier.

## Features

- User authentication (register/login with JWT)
- CRUD operations for expenses
- Security basics: rate limiting, CORS, helmet
- Simple responsive frontend

## Local Setup

1. Install dependencies: `npm install`
2. Set up MongoDB:
   - Install MongoDB locally or use MongoDB Atlas free tier
   - Update MONGO_URI in .env
3. Create .env file:
   ```
   MONGO_URI=mongodb://localhost:27017/expenseapp
   JWT_SECRET=your_secret_key
   PORT=3000
   ```
4. Run the app:
   - Development: `npm run dev`
   - Production: `npm start`

## API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/expenses (auth required)
- POST /api/expenses (auth required)
- PUT /api/expenses/:id (auth required)
- DELETE /api/expenses/:id (auth required)

## Deployment to AWS

1. Set up MongoDB Atlas cluster (free tier)
2. Create AWS account and install AWS CLI
3. Install Serverless Framework: `npm install -g serverless`
4. Configure serverless.yml for Lambda + API Gateway
5. Deploy: `serverless deploy`

## Learning Topics Covered

- Node.js backend development
- RESTful API design
- Authentication with JWT
- Database integration with MongoDB
- Security best practices
- Cloud deployment with AWS
