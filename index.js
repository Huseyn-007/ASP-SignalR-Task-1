// const url = "https://localhost:7001/";
// const connection = new signalR.HubConnectionBuilder()
//   .withUrl(url + "offers")
//   .configureLogging(signalR.LogLevel.Information)
//   .build();

// async function start() {
//   try {
//     await connection.start();
//     console.log("SignalR connected");

//     $.get(url + "api/Offer", function (data, status) {
//       $("#offerValue").text("Begin price : " + data + "$");
//     });
//   } catch (err) {
//     console.log(err);
//     setTimeout(() => {
//       start();
//     }, 5000);
//   }
// }

// start();

// connection.on("ReceiveConnectInfo", (message) => {
//   let element = document.querySelector("#info");
//   // element.innerHTML = message;
// });

// connection.on("ReceiveDisconnectInfo", (message) => {
//   let element = document.querySelector("#info2");
//   //element.innerHTML = message;
// });

// connection.on("ReceiveMessage", (message, value) => {
//   let element = document.querySelector("#offerResponseValue");
//   element.innerHTML = message +" "+ value + "$";
// });

// function IncreaseOffer() {
//   const user = document.querySelector("#user");

//   $.get(url + "api/Offer/Increase?data=100", function (data, status) {
//     $.get(url + "api/Offer", function (data, status) {
//       connection.invoke("SendMessage", user.value);
//       const btn=document.getElementById("mybtn");
//       btn.disabled=true;
//     });
//   });
// }

var CURRENT_ROOM = "";
var totalSeconds = 10;
var currentUser = "";
var room = document.querySelector("#room");
var element = document.querySelector("#offerValue");
var timeSection = document.querySelector("#time-section");
var time = document.querySelector("#time");
var button = document.querySelector("#offerBtn");

 cars=["chevrolet", "bmw"]

const url = "https://localhost:7091/";
const connection = new signalR.HubConnectionBuilder()
  .withUrl(url + "offers")
  .configureLogging(signalR.LogLevel.Information)
  .build();

async function start() {
  try {
    await connection.start();

    $.get(url + "api/Offer/Room?room=" + CURRENT_ROOM, function (data, status) {
      element.innerHTML = "Begin price " + data + "$";
    });
  } catch (err) {
    console.log(err);
    setTimeout(() => {
      start();
    }, 5000);
  }
}

let roomBtnClickedCount = 0;

async function JoinRoom(roomName) {
  let roomBtn = document.getElementById(roomName);
  if (roomBtnClickedCount === 0) {
    CURRENT_ROOM = roomName;
    room.style.display = "block";
    await start();
    currentUser = document.querySelector("#user").value;
    await connection.invoke("JoinRoom", CURRENT_ROOM, currentUser);
    roomBtn.innerHTML = "Leave " + roomName + " room";
    roomBtnClickedCount +=1;
  }
  else if(roomBtnClickedCount === 1){
    CURRENT_ROOM = roomName;
    await connection.invoke("LeaveRoom", CURRENT_ROOM, currentUser);
    CURRENT_ROOM = "";
    roomBtn.innerHTML = "Join " + roomName + " Room"
    roomBtnClickedCount -=1;
    
  }


}

connection.on("ReceiveJoinInfo", (message) => {
  let infoUser = document.querySelector("#info");
  infoUser.style.color = "springgreen";
  infoUser.innerHTML = message + " connected to our room";

});
connection.on("ReceiveLeaveInfo", (message) => {
  let infoUser = document.querySelector("#info");
  infoUser.style.color = "red";
  infoUser.innerHTML = message + " disconnected to our room";

});
connection.on("ReceiveInfoRoom", (user,data) => {
  const element2=document.querySelector("#offerValue2");
  element2.innerHTML=user+" offer this price "+data+"$";
  button.disabled=false;
  timeSection.style.display="none";
  clearTimeout(myInterval);
  totalSeconds=10;
});


connection.on("ReceiveWinInfoRoom", (message,data) => {
  const element2=document.querySelector("#offerValue2");
  element2.innerHTML=message+" Offer this price "+data+"$";
  button.disabled=true;
  timeSection.style.display="none";
  clearTimeout(myInterval);
});



var myInterval;

async function IncreaseOffer() {
  clearTimeout(myInterval);
  timeSection.style.display = "block";
  totalSeconds = 10;

  const result = document.querySelector("#user");

  $.get(
    url + `api/Offer/IncreaseRoom?room=${CURRENT_ROOM}&data=100`,
    function (data, status) {
      $.get(
        url + "api/Offer/Room?room=" + CURRENT_ROOM,
        async function (data, status) {
          var element2 = document.querySelector("#offerValue2");
          element2.innerHTML = data;

          await connection.invoke(
            "SendMessageRoom",
            CURRENT_ROOM,
            result.value
          );
          button.disabled = true;

          myInterval = setInterval(async () => {
            time.innerHTML = totalSeconds;

            if (totalSeconds == 0) {
              clearTimeout(myInterval);
              button.disabled = true;
              await connection.invoke(
                "SendWinnerMessageRoom",
                CURRENT_ROOM,
                "Game Over \n " + result.value + " is Winner!"
              );
            }
            --totalSeconds;
          }, 1000);
        }
      );
    }
  );
}