package org.trivadis.websocket.servlet;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.websocket.WebSocket;
import org.eclipse.jetty.websocket.WebSocketServlet;
import org.trivadis.websocket.socket.ChatWebSocket;

/**
 * This class represents a servlet starting a webSocket application
 * 
 * @author Andy Moncsek, Trivadis CH
 * 
 */
public class WebSocketChatServlet extends WebSocketServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 5610501345675935366L;
	public final Set<ChatWebSocket> users = new CopyOnWriteArraySet<ChatWebSocket>();

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		getServletContext().getNamedDispatcher("default").forward(request,
				response);
	}

	@Override
	public WebSocket doWebSocketConnect(HttpServletRequest arg0, String arg1) {
		return new ChatWebSocket(users);
	}

}
