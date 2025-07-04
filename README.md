# BNB Mock - TypeScript Express Server

A bare-bones Express server implemented with TypeScript, based on the [typescript-express-skelly](https://github.com/Applefrittr/typescript-express-skelly) template.

## Description

This is a lightweight TypeScript Express server boilerplate designed for developers who want to get started quickly with a modern Node.js backend. It includes essential middleware and a clean project structure without unnecessary bloat.

## Features

- ✅ TypeScript support out of the box
- ✅ Express.js with essential middleware (morgan, cors, cookie-parser)
- ✅ Development server with hot reload (nodemon)
- ✅ Clean project structure
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Health check endpoints
- ✅ Graceful shutdown handling

## Project Structure

```
├── public/
│   └── images/
├── src/
│   ├── index.ts          # Server entry point
│   ├── app.ts            # Express app configuration
│   ├── controllers/
│   │   └── indexControllers.ts
│   └── routes/
│       └── index.ts
├── .gitignore
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (placeholder)

## API Endpoints

- `GET /` - Welcome message and API information
- `GET /health` - Health check endpoint
- `GET /api/v1` - API version information

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Customization

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Create corresponding controllers in `src/controllers/`
3. Import and use the routes in `src/app.ts`

### Adding Middleware

Add custom middleware in `src/app.ts` before the routes:

```typescript
// Custom middleware
app.use((req, res, next) => {
  // Your middleware logic
  next();
});
```

### Database Integration

This boilerplate doesn't include database setup. You can add your preferred database:

- **MongoDB**: Add `mongoose` and configure in a separate `src/config/database.ts`
- **PostgreSQL**: Add `pg` or `sequelize`
- **SQLite**: Add `sqlite3`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Acknowledgments

Based on the [typescript-express-skelly](https://github.com/Applefrittr/typescript-express-skelly) template by Applefrittr.
