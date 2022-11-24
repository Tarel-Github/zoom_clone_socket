const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
//새로고침하면 이게 작동하고 모든 addEventListener가 설정 됌
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

function handleOpen() {
  console.log("연결!!");
}

socket.addEventListener("open", handleOpen); //연결이 발생하면 실행되는 코드

//아래 파라미터의 message는 많은 데이터를 품고 있다. 이중에서 data에 해당하는 것은 server에 정의된 hello다.
//서버로부터 메시지를 받으면 발생한다.
socket.addEventListener("message", (message) => {
  const li = document.createElement("li"); //프론트엔드에서 li에 해당하는 입력을 가져옴
  li.innerText = message.data; //li안의 택스트를 메시지의 데이터에 넣음
  messageList.append(li); //위에 선언된 메시지리스트에 적용
  //console.log("프론트엔드, 메시지를 받았습니다.", message.data, "서버로부터");
});

//연결이 끝날 경우(서버를 터트렸다던가) 발생하는 이벤트
socket.addEventListener("close", () => {
  console.log("프론트엔드, 연결이 끊어졌습니다!");
});

// setTimeout(() => {
//   socket.send("벡엔드, 10초가 지났습니다!!");
// }, 10000);

//백엔드로 보냄
function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input"); //위에 정의된 메시지폼에서 입력을 가져옴
  socket.send(makeMessage("new_message", input.value)); //백엔드에 내용을 보낸다.
  console.log("프론트엔드, 채팅내용을 출력합니다. ==", input.value); //채팅창에서 보낸 글이 콘솔로 출력됌
  input.value = ""; //채팅창에서 보내기 버튼을 누르면 입력창을 비워준다.
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);

nickForm.addEventListener("submit", handleNickSubmit);
