	var ws;

	$(document).ready(
			function() {
				ws = new WebSocket("ws://localhost:8080/JiniWorld/WebSocketChat/anything");
				ws.onopen = function(event) {
					
				}
				ws.onmessage = function(event) {
					var $textarea = $('#messages');
					$textarea.val($textarea.val() + event.data + "\n");
					$textarea.animate({
						scrollTop : $textarea.height()
					}, 1000);
				}
				ws.onclose = function(event) {
					
				}

			});

	function sendMessage() {
		var message = $('#username').val() + ":" + $('#message').val();
		ws.send(message);
		$('#message').val('');
	}