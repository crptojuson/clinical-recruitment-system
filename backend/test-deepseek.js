const axios = require('axios');

async function testDeepSeekAI() {
  try {
    console.log('🔍 测试DeepSeek AI健康检查...');
    const healthResponse = await axios.get('http://localhost:3000/api/ai/health');
    console.log('✅ 健康检查结果:', healthResponse.data);

    console.log('\n🤖 测试DeepSeek AI咨询...');
    const consultResponse = await axios.post('http://localhost:3000/api/ai/consult-drug', {
      message: '请问这种药物的常见副作用有哪些？',
      trialTitle: '高血压新药临床试验',
      trialDisease: '高血压',
      trialDescription: '一项评估新型ACE抑制剂治疗高血压效果的临床试验'
    });
    
    console.log('✅ AI咨询结果:');
    console.log('状态:', consultResponse.data.success);
    console.log('回复:', consultResponse.data.data.response);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

console.log('🚀 开始测试DeepSeek AI功能...\n');
testDeepSeekAI(); 