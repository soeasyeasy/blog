// 测试限流功能的简单脚本
// 使用 node.js 运行: node test-rate-limit.js

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/test/rate-limit',
  method: 'GET'
};

console.log('开始测试限流功能...');

let successCount = 0;
let failCount = 0;

// 发送多个请求测试限流
for (let i = 0; i < 70; i++) {
  setTimeout(() => {
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        successCount++;
        console.log(`请求 ${i + 1}: 成功 (状态码: ${res.statusCode})`);
      } else if (res.statusCode === 429) {
        failCount++;
        console.log(`请求 ${i + 1}: 被限流 (状态码: ${res.statusCode})`);
      } else {
        failCount++;
        console.log(`请求 ${i + 1}: 失败 (状态码: ${res.statusCode})`);
      }
      
      // 输出统计信息
      if (i === 69) {
        console.log('\n=== 测试结果 ===');
        console.log(`成功请求: ${successCount}`);
        console.log(`被限流请求: ${failCount}`);
        console.log(`总计请求: ${i + 1}`);
      }
    });

    req.on('error', (e) => {
      failCount++;
      console.log(`请求 ${i + 1}: 请求错误 - ${e.message}`);
    });

    req.end();
  }, i * 100); // 每100毫秒发送一个请求
}