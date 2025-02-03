// // server.js

// import express from 'express';
// import routes from './routes/index';

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware to parse JSON request bodies
// app.use(express.json());

// // Use routes
// app.use(routes);

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
import express from 'express';
import startServer from './libs/startServer';
import injectRoutes from './routes';
import injectMiddlewares from './libs/middlewares';

const server = express();

injectMiddlewares(server);
injectRoutes(server);
startServer(server);

export default server;