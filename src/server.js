//app.js는 frontend를 담당한다. frontend와 backend 폴더를 분리함으로써 보안을 강화한다.
//server.js는 backend를 담당한다.

const express = require("express");
const http = require("http"); //http 방식
const SocketIO = require("socket.io");
//const {Server} = require("socket.io");
//const {instrument} = require("@socket.io/admin-ui");
const app = express();

//html 대신 pug를 통해서 사이트를 표현
app.set("view engine", "pug");

//pug들이 있는 경로를 설정
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

//("/")경로에는 home이라는 pug파일을 보여준다. 보통 req, res로 작성하지만 여기선 req를 _라고 작성했다.
app.get("/", (_, res) => res.render("home"));

//없는 URL로 갈 경우 ("/") 링크로 돌아오게 하는 명령
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app); //http 서버
const wsServer = SocketIO(httpServer);
// const wsServer = new Server(httpServer, {
//   cors: {
//     origin: ["https://admin.socket.io"],
//     credentials: true,
//   },
// });

// instrument(wsServer, {
//   auth: false,
// });

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  // 위 코드는 아래 두 줄과도 같다.
  // const sids = wsServer.socket.adapter.sids;
  // const rooms = wsServer.socket.adapter.rooms;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "익명";
  console.log(
    "=========-=--=-=--=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
  );
  console.log(socket.onAny);
  console.log(
    "====+++++++++++++++++++++++=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
  );
  console.log(socket.onAny());
  console.log(
    "====+++++++++++++++++++++++=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
  );
  console.log(socket);
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName); //룸 이름에 접속
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); //이 메시지를 나를 뺀 모두에게 전달
    wsServer.sockets.emit("room_change", publicRooms());
  });
  // setTimeout(() => {
  //   done("백엔드: 메시지를 보냅니다");
  // }, 10000); //10초후, 이 메시지를 전달
  socket.on("disconnecting", () => {
    //disconnecting은 연결이 끊어지기 직전에 실행
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}:${msg}`);
    done(); //이건 호출되면 프론트에서 코드를 실행할 것이다.
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
}); //enter_room은 이벤트

const handleListen = () =>
  console.log(`━━━━Listening on http://localhost:3750`); //아래 내용 덕분에 ws://localhost:3750도 구동 된다.

function handleConnection(socket) {
  console.log(socket);
}

const sockets = []; //철자 다름

// //커넥션이 생기면 아래 코드가 작동한다.
// wss.on("connection", (socket) => {
//   sockets.push(socket); //연결이 발생하면 파폭이면 파폭, 크롬이면 크롬을 소켓 배열에 저장

//   socket["nickname"] = "익명"; //소켓에 이름을 익명으로 준다.
//   console.log("백엔드, 브라우저에 연결합니다.");

//   //아래 콘솔로그는 사용자가 인터넷 창을 닫거나 할 경우, 내 VSCODE에서 나타나는 콘솔로그다
//   //즉, 서버에서 발생하는 이벤트
//   socket.on("close", () => console.log("백엔드, 연결이 끊어졌습니다!"));

//   //소켓이 메시지를 보낼 때까지 기다린다.
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);

//     switch (message.type) {
//       case "new_message": //메시지가 들어오면 다른 모두에게 메시지를 전달
//         const messageString = message.toString("utf8");
//         //console.log(message.toString("utf8")); //메시지를 받아오는데 이상하게 받아진다.
//         //그 문제를 해결하기 위해서 toString("utf8")을 적용
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         ); //각 브라우저를 aSocket이라고 한다.
//       case "nickname":
//         socket["nickname"] = message.payload;
//     }

//     console.log(message, message);
//   });
//   //socket.send("::백엔드가 프론트엔드에게, Hello::");
// });

//app.listen(3750, handleListen);
httpServer.listen(3750, handleListen); //http 서버위에 ws서버도 담겼다.
