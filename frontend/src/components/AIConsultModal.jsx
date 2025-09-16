import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, AlertCircle, Heart, Clock, Loader } from 'lucide-react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const AIConsultModal = ({ isOpen, onClose, trial }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 预设问题
  const presetQuestions = [
    {
      icon: AlertCircle,
      text: `${trial?.title || '这个药物'}有什么副作用？`,
      color: 'text-red-600 bg-red-50 hover:bg-red-100'
    },
    {
      icon: Heart,
      text: `参与${trial?.title || '这个试验'}对身体有什么影响？`,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // 重置对话
      setMessages([{
        type: 'ai',
        content: `您好！我是AI医疗助手。我可以帮您了解"${trial?.title || '该试验'}"的相关信息，包括药物副作用、试验影响等。请选择下面的问题或直接提问。`,
        timestamp: new Date()
      }]);
      setInputMessage('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, trial]);

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 添加15秒超时机制
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时')), 15000)
      );
      
      const response = await Promise.race([
        aiAPI.consultDrug({
          message: message,
          trialTitle: trial?.title,
          trialDisease: trial?.disease,
          trialDescription: trial?.description
        }),
        timeoutPromise
      ]);

      const aiMessage = {
        type: 'ai',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI咨询失败:', error);
      const errorMessage = {
        type: 'ai',
        content: '抱歉，AI咨询服务暂时不可用，请稍后再试。如有紧急问题，建议直接咨询医生。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('AI咨询失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handlePresetQuestion = (question) => {
    sendMessage(question);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center min-w-0 flex-1 mr-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">AI药物咨询</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">关于：{trial?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 对话区域 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 sm:gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              <div className={`max-w-[80%] sm:max-w-[70%] ${
                message.type === 'user' ? 'text-right' : ''
              }`}>
                <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                    : 'bg-gray-50 text-gray-900 border'
                }`}>
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="bg-gray-50 border p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-gray-600 text-sm sm:text-base">AI正在思考中...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 预设问题 */}
        {messages.length <= 1 && (
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">常见问题：</p>
            <div className="grid grid-cols-1 gap-2">
              {presetQuestions.map((question, index) => {
                const IconComponent = question.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handlePresetQuestion(question.text)}
                    className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-colors ${question.color}`}
                    disabled={isLoading}
                  >
                    <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-left">{question.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="p-3 sm:p-6 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="输入您的问题..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 sm:gap-2"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base">发送</span>
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI提供的信息仅供参考，具体医疗问题请咨询专业医生
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIConsultModal;