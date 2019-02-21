$(function () {
    let chatroom = $('#chatroom');
    let feedback = $('#feedback');
    let timeout;

    let userForm = $('#userForm');
    let users = $('#users');
    let userName = $('#userName');
    let error = $('#error');

    var x = screen.height*0.7;
    $('.chat-container, #chatroom').css("height",x);

    $(window).resize(function() {
        let x = $(window).height();

        $('#chatroom').css("height",x);
    }).trigger("resize");


    userForm.submit( (e) =>  {
        e.preventDefault();
        socket.emit('new user', userName.val(), (data) => {
            if(data){
                $('.chat-container').show();
                $('.groups-container').show();
                $('.user-container').show();
                $('.user-form-container').hide();
                error.html('');
                error.hide();
            }else{
                error.html('Invalid username');
                error.show();
            }
        });
    });


    //Connect member
    socket.on('usernames', function (data) {
        var html = '';

        for(let i = 0; i < data.length; i++){
            html += '<div class="chip"><img src="/images/1024px-Circle-icons-profile.svg.png" alt="Person" width="96" height="96">' + data[i] + ' <span class="dot"></span></div><div class="clearfix"></div>';
        }
        users.html(html);
        var audio = new Audio('/sounds/light.mp3');
        audio.play();
    });

    //Get user message
    $('#textarea').submit((e) => {
        e.preventDefault();
        let message = $('#text');

        socket.emit('new_message', { message: message.val() });
        message.val('');
    });

    //Show new message
    socket.on('new_message', (data) => {
        chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>");
        var objDiv = document.getElementById("chatroom");
        objDiv.scrollTop = objDiv.scrollHeight;
        var audio = new Audio('/sounds/relentless.mp3');
        audio.play();
    });

    //User typing functions
    function timeoutFunction() {
        typing = false;
        socket.emit("typing", false);
    }

    $('#text').keyup(function() {
        typing = true;
        socket.emit('typing', typing);
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });

    socket.on('typing', (data) => {
        console.log(data);
        if (data.typing ===  true) {
            feedback.html('<p class="typing"><i>' + data.username + ' is typing a message....' + '</i></p>');
        } else {
            feedback.html('');
        }
    });

    socket.on('updaterooms', function (rooms, current_room) {
        $('#rooms').empty();
        $.each(rooms, function(key, value) {
            if(value == current_room){
                $('#rooms').append('<div>' + value + '</div>');
            }
            else {
                $('#rooms').append('<div style="text-align: center;"><a href="#" onclick="switchRoom(\''+value+'\')"><img src="/images/1024px-Circle-icons-profile.svg.png" alt="Avatar" class="avatar">' + value + '</a></div>');
            }
        });
    });

    $('#roombutton').click(function(){
        var name = $('#roomname').val();
        $('#roomname').val('');
        $('.modal').css('display', 'none');
        socket.emit('create', name);
    });

    $('.roomLink').click(()=> {
        console.log('test');
    })

});