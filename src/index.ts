import bodyParser from 'body-parser';
import express from 'express';

const app: express.Express = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

import * as FolderControllers from './controllers/folders';
import * as FileControllers from './controllers/files';

app.post('/v1/folders', FolderControllers.createFolder);
app.get('/v1/folders', FolderControllers.getFolders);
app.get('/v1/folder/:folderID', FolderControllers.getFolders);
app.delete('/v1/folder/:folderID', FolderControllers.deleteFolder);
app.put('/v1/folder/:folderID', FolderControllers.editFolderName)

app.post('/v1/files', FileControllers.createFile);
app.get('/v1/files', FileControllers.getFiles);
app.delete('/v1/file/:fileID', FileControllers.deleteFile);
app.put('/v1/file/:fileID', FileControllers.deleteFile);

export default app;
