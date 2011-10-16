package org.trivadis.websocket.socket;

import java.util.Set;


import org.eclipse.jetty.websocket.WebSocket.OnTextMessage;

/**
 * This class represents a web socket; it 
 * passes messages to all connected users
 * 
 * @author Andy Moncsek, Trivadis CH
 * 
 */
public class ChatWebSocket implements OnTextMessage {

	private Connection connection;
	
	private Set<ChatWebSocket> users;

	public ChatWebSocket() {

	}

	public ChatWebSocket(Set<ChatWebSocket> users ) {
		this.users = users;
	}



	public void onMessage(String data) {
		for (ChatWebSocket user : users) {
			try {
				user.connection.sendMessage(data);
			} catch (Exception e) {
			}
		}

	}


	@Override
	public void onOpen(Connection connection) {
		this.connection = connection;
		users.add(this);
		
	}

	@Override
	public void onClose(int closeCode, String message) {
		users.remove(this);
		
	}

}
