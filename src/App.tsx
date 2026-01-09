import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FaUser, FaRobot, FaSun, FaMoon, FaPaperPlane, FaTrash, FaStop } from 'react-icons/fa'

type Message = {
  id: string
  text: string
  sender: 'user' | 'bot'
}

function App() {
  console.log('App component rendering')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [timeoutId, setTimeoutId] = useState<number | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('appTheme') as 'light' | 'dark' | null
    return saved || 'light'
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chatHistory')
      console.log('Loading from localStorage:', saved)
      if (saved) {
        setMessages(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      localStorage.removeItem('chatHistory')
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('appTheme', theme)
      console.log('Saved theme to localStorage:', theme)
    } catch (error) {
      console.error('Error saving theme:', error)
    }
    console.log('Setting theme to:', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log('Added dark class')
    } else {
      document.documentElement.classList.remove('dark')
      console.log('Removed dark class')
    }
  }, [theme])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = () => {
    console.log('sendMessage called with input:', input)
    if (input.trim()) {
      console.log('Input is valid, sending')
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: 'user'
      }
      console.log('User message:', userMessage)
      setMessages(prev => {
        const newMessages = [...prev, userMessage]
        console.log('New messages:', newMessages)
        localStorage.setItem('chatHistory', JSON.stringify(newMessages))
        return newMessages
      })
      setInput('')
      setIsTyping(true)
      const id = setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
         text: `🚀 **Great question! I'm analyzing your request...**

✨ **Summary:** This is a simulated AI research response.

• **Point 1:** The assistant extracts key insights from research papers.  
• **Point 2:** It structures information in an easy-to-read format.

📚 **Source:** Nature Journal

_(This is a demo response — real AI integration coming soon 😉)_`,
          sender: 'bot'
        }
        setMessages(prev => {
          const newMessages = [...prev, botMessage]
          localStorage.setItem('chatHistory', JSON.stringify(newMessages))
          return newMessages
        })
        setIsTyping(false)
        setTimeoutId(null)
      }, 1500)
      setTimeoutId(id)
    } else {
      console.log('Input is empty, not sending')
    }
  }

  const stopGeneration = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setIsTyping(false)
      setTimeoutId(null)
    }
  }

  const toggleTheme = () => {
    console.log('Toggling theme')
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem('chatHistory')
  }

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900">
      <div className="w-full h-full flex flex-col bg-white dark:bg-black text-black dark:text-white">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white p-6 flex justify-between items-center shadow-lg">
          <h1 className="text-2xl font-bold">AI Research Assistant</h1>
          <button onClick={toggleTheme} className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            {theme === 'light' ? <FaMoon className="text-yellow-300" /> : <FaSun className="text-yellow-400" />}
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-6 border-t bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Type your message..."
            />
            <button onClick={sendMessage} className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <FaPaperPlane />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={clearChat} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
              <FaTrash />
            </button>
            {isTyping && (
              <button onClick={stopGeneration} className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                <FaStop />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Message({ message }: { message: Message }) {
  const isUser = message.sender === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div className={`flex items-start ${isUser ? 'flex-row-reverse' : ''} max-w-2xl`}>
        <div className="flex-shrink-0 mr-3">
          {isUser ? (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
          ) : (
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              AI
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl shadow-md ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
          {message.sender === 'bot' ? (
            <div className="prose prose-sm dark:prose-invert max-w-none ">
            <ReactMarkdown remarkPlugins={[remarkGfm]} >
              {message.text}
            </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6 animate-fade-in">
      <div className="flex items-start max-w-2xl">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            AI
          </div>
        </div>
        <div className="p-4 rounded-2xl shadow-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
