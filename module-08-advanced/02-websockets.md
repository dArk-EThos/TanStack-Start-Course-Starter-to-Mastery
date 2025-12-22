# Module 8.2: Real-Time Features with WebSockets

## Table of Contents

1. [Introduction](#introduction)
2. [WebSocket Setup](#websocket-setup)
3. [Socket.IO Integration](#socketio-integration)
4. [Broadcasting Events](#broadcasting-events)
5. [Room Management](#room-management)
6. [Authentication](#authentication)
7. [Client Integration](#client-integration)
8. [Best Practices](#best-practices)
9. [Summary](#summary)

---

## Introduction

WebSockets enable real-time, bidirectional communication between client and server. Perfect for chat, notifications, and collaborative features.

---

## WebSocket Setup

### Install Socket.IO

```bash
pnpm add socket.io socket.io-client
```

### Server Setup

```typescript
// src/lib/websocket/server.ts
import { Server } from "socket.io";
import { createServer } from "http";

export function setupWebSocket(httpServer: ReturnType<typeof createServer>) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}
```

---

## Socket.IO Integration

### Event Handlers

```typescript
// src/lib/websocket/handlers.ts
import { Server, Socket } from "socket.io";

export function setupChatHandlers(io: Server, socket: Socket) {
  // Listen for messages
  socket.on("chat:message", async (data) => {
    const { roomId, message } = data;

    // Save to database
    const savedMessage = await prisma.message.create({
      data: {
        roomId,
        userId: socket.data.userId,
        content: message,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Broadcast to room
    io.to(roomId).emit("chat:message", savedMessage);
  });

  // Typing indicators
  socket.on("chat:typing", ({ roomId, isTyping }) => {
    socket.to(roomId).emit("chat:typing", {
      userId: socket.data.userId,
      isTyping,
    });
  });
}
```

---

## Broadcasting Events

### Broadcast to All

```typescript
// Broadcast to all connected clients
io.emit("notification", {
  type: "system",
  message: "Server maintenance in 10 minutes",
});
```

### Broadcast to Room

```typescript
// Broadcast to specific room
io.to(roomId).emit("user:joined", {
  userId,
  userName,
});
```

### Broadcast Except Sender

```typescript
// Broadcast to all except sender
socket.broadcast.emit("user:online", {
  userId: socket.data.userId,
});
```

---

## Room Management

### Join/Leave Rooms

```typescript
export function setupRoomHandlers(socket: Socket) {
  socket.on("room:join", async ({ roomId }) => {
    // Join room
    await socket.join(roomId);

    // Notify others
    socket.to(roomId).emit("user:joined", {
      userId: socket.data.userId,
      userName: socket.data.userName,
    });

    // Send room info to user
    const messages = await getRecentMessages(roomId);
    socket.emit("room:joined", { roomId, messages });
  });

  socket.on("room:leave", ({ roomId }) => {
    socket.leave(roomId);

    socket.to(roomId).emit("user:left", {
      userId: socket.data.userId,
    });
  });
}
```

---

## Authentication

### Auth Middleware

```typescript
// src/lib/websocket/middleware.ts
import { Socket } from "socket.io";

export async function authenticateSocket(socket: Socket, next: Function) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const session = await verifyToken(token);
    const user = await getUser(session.userId);

    // Attach user data to socket
    socket.data.userId = user.id;
    socket.data.userName = user.name;
    socket.data.user = user;

    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
}

// Use middleware
io.use(authenticateSocket);
```

---

## Client Integration

### React Hook

```typescript
// src/lib/websocket/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getAuthToken();

    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket");
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected };
}
```

### Chat Component

```typescript
function ChatRoom({ roomId }: { roomId: string }) {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit("room:join", { roomId });

    // Listen for messages
    socket.on("chat:message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing
    socket.on("chat:typing", ({ userId, isTyping }) => {
      // Update typing indicator
    });

    return () => {
      socket.emit("room:leave", { roomId });
      socket.off("chat:message");
      socket.off("chat:typing");
    };
  }, [socket, roomId]);

  const sendMessage = (content: string) => {
    if (!socket) return;

    socket.emit("chat:message", {
      roomId,
      message: content,
    });
  };

  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

---

## Best Practices

### 1. Namespace Separation

```typescript
// ✅ Good: Separate namespaces
const chatNamespace = io.of("/chat");
const notificationsNamespace = io.of("/notifications");

chatNamespace.on("connection", handleChatConnection);
notificationsNamespace.on("connection", handleNotificationConnection);
```

### 2. Error Handling

```typescript
// ✅ Good: Handle errors gracefully
socket.on("error", (error) => {
  console.error("Socket error:", error);
  // Notify user, retry, etc.
});
```

### 3. Reconnection Logic

```typescript
// ✅ Good: Auto-reconnect with exponential backoff
const socket = io(url, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
```

---

## Summary

- ✅ WebSocket server setup
- ✅ Socket.IO integration
- ✅ Event handling and broadcasting
- ✅ Room management
- ✅ Authentication
- ✅ React client integration

**Module 8 Complete!**
