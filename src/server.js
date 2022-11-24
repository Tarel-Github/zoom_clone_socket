//app.js는 frontend를 담당한다. frontend와 backend 폴더를 분리함으로써 보안을 강화한다.
//server.js는 backend를 담당한다.

const express = require("express");
const http = require("http"); //http 방식
const WebSocket = require("ws");
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

const handleListen = () =>
  console.log(`━━━━Listening on http://localhost:3750`); //아래 내용 덕분에 ws://localhost:3750도 구동 된다.

const server = http.createServer(app); //http 서버
const wss = new WebSocket.Server({ server }); //ws 서버, http서버를 넣어서 같이 구동, http 서버가 필요 없다면 파라미터를 비울 것

function handleConnection(socket) {
  console.log(socket);
}

const sockets = []; //철자 다름

//커넥션이 생기면 아래 코드가 작동한다.
wss.on("connection", (socket) => {
  sockets.push(socket); //연결이 발생하면 파폭이면 파폭, 크롬이면 크롬을 소켓 배열에 저장

  socket["nickname"] = "익명"; //소켓에 이름을 익명으로 준다.
  console.log("백엔드, 브라우저에 연결합니다.");

  //아래 콘솔로그는 사용자가 인터넷 창을 닫거나 할 경우, 내 VSCODE에서 나타나는 콘솔로그다
  //즉, 서버에서 발생하는 이벤트
  socket.on("close", () => console.log("백엔드, 연결이 끊어졌습니다!"));

  //소켓이 메시지를 보낼 때까지 기다린다.
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);

    switch (message.type) {
      case "new_message": //메시지가 들어오면 다른 모두에게 메시지를 전달
        const messageString = message.toString("utf8");
        //console.log(message.toString("utf8")); //메시지를 받아오는데 이상하게 받아진다.
        //그 문제를 해결하기 위해서 toString("utf8")을 적용
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        ); //각 브라우저를 aSocket이라고 한다.
      case "nickname":
        socket["nickname"] = message.payload;
    }

    console.log(message, message);
  });
  //socket.send("::백엔드가 프론트엔드에게, Hello::");
});

//app.listen(3750, handleListen);
server.listen(3750, handleListen); //http 서버위에 ws서버도 담겼다.
