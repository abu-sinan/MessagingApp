import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import api from '../utils/api'
import { Search, Send, Clock, Check, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const Chat = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)
  const { user } = useAuth()
  const { socket, onlineUsers, typingUsers } = useSocket()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage)
      socket.on('message_sent', handleMessageSent)
      socket.on('messages_read', handleMessagesRead)

      return () => {
        socket.off('new_message', handleNewMessage)
        socket.off('message_sent', handleMessageSent)
        socket.off('messages_read', handleMessagesRead)
      }
    }
  }, [socket, selectedUser])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    }
  }

  const fetchMessages = async (userId) => {
    try {
      setLoading(true)
      const response = await api.get(`/messages/${userId}`)
      setMessages(response.data)
      
      // Mark messages as read
      if (socket && response.data.length > 0) {
        socket.emit('mark_messages_read', { senderId: userId })
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message])
    
    // If message is from selected user, mark as read
    if (selectedUser && message.senderId._id === selectedUser._id && socket) {
      socket.emit('mark_messages_read', { senderId: selectedUser._id })
    }
  }

  const handleMessageSent = (message) => {
    setMessages(prev => [...prev, message])
  }

  const handleMessagesRead = (data) => {
    if (selectedUser && data.senderId === user._id) {
      setMessages(prev => 
        prev.map(msg => 
          msg.receiverId._id === data.readerId && msg.status !== 'read' 
            ? { ...msg, status: 'read' }
            : msg
        )
      )
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser || !socket) return

    const messageData = {
      receiverId: selectedUser._id,
      text: newMessage.trim()
    }

    socket.emit('send_message', messageData)
    setNewMessage('')
    
    // Stop typing indicator
    socket.emit('typing_stop', { receiverId: selectedUser._id })
  }

  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.emit('typing_start', { receiverId: selectedUser._id })
      
      // Clear previous timeout
      if (window.typingTimeout) {
        clearTimeout(window.typingTimeout)
      }
      
      // Set timeout to stop typing indicator
      window.typingTimeout = setTimeout(() => {
        socket.emit('typing_stop', { receiverId: selectedUser._id })
      }, 1000)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getStatusIcon = (status, isSent) => {
    if (!isSent) {
      switch (status) {
        case 'sent':
          return <Clock className="h-3 w-3 text-gray-400" />
        case 'delivered':
          return <Check className="h-3 w-3 text-gray-400" />
        case 'read':
          return <CheckCheck className="h-3 w-3 text-blue-500" />
        default:
          return <Clock className="h-3 w-3 text-gray-400" />
      }
    }
    return null
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isTyping = selectedUser && typingUsers.has(selectedUser._id)

  return (
    <div className="flex h-full">
      {/* Users List */}
      <div className="hidden md:flex flex-col w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredUsers.map((userItem) => (
            <div
              key={userItem._id}
              onClick={() => setSelectedUser(userItem)}
              className={`flex items-center p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedUser?._id === userItem._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={userItem.avatar || `https://ui-avatars.com/api/?name=${userItem.username}&background=3b82f6&color=fff`}
                  alt={userItem.username}
                  className="h-12 w-12 rounded-full"
                />
                {onlineUsers.has(userItem._id) && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {userItem.username}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {userItem.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <div className="relative">
                <img
                  src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=3b82f6&color=fff`}
                  alt={selectedUser.username}
                  className="h-10 w-10 rounded-full"
                />
                {onlineUsers.has(selectedUser._id) && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
              <div className="ml-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {selectedUser.username}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {onlineUsers.has(selectedUser._id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-32 text-gray-500 dark:text-gray-400">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isSent = message.senderId._id === user._id
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div className={`flex flex-col max-w-xs lg:max-w-md ${
                        isSent ? 'items-end' : 'items-start'
                      }`}>
                        <div className={isSent ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                          <p className="break-words">{message.text}</p>
                        </div>
                        <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                          isSent ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isSent && (
                            <span className="ml-1">
                              {getStatusIcon(message.status, isSent)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="typing-dot h-2 w-2 bg-gray-500 rounded-full"></div>
                      <div className="typing-dot h-2 w-2 bg-gray-500 rounded-full"></div>
                      <div className="typing-dot h-2 w-2 bg-gray-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a user from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
