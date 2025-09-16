require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
require('./models'); // 加载模型关联

// 导入路由
const authRoutes = require('./routes/auth');
const trialRoutes = require('./routes/trials');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const articleRoutes = require('./routes/articles');
const aiRoutes = require('./routes/ai');

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/trials', trialRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '临床试验招募平台 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      trials: '/api/trials',
      applications: '/api/applications',
      admin: '/api/admin'
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 服务器启动成功！`);
  console.log(`📍 端口: ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📚 API文档: http://localhost:${PORT}/api`);
  console.log(`💊 健康检查: http://localhost:${PORT}/health\n`);
}); 