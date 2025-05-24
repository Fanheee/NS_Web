const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// 中间件
app.use(bodyParser.json());
app.use(express.static('.'));

// 用户数据文件路径
const usersFilePath = path.join(__dirname, 'data', 'users.json');
// 实验日志文件路径
const experimentFilePath = path.join(__dirname, 'data', 'experiment.json');

// 确保用户数据文件存在
function ensureUserFileExists() {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'));
    }
    
    if (!fs.existsSync(usersFilePath)) {
        fs.writeFileSync(usersFilePath, JSON.stringify({ users: [] }, null, 2));
    }
}

// 确保实验日志文件存在
function ensureExperimentFileExists() {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'));
    }
    
    if (!fs.existsSync(experimentFilePath)) {
        fs.writeFileSync(experimentFilePath, JSON.stringify({ logs: [] }, null, 2));
    }
}

// 读取用户数据
function readUsers() {
    ensureUserFileExists();
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
}

// 写入用户数据
function writeUsers(data) {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
}

// 读取实验日志数据
function readExperimentLogs() {
    ensureExperimentFileExists();
    const data = fs.readFileSync(experimentFilePath, 'utf8');
    return JSON.parse(data);
}

// 写入实验日志数据
function writeExperimentLogs(data) {
    fs.writeFileSync(experimentFilePath, JSON.stringify(data, null, 2));
}

// 注册API
app.post('/api/register', (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 验证输入
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: '所有字段都是必填的' });
        }
        
        // 读取现有用户
        const userData = readUsers();
        
        // 检查用户名是否已存在
        if (userData.users.some(user => user.username === username)) {
            return res.status(400).json({ success: false, message: '用户名已被使用' });
        }
        
        // 添加新用户 (在实际应用中应该对密码进行哈希处理)
        userData.users.push({
            id: Date.now().toString(),
            username,
            email,
            password: Buffer.from(password).toString('base64'),
            createdAt: new Date().toISOString()
        });
        
        // 保存用户数据
        writeUsers(userData);
        
        res.status(201).json({ success: true, message: '注册成功' });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 登录API
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码是必填的' });
        }
        
        // 读取用户数据
        const userData = readUsers();
        
        // 查找用户
        const user = userData.users.find(user => user.username === username);
        
        // 验证用户和密码
        if (!user || Buffer.from(password).toString('base64') !== user.password) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
        
        // 返回用户信息 (不含密码)
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ 
            success: true, 
            message: '登录成功',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取所有用户API (仅管理员可用，实际应用需要添加身份验证)
app.get('/api/users', (req, res) => {
    try {
        const userData = readUsers();
        
        // 移除密码字段
        const usersWithoutPasswords = userData.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        
        res.json({ success: true, users: usersWithoutPasswords });
    } catch (error) {
        console.error('获取用户错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 获取实验日志API
app.get('/api/experiments', (req, res) => {
    try {
        const logData = readExperimentLogs();
        res.json({ success: true, logs: logData.logs });
    } catch (error) {
        console.error('获取实验日志错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 添加实验日志API
app.post('/api/experiments', (req, res) => {
    try {
        const newLog = req.body;
        
        // 验证输入
        if (!newLog.name || !newLog.type || !newLog.startTime) {
            return res.status(400).json({ success: false, message: '缺少必要的日志信息' });
        }
        
        // 读取现有日志
        const logData = readExperimentLogs();
        
        // 生成新ID
        const newId = logData.logs.length > 0 ? Math.max(...logData.logs.map(log => log.id)) + 1 : 1;
        newLog.id = newId;
        
        // 确保不包含结束时间字段
        if (newLog.endTime) {
            delete newLog.endTime;
        }
        
        // 添加新日志
        logData.logs.unshift(newLog);
        
        // 保存日志数据
        writeExperimentLogs(logData);
        
        res.status(201).json({ success: true, message: '实验日志添加成功', log: newLog });
    } catch (error) {
        console.error('添加实验日志错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 更新实验日志状态API
app.put('/api/experiments/:id', (req, res) => {
    try {
        const logId = parseInt(req.params.id);
        const { status } = req.body;
        
        // 读取现有日志
        const logData = readExperimentLogs();
        
        // 查找日志
        const logIndex = logData.logs.findIndex(log => log.id === logId);
        
        if (logIndex === -1) {
            return res.status(404).json({ success: false, message: '未找到该实验日志' });
        }
        
        // 更新日志状态
        if (status) logData.logs[logIndex].status = status;
        
        // 保存日志数据
        writeExperimentLogs(logData);
        
        res.json({ success: true, message: '实验日志状态更新成功', log: logData.logs[logIndex] });
    } catch (error) {
        console.error('更新实验日志状态错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 清空实验日志API
app.delete('/api/experiments', (req, res) => {
    try {
        // 清空日志数据
        writeExperimentLogs({ logs: [] });
        
        res.json({ success: true, message: '实验日志已清空' });
    } catch (error) {
        console.error('清空实验日志错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 启动服务器
app.listen(port, () => {
    ensureUserFileExists();
    ensureExperimentFileExists();
    console.log(`服务器运行在 http://localhost:${port}`);
}); 