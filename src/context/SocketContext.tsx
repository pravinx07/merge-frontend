import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios, { BACKEND_URL } from '../lib/axios';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  notifications: any[];
  clearNotifications: (type?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  notifications: [],
  clearNotifications: async () => {},
  markAsRead: async () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || BACKEND_URL, {
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.emit('setup', user);

      // Fetch initial notifications
      axios.get('/notifications').then((res) => {
        setNotifications(res.data.filter((n: any) => !n.read));
      }).catch(console.error);

      newSocket.on('new_notification', (notification: any) => {
        setNotifications(prev => [notification, ...prev]);
      });

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

  const clearNotifications = async (type?: string) => {
    try {
      if (!type) {
        // Mark all as read via API then update local state to clear them
        await axios.put('/notifications/read-all');
        setNotifications([]);
      } else {
        // Route-based clear: just filter them out
        setNotifications(prev => prev.filter(n => n.type !== type));
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications, clearNotifications, markAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
