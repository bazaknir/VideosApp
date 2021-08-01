import express from 'express';
const app = express();
import { router } from './routes/video.route';
import { setLastConnectedSocket, setSockets } from './services/socket-io.service'
const path = require('path');
import * as config from './configuration.json';

let port = config.PORT;

const http = require('http').Server(app);

let _socket
const io = require('socket.io')(http, {
  cors: {
    origin: `https://localhost:${port}`,
    methods: ["GET", "POST"]
  }
});

io.on('connection', socket => {
  console.log("Client connected!")
  setSockets(io.sockets.sockets);   // set all clients for scenario which get new videos - we need to deliver to all connected sockets;
  setLastConnectedSocket(socket);   // set the last connected socket so we can deliver only the current videos to him (without interfiring to other connected clients).

  // handle the event sent with socket.send()
  socket.on('message', (data) => {
    console.log(data);
  });

  socket.on('disconnect', () => {
    console.log("Client disconnected!");
  });
});

let clietPath = path.join(__dirname, '..//..//video-client//dist//video-client');
app.get("/", function (req, res) {
  let reqPath = path.join(clietPath, '//index.html');
  res.sendFile(reqPath);
});

app.use(express.static(clietPath));
let downloadsPath = path.join(__dirname, '..//downloads')
let imagesPath = path.join(__dirname, '..//images')
app.use('/downloads', express.static(downloadsPath));
app.use('/images', express.static(imagesPath));

app.use('/api/videos', router);

http.listen(port, function () {
  console.log(`Server is listening on port ${port}`);
});