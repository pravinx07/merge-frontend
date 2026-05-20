import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  notifications: any[];
  clearNotifications: (type?: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  notifications: [],
  clearNotifications: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.emit('setup', user);

      newSocket.on('online_status', (users: string[]) => {
        setOnlineUsers(users);
      });

      newSocket.on('message_received', (newMessage: any) => {
        // If we are not on the chat page for this message, add to notifications
        if (window.location.pathname !== `/chat/${newMessage.chatId}`) {
          setNotifications(prev => [
            {
              ...newMessage,
              type: 'message'
            },
            ...prev
          ]);
        }
      });

      newSocket.on('match_created', (data: any) => {
        setNotifications(prev => [
          {
            id: data.id,
            type: 'match',
            sender: data.user,
            title: 'New Match! 🎉',
            content: `You matched with ${data.user.name}`,
            path: '/matches',
            createdAt: data.matchedAt
          },
          ...prev
        ]);
      });

      newSocket.on('project_application_received', (data: any) => {
        setNotifications(prev => [
          {
            id: data.id,
            type: 'project_apply',
            sender: { id: 'system', name: data.applicantName, avatar: null },
            title: 'Project Application 🚀',
            content: `${data.applicantName} applied to ${data.projectTitle}`,
            path: `/projects/${data.projectId}`,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
      });

      newSocket.on('project_application_handled', (data: any) => {
        setNotifications(prev => [
          {
            id: `${data.projectId}_${data.status}`,
            type: 'project_decision',
            sender: { id: 'system', name: 'Merge Platform', avatar: null },
            title: `Application ${data.status}!`,
            content: `Your application to ${data.projectTitle} was ${data.status.toLowerCase()}`,
            path: `/projects/${data.projectId}`,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  const clearNotifications = (type?: string) => {
    if (type) {
      setNotifications(prev => prev.filter(notif => {
        const isMsg = notif.type === 'message' || !notif.type;
        if (type === 'message') return !isMsg;
        return notif.type !== type;
      }));
    } else {
      setNotifications([]);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
