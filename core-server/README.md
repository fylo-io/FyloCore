# Core Server

This repository contains a backend server built with **Express.js** and **TypeScript**. It provides a set of REST APIs and WebSocket functionalities to support various services.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Folder Structure](#folder-structure)
- [Running the Server](#running-the-server)
- [Running Tests](#running-tests)

## Environment Setup

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/fylo-io/FyloCore.git
   cd FyloCore/core-server
   ```

2. Install the required packages:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   This will start the server on `http://localhost:8000` (or any port specified in your `.env` file).

## Folder Structure

- `/src/consts`: Contains the constant values.
- `/src/controllers`: Contains the controllers for handling the logic of the various routes.
- `/src/database`: Handles database CRUD operations.
- `/src/middleware`: Middleware for error handling and file upload management.
- `/src/namespaces`: WebSocket API namespaces.
- `/src/routes`: REST API routes for different entities (graphs, nodes, edges, etc.).
- `/src/types`: TypeScript types and interfaces.
- `/src/utils`: Utility functions (e.g., error handling, logging).
- `/src/server.ts`: The main server entry point, where the server is initialized, routes are set up, and Socket.IO namespaces are integrated.

## Running the Server

To start the server, use the following command:

```bash
npm run dev
```

This will run the server in development mode.

- Environment variables: The application uses environment variables, loaded from a .env file. Make sure to create one with the necessary configuration (e.g., database credentials, server port).

## Running Tests

The project uses `Jest` for unit testing. To run the tests after making changes to the code, use the following command:

```bash
npm run test
```

This will run all the unit tests and display the results in the console. It's important to run the tests to ensure everything is working as expected before pushing changes.
