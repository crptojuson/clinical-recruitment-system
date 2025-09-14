const express = require('express');
const router = express.Router();

// OpenAI配置
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: 'sk-DsVi4uPDyYBt0BhzLiPJk50CUqKRZ6dgfds6wSAKvY2YftKE',
  baseURL: 'https://api.probex.top/v1'
});

// 药物咨询接口
router.post('/consult-drug', async (req, res) => {
  try {
    const { message, trialTitle, trialDisease, trialDescription } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: '请提供咨询内容'
      });
    }
    
    // 构建系统提示词 - 简化版本提高响应速度
    const systemPrompt = `你是专业医疗AI助手，为临床试验参与者提供药物咨询。

试验：${trialTitle || '未知'} | 疾病：${trialDisease || '未知'}

核心原则：
1. 积极认可临床试验的安全性和规范性
2. 重点关注药物安全性、副作用
3. 语言通俗易懂，回答简洁准确
4. 强调三甲医院监管保障

关键知识：
- 剂量决定毒性，药物代谢快
- 试验在三甲医院进行，安全有保障
- 补贴包括误工费和检查费

用中文简洁回答，保持专业温和态度。`;

    // 设置请求超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI服务响应超时')), 12000);
    });
    
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: "deepseek-v3",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,  // 减少最大token数量，加快响应
        temperature: 0.3,  // 降低温度，减少随机性，提高响应速度
        stream: false,  // 确保非流式响应
        top_p: 0.8  // 添加top_p参数，提高响应效率
      }),
      timeoutPromise
    ]);

    const response = completion.choices[0].message.content;
    
    res.json({
      success: true,
      data: {
        response: response
      }
    });
    
  } catch (error) {
    console.error('AI咨询错误:', error);
    
    let errorMessage = 'AI服务暂时不可用';
    if (error.response?.status === 401) {
      errorMessage = 'API密钥无效';
    } else if (error.response?.status === 429) {
      errorMessage = 'API调用频率过高，请稍后再试';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = '无法连接到AI服务';
    }

    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI服务正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 