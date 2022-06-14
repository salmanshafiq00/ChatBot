const chatForm = $("#chatForm");
const messageContainer = $(".messageContainer");
const userList = document.getElementById("users");


// Get Username and room from URL
const {username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true});


let socket = io(); 

//Send username and room to server
socket.emit('joinRoom', {username, room});

// Get user and room
socket.on('roomUsers', ({room, users}) => {
    outPutRoomName(room);
    outPutUsersName(users);
})

// Message from server
socket.on('message', (msg) => {
    console.log(msg);
    outPutMessage(msg);

    // Scroll Down
    messageContainer.scrollTop(700);
});

// Message submit
chatForm.on('submit', function(e) {
    e.preventDefault();

    //Get message from input text
    const msg = $("#msg").val();

    // send input message to server
    socket.emit('chatMessage', msg);

    // Clear Input
    $("#msg").val("");
    $("#msg").focus();
});

// image send to server
$('#imageFile').on('change', function(e){
    var file = e.originalEvent.target.files[0];
    var reader = new FileReader();
    reader.onload = function(evt){
        socket.emit('userImage', evt.target.result);
    };
    reader.readAsDataURL(file);
    $('#imageFile').val('');
});

// Output message to DOM
function outPutMessage(msg){
    var div = $((document.createElement('div')));
    div.addClass("message");
    div.html(`
    <p>${msg.username} <span>${msg.time}</span></p>
    <p class="text">${msg.text}</p>`);

    messageContainer.append(div);
}


// Output image to DOM
socket.on('addImage', function(data, image, time){
    var div = $((document.createElement('div')));
    div.addClass("message");
    div.html(`
    <p>${data} <span>${time}</span></p>
    <img class="image" src="${image}" />`);

    messageContainer.append(div);

});

// add room to dom
function outPutRoomName(room) {
    $("#roomName").text(room);
}

// add users to dom
function outPutUsersName(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

