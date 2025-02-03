// // routes/index.js

// import express from "express";
// import AppController from "../controllers/AppController";
// import UsersController from "../controllers/UsersController";
// import AuthController from "../controllers/AuthController";
// import FilesController from "../controllers/FilesController";

// const router = express.Router();

// router.get("/status", AppController.getStatus);
// router.get("/stats", AppController.getStats);
// router.post("/users", UsersController.postNew);
// router.get("/connect", AuthController.getConnect);
// router.get("/disconnect", AuthController.getDisconnect);
// router.get("/users/me", AuthController.getMe);
// router.get('/files/:id', FilesController.getShow);
// router.get('/files', FilesController.getIndex);
// router.post("/files", FilesController.postUpload);
// router.put('/files/:id/publish', FilesController.putPublish);
// router.put('/files/:id/unpublish', FilesController.putUnpublish);

// export default router;
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';
import { basicAuthenticate, xTokenAuthenticate } from '../middlewares/authMiddleware';
import { APIError, errorResponse } from '../middlewares/error';

/**
 * Injects routes with their handlers to the given Express application.
 * @param {Express} api
 */
const injectRoutes = (api) => {
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);

  api.get('/connect', basicAuthenticate, AuthController.getConnect);
  api.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);

  api.post('/users', UsersController.postNew);
  api.get('/users/me', xTokenAuthenticate, UsersController.getMe);

  api.post('/files', xTokenAuthenticate, FilesController.postUpload);
  api.get('/files/:id', xTokenAuthenticate, FilesController.getShow);
  api.get('/files', xTokenAuthenticate, FilesController.getIndex);
  api.put('/files/:id/publish', xTokenAuthenticate, FilesController.putPublish);
  api.put('/files/:id/unpublish', xTokenAuthenticate, FilesController.putUnpublish);
  api.get('/files/:id/data', FilesController.getFile);

  api.all('*', (req, res, next) => {
    errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
  });
  api.use(errorResponse);
};

export default injectRoutes;