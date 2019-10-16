# file-upload-api
A basic file upload API

# Pre-requisite
1. You need to have [Node.js](https://nodejs.org/en/) installed.

2. Install [MongoDB](https://docs.mongodb.com/manual/installation/)


# Running the application locally
1. Clone this repository

    `git clone https://github.com/OpesanyaAdebayo/file-upload-api`

2. Install dependencies

    `cd file-upload-api`

    `npm install`

3. Create a `.env` file with the same variables as `.env.example` in this repository. Replace the contents with your own `PORT` and `MONGO_URL`.

    Please note that `MONGO_URL` is the connection url for MongoDB. I used MongoDB Atlas to manage my MongoDB instance but you can simply replace it with the url you use for your local MongoDB instance.

4. Start your MongoDB server (if you're running a local MongoDB instance)

    `mongod`

5. Build the application

    `npm run build-ts`

6. Start the application

    `npm start`

