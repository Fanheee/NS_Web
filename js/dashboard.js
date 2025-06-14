// DOM元素
const sidebarItems = document.querySelectorAll('.sidebar-nav li');
const tabContents = document.querySelectorAll('.tab-content');
const usersTableBody = document.getElementById('users-table-body');
const totalUsersElement = document.getElementById('total-users');
const currentUserElement = document.getElementById('current-user');
const refreshUsersBtn = document.getElementById('refresh-users');
const userSearchInput = document.getElementById('user-search');
const logoutBtn = document.getElementById('logout-btn');
const profileUsernameInput = document.getElementById('profile-username');
const profileEmailInput = document.getElementById('profile-email');
const experimentCards = document.querySelectorAll('.experiment-card');
const startExperimentBtn = document.querySelector('.start-btn');
const videoNameInput = document.getElementById('video-name');
const playBtn = document.querySelector('.play-btn');
const videoPlaceholder = document.querySelector('.video-placeholder');
const logDateInput = document.getElementById('log-date');
const logTypeSelect = document.getElementById('log-type');
const filterBtn = document.querySelector('.filter-btn');
const clearLogsBtn = document.querySelector('.clear-logs-btn');
const pageBtns = document.querySelectorAll('.page-btn');

// 当前登录用户信息
let currentUser = null;
let selectedExperiment = null;
let selectedExperimentDir = null;
let currentExperimentId = null;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已登录
    checkLoginStatus();
    
    // 初始化粒子效果
    initParticles();
    
    // 侧边栏Tab切换
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 更新激活状态
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应标签页
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                    
                    // 如果是用户列表，自动加载用户
                    if (tabId === 'users-list') {
                        loadUsers();
                    }
                    
                    // 如果是运行日志，加载日志
                    if (tabId === 'run-logs') {
                        loadLogs();
                    }
                }
            });
        });
    });
    
    // 刷新用户列表按钮
    if (refreshUsersBtn) {
        refreshUsersBtn.addEventListener('click', loadUsers);
    }
    
    // 用户搜索功能
    if (userSearchInput) {
        userSearchInput.addEventListener('input', filterUsers);
    }
    
    // 退出登录按钮
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // 添加滑动条效果
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        const valueDisplay = input.nextElementSibling;
        
        input.addEventListener('input', function() {
            if (this.id === 'epsilon') {
                valueDisplay.textContent = this.value;
            } else if (this.id === 'delta') {
                valueDisplay.innerHTML = `10<sup>-${this.value}</sup>`;
            }
        });
    });
    
    // 图表动画
    animateCharts();
    
    // 实验卡片点击事件已移至experiment-config.js中处理
    
    // 启动实验按钮
    if (startExperimentBtn) {
        startExperimentBtn.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                startExperiment();
            }
        });
    }
    
    // 视频播放按钮
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            playVideo();
        });
    }
    
    // 视频输入框回车事件
    if (videoNameInput) {
        videoNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                playVideo();
            }
        });
    }
    
    // 日志筛选按钮
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            filterLogs();
        });
    }
    
    // 清空日志按钮
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function() {
            clearLogs();
        });
    }
    
    // 分页按钮
    if (pageBtns) {
        pageBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (!this.classList.contains('active')) {
                    pageBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    loadLogs(parseInt(this.textContent));
                }
            });
        });
    }
    
    // 视频播放器控制
    initVideoPlayerControls();
});

// 检查登录状态
function checkLoginStatus() {
    // 从URL参数中获取用户信息
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    const username = urlParams.get('username');
    
    if (userId && username) {
        // 设置当前用户
        currentUser = {
            id: userId,
            username: username
        };
        
        // 更新UI
        if (currentUserElement) {
            currentUserElement.textContent = username;
        }
        
        if (profileUsernameInput) {
            profileUsernameInput.value = username;
        }
        
        loadUsers();
    } else {
        // 未登录，重定向到登录页
        window.location.href = 'index.html';
    }
}

// 加载用户列表
function loadUsers() {
    // 显示加载状态
    usersTableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="5" class="loading-message">加载用户数据中...</td>
        </tr>
    `;
    
    // 发送API请求
    fetch('http://localhost:3000/api/users')
        .then(response => {
            if (!response.ok) {
                throw new Error('获取用户列表失败');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.users) {
                renderUsersList(data.users);
                
                // 更新用户数量
                if (totalUsersElement) {
                    totalUsersElement.textContent = data.users.length;
                }
            } else {
                throw new Error(data.message || '获取用户数据失败');
            }
        })
        .catch(error => {
            usersTableBody.innerHTML = `
                <tr class="loading-row">
                    <td colspan="5" class="loading-message">加载失败: ${error.message}</td>
                </tr>
            `;
            
            console.error('Error:', error);
        });
}

// 渲染用户列表
function renderUsersList(users) {
    if (!usersTableBody) return;
    
    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="5" class="loading-message">暂无用户数据</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    users.forEach(user => {
        const date = new Date(user.createdAt).toLocaleString('zh-CN');
        
        html += `
            <tr data-id="${user.id}" data-username="${user.username}" data-email="${user.email}">
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${date}</td>
                <td>
                    <button class="action-btn edit-btn" title="编辑" onclick="editUser('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="删除" onclick="deleteUser('${user.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    usersTableBody.innerHTML = html;
}

// 筛选用户
function filterUsers() {
    const searchTerm = userSearchInput.value.toLowerCase();
    const rows = usersTableBody.querySelectorAll('tr:not(.loading-row)');
    
    rows.forEach(row => {
        const username = row.getAttribute('data-username').toLowerCase();
        const email = row.getAttribute('data-email').toLowerCase();
        
        if (username.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 编辑用户（占位函数）
function editUser(userId) {
    console.log(`编辑用户: ${userId}`);
    alert(`编辑用户功能即将推出！`);
}

// 删除用户（占位函数）
function deleteUser(userId) {
    console.log(`删除用户: ${userId}`);
    const confirmDelete = confirm(`确定要删除该用户吗？此操作不可撤销。`);
    
    if (confirmDelete) {
        alert(`删除功能即将推出！`);
    }
}

// 退出登录
function logout() {
    const confirmLogout = confirm('确定要退出登录吗？');
    if (confirmLogout) {
        window.location.href = 'index.html';
    }
}

// 粒子效果初始化
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 60,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#00f7ff'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                },
                polygon: {
                    nb_sides: 5
                }
            },
            opacity: {
                value: 0.3,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#00f7ff',
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: true,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    });
}

// 动画图表
function animateCharts() {
    // 随机生成数据并应用高度
    setInterval(() => {
        document.querySelectorAll('.chart-line').forEach(line => {
            const height = Math.random() * 70 + 30;
            line.style.height = `${height}%`;
            line.style.transition = 'height 1s ease-in-out';
        });
    }, 5000);
}

// 选择实验类型
function selectExperiment(expType, card) {
    // 确保实验类型与虚拟机中的目录名一致
    const dirMap = {
        'classifier': 'classifier',
        'privacy_noise': 'privacy',
        'privacy_query': 'privacy',
        'related_video': 'related',
        'related_web': 'related',
        'video_bandwidth': 'video_bandwidth',
        'web_bandwidth': 'web_bandwidth'
    };
    
    selectedExperiment = expType;
    selectedExperimentDir = dirMap[expType] || expType;
    
    // 更新UI
    experimentCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    
    // 启用开始按钮
    startExperimentBtn.classList.remove('disabled');
    startExperimentBtn.innerHTML = `<i class="fas fa-play"></i> 启动 ${getExperimentName(expType)} 实验`;
    
    // 更新状态信息
    const statusInfo = document.querySelector('.status-info p');
    if (statusInfo) {
        statusInfo.textContent = `准备启动 ${getExperimentName(expType)} 实验`;
    }
    
    // 添加选中样式
    card.style.borderColor = 'var(--primary-color)';
    card.style.boxShadow = '0 0 20px rgba(0, 247, 255, 0.4)';
    
    console.log(`已选择实验: ${selectedExperiment}, 目录: ${selectedExperimentDir}, 配置文件: ${getConfigFile(selectedExperiment)}.json`);
}

// 获取实验名称
function getExperimentName(expType) {
    const nameMap = {
        'classifier': 'Classifier',
        'privacy_noise': 'Privacy Noise',
        'privacy_query': 'Privacy Query',
        'related_video': 'Related Video',
        'related_web': 'Related Web',
        'video_bandwidth': 'Video Bandwidth',
        'web_bandwidth': 'Web Bandwidth'
    };
    
    return nameMap[expType] || expType;
}

// 获取配置文件
function getConfigFile(expType) {
    const configMap = {
        'classifier': 'empirical_privacy',
        'privacy_noise': 'privacy_loss_vs_noise_std',
        'privacy_query': 'privacy_loss_vs_query_num',
        'related_video': 'overhead_comparison_video',
        'related_web': 'overhead_comparison_web',
        'video_bandwidth': 'dp_interval_vs_overhead_video',
        'web_bandwidth': 'dp_interval_vs_overhead_web'
    };
    return configMap[expType] || `${expType}.json`;
}

// 启动实验
function startExperiment() {
    if (!selectedExperiment) return;
    
    // 更新UI显示正在启动
    startExperimentBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> 启动中...`;
    startExperimentBtn.disabled = true;
    
    // 获取对应的配置文件（不含.json）
    const configFile = getConfigFile(selectedExperiment);
    
    // 构建命令 - 使用虚拟机上的路径，添加nohup在后台运行
    const command = `cd /mnt/hgfs/共享文件夹/netshaper/evaluation/${selectedExperimentDir} && nohup ./run.sh --experiment='${configFile}' --config_file='configs/${configFile}.json' > experiment_log.txt 2>&1 &`;
    
    // 执行终端命令
    fetch('http://localhost:3000/api/run-command', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            command: command
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('命令执行结果:', data);
        
        // 显示实验已启动
        const statusIcon = document.querySelector('.status-icon i');
        const statusInfo = document.querySelector('.status-info p');
        
        if (statusIcon) {
            statusIcon.className = 'fas fa-cog fa-spin';
        }
        
        if (statusInfo) {
            statusInfo.textContent = `${getExperimentName(selectedExperiment)} 实验运行中`;
            statusInfo.style.color = 'var(--primary-color)';
        }
        
        startExperimentBtn.innerHTML = `<i class="fas fa-stop"></i> 成功运行`;
        startExperimentBtn.disabled = false;
        
        // 添加实验记录到日志
        addExperimentLog(selectedExperiment);
        
        // 显示成功消息
        showNotification(`实验已成功启动`, 'success');
        
        // 添加点击事件以停止实验
        startExperimentBtn.removeEventListener('click', startExperiment);
        //startExperimentBtn.addEventListener('click', stopExperiment);
    })
    .catch(error => {
        console.error('执行命令失败:', error);
        startExperimentBtn.innerHTML = `<i class="fas fa-play"></i> 启动实验`;
        startExperimentBtn.disabled = false;
        showNotification(`启动实验失败: ${error.message}`, 'error');
    });
}
// 去掉停止实验功能，这里会导致运行日志的bug。解决不了……
// 停止实验
// function stopExperiment() {
//     // 更新UI显示正在停止
//     startExperimentBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> 终止中...`;
//     startExperimentBtn.disabled = true;
    
//     // 执行终止命令 - 在Linux虚拟机上使用pkill
//     const command = 'pkill -f run.sh';
    
//     fetch('http://localhost:3000/api/run-command', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             command: command
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('终止命令执行结果:', data);
        
//         // 如果有当前实验ID，更新状态
//         if (currentExperimentId) {
//             return fetch(`http://localhost:3000/api/experiments/${currentExperimentId}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     status: 'completed'
//                 })
//             });
//         }
//     })
//     .then(response => {
//         if (response) return response.json();
//     })
//     .then(updateData => {
//         if (updateData && updateData.success) {
//             console.log('实验日志已更新:', updateData.log);
//         } else if (updateData) {
//             console.error('更新实验日志失败:', updateData.message);
//         }
        
//         // 清除当前实验ID
//         currentExperimentId = null;
        
//         // 更新UI状态
//         const statusIcon = document.querySelector('.status-icon i');
//         const statusInfo = document.querySelector('.status-info p');
        
//         if (statusIcon) {
//             statusIcon.className = 'fas fa-circle-notch fa-spin';
//         }
        
//         if (statusInfo) {
//             statusInfo.textContent = `无实验运行中`;
//             statusInfo.style.color = '';
//         }
        
//         startExperimentBtn.innerHTML = `<i class="fas fa-play"></i> 启动实验`;
//         startExperimentBtn.disabled = false;
//         startExperimentBtn.classList.add('disabled');
        
//         // 清除选中的实验
//         selectedExperiment = null;
//         experimentCards.forEach(c => {
//             c.classList.remove('selected');
//             c.style.borderColor = '';
//             c.style.boxShadow = '';
//         });
        
//         // 显示成功消息
//         showNotification(`实验已成功终止`, 'success');
        
//         // 恢复点击事件
//         //startExperimentBtn.removeEventListener('click', stopExperiment);
//         startExperimentBtn.addEventListener('click', startExperiment);
//     })
//     .catch(error => {
//         console.error('执行命令失败:', error);
//         startExperimentBtn.innerHTML = `<i class="fas fa-stop"></i> 终止运行`;
//         startExperimentBtn.disabled = false;
//         showNotification(`终止实验失败: ${error.message}`, 'error');
//     });
// }

// 添加实验记录到日志
function addExperimentLog(expType) {
    const now = new Date();
    const formattedDate = now.toLocaleString('zh-CN');
    const expName = `${getExperimentName(expType)}测试-${now.getTime()}`;
    
    // 构建日志对象
    const log = {
        name: expName,
        type: getExperimentName(expType),
        startTime: formattedDate,
        status: 'completed'
    };
    
    // 发送API请求保存日志
    fetch('http://localhost:3000/api/experiments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(log)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('实验日志已添加:', data.log);
            // 保存当前运行实验的ID，用于后续更新状态
            currentExperimentId = data.log.id;
        } else {
            console.error('添加实验日志失败:', data.message);
        }
    })
    .catch(error => {
        console.error('API请求错误:', error);
    });
}

// 加载实验日志
function loadLogs(page = 1) {
    const logsTableBody = document.getElementById('logs-table-body');
    if (!logsTableBody) return;
    
    // 显示加载状态
    logsTableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="6" class="loading-message">加载日志数据中...</td>
        </tr>
    `;
    
    // 发送API请求获取日志
    fetch('http://localhost:3000/api/experiments')
        .then(response => {
            if (!response.ok) {
                throw new Error(`服务器响应错误: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // 筛选日志
                let logs = filterLogsData(data.logs);
                
                // 分页
                const pageSize = 10;
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const pagedLogs = logs.slice(startIndex, endIndex);
                
                // 渲染日志表格
                renderLogs(pagedLogs, logsTableBody);
                
                // 更新分页按钮
                updatePagination(logs.length, pageSize, page);
            } else {
                throw new Error(data.message || '获取日志数据失败');
            }
        })
        .catch(error => {
            console.error('Error details:', error);
            logsTableBody.innerHTML = `
                <tr class="loading-row">
                    <td colspan="6" class="loading-message">加载失败: ${error.message}</td>
                </tr>
            `;
        });
}

// 筛选日志数据
function filterLogsData(logs) {
    let filteredLogs = [...logs];
    
    // 日期筛选
    if (logDateInput && logDateInput.value) {
        const filterDate = new Date(logDateInput.value).toLocaleDateString('zh-CN');
        filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.startTime).toLocaleDateString('zh-CN');
            return logDate === filterDate;
        });
    }
    
    // 类型筛选
    if (logTypeSelect && logTypeSelect.value !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.type === logTypeSelect.value);
    }
    
    return filteredLogs;
}

// 筛选日志
function filterLogs() {
    loadLogs(1); // 重新加载第一页
    
    // 重置分页按钮
    if (pageBtns) {
        pageBtns.forEach((btn, index) => {
            if (index === 0) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// 渲染日志表格
function renderLogs(logs, logsTableBody) {
    if (logs.length === 0) {
        logsTableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="6" class="loading-message">暂无日志数据</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    logs.forEach(log => {
        html += `
            <tr>
                <td>${log.id}</td>
                <td>${log.name}</td>
                <td>${log.type}</td>
                <td>${log.startTime}</td>
                <td><span class="status ${log.status}">${getStatusText(log.status)}</span></td>
                <td>
                    <button class="view-btn" data-exp-type="${log.type}" data-start-time="${log.startTime}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="download-btn"><i class="fas fa-download"></i></button>
                </td>
            </tr>
        `;
    });
    
    logsTableBody.innerHTML = html;
    
    // 添加眼睛按钮的点击事件监听器
    const viewBtns = logsTableBody.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            let expType = this.getAttribute('data-exp-type');
            const startTime = this.getAttribute('data-start-time');
            
            // 将显示名称转换为键名（如果需要的话）
            expType = convertDisplayNameToKey(expType);
            
            showPklFilePathModal(expType, startTime);
        });
    });
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'completed': '已完成',
        'running': '运行中',
        'failed': '失败'
    };
    
    return statusMap[status] || status;
}

// 更新分页
function updatePagination(totalItems, pageSize, currentPage) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const pagination = document.querySelector('.logs-pagination');
    
    if (!pagination) return;
    
    // 仅显示当前页面前后各2页
    let html = '';
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    pagination.innerHTML = html;
    
    // 重新绑定事件
    const newPageBtns = pagination.querySelectorAll('.page-btn');
    newPageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                newPageBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                loadLogs(parseInt(this.textContent));
            }
        });
    });
}

// 播放视频
function playVideo() {
    const videoName = videoNameInput.value.trim();
    
    if (!videoName) {
        showNotification('请输入视频名称', 'error');
        videoNameInput.focus();
        return;
    }
    
    // 更新UI
    videoPlaceholder.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>正在加载视频: ${videoName}</p>
    `;
    
    // 模拟视频加载
    setTimeout(() => {
        // 显示视频播放器
        videoPlaceholder.innerHTML = `
            <div class="video-playing">
                <i class="fas fa-play-circle"></i>
                <p>${videoName} (模拟播放中)</p>
            </div>
        `;
        
        showNotification(`正在播放: ${videoName}`, 'success');
    }, 1500);
}

// 初始化视频播放器控制
function initVideoPlayerControls() {
    const videoControls = document.querySelector('.video-controls');
    if (!videoControls) return;
    
    // 播放/暂停按钮
    const playButton = videoControls.querySelector('.control-button.play');
    if (playButton) {
        playButton.addEventListener('click', function() {
            this.classList.toggle('paused');
            
            if (this.classList.contains('paused')) {
                this.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
    }
    
    // 进度条点击
    const progressBar = videoControls.querySelector('.video-progress');
    if (progressBar) {
        progressBar.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const progressBarFill = this.querySelector('.progress-bar-video');
            
            if (progressBarFill) {
                progressBarFill.style.width = `${pos * 100}%`;
            }
            
            // 更新时间显示
            const timeDisplay = videoControls.querySelector('.video-time');
            if (timeDisplay) {
                const totalMinutes = Math.floor(Math.random() * 10) + 1;
                const totalSeconds = Math.floor(Math.random() * 60);
                const currentMinutes = Math.floor(totalMinutes * pos);
                const currentSeconds = Math.floor(totalSeconds * pos);
                
                timeDisplay.textContent = `${padZero(currentMinutes)}:${padZero(currentSeconds)} / ${padZero(totalMinutes)}:${padZero(totalSeconds)}`;
            }
        });
    }
    
    // 音量控制
    const volumeSlider = videoControls.querySelector('.volume-slider');
    const volumeIcon = videoControls.querySelector('.volume-control i');
    
    if (volumeSlider && volumeIcon) {
        volumeSlider.addEventListener('input', function() {
            const value = this.value;
            
            // 更新图标
            if (value == 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (value < 50) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
        });
    }
    
    // 全屏按钮
    const fullscreenButton = videoControls.querySelector('.fullscreen-button');
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function() {
            const videoContainer = document.querySelector('.video-player-container');
            if (!videoContainer) return;
            
            if (document.fullscreenElement) {
                document.exitFullscreen();
                this.innerHTML = '<i class="fas fa-expand"></i>';
            } else {
                videoContainer.requestFullscreen();
                this.innerHTML = '<i class="fas fa-compress"></i>';
            }
        });
    }
}

// 工具函数：数字前补零
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <p>${message}</p>
        <button class="close-btn"><i class="fas fa-times"></i></button>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭
    const timeout = setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // 关闭按钮
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        clearTimeout(timeout);
        closeNotification(notification);
    });
}

// 关闭通知
function closeNotification(notification) {
    notification.classList.remove('show');
    
    // 移除元素
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// 获取通知图标
function getNotificationIcon(type) {
    const iconMap = {
        'info': 'fa-info-circle',
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'error': 'fa-times-circle'
    };
    
    return iconMap[type] || iconMap.info;
}

// 清空实验日志
function clearLogs() {
    // 显示确认对话框
    if (!confirm('确定要清空所有实验日志吗？此操作不可恢复！')) {
        return;
    }
    
    // 显示加载状态
    const logsTableBody = document.getElementById('logs-table-body');
    if (logsTableBody) {
        logsTableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="6" class="loading-message">正在清空日志数据...</td>
            </tr>
        `;
    }
    
    // 发送API请求清空日志
    fetch('http://localhost:3000/api/experiments', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // 重新加载日志（现在应该是空的）
            loadLogs();
            
            // 显示成功消息
            showNotification('实验日志已清空', 'success');
        } else {
            throw new Error(data.message || '清空日志失败');
        }
    })
    .catch(error => {
        console.error('Error details:', error);
        if (logsTableBody) {
            logsTableBody.innerHTML = `
                <tr class="loading-row">
                    <td colspan="6" class="loading-message">清空失败: ${error.message}</td>
                </tr>
            `;
        }
        
        // 显示错误消息
        showNotification(`清空日志失败: ${error.message}`, 'error');
    });
}

// 显示PKL文件路径弹窗
function showPklFilePathModal(expType, startTime) {
    const pklFilePath = generatePklFilePath(expType, startTime);
    
    // 创建弹窗HTML
    const modalHtml = `
        <div class="modal-overlay" id="pkl-path-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-file-archive"></i> 实验结果文件位置</h3>
                    <button class="modal-close" onclick="closePklPathModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="file-path-container">
                        <label>PKL文件路径：</label>
                        <div class="path-display">
                            <input type="text" id="pkl-file-path" value="${pklFilePath}" readonly>
                            <button class="copy-btn" onclick="copyPklPath()">
                                <i class="fas fa-copy"></i> 复制
                            </button>
                        </div>
                    </div>
                    <div class="path-info">
                        <p><strong>实验类型：</strong> ${getExperimentTypeName(expType)}</p>
                        <p><strong>开始时间：</strong> ${startTime}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closePklPathModal()">关闭</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加弹窗到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 显示弹窗
    const modal = document.getElementById('pkl-path-modal');
    modal.style.display = 'flex';
    
    // 点击遮罩层关闭弹窗
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePklPathModal();
        }
    });
}

// 生成PKL文件路径
function generatePklFilePath(expType, startTime) {
    // 实验类型到目录的映射
    const dirMap = {
        'classifier': 'classifier',
        'privacy_noise': 'privacy',
        'privacy_query': 'privacy',
        'related_video': 'related',
        'related_web': 'related',
        'video_bandwidth': 'video_bandwidth',
        'web_bandwidth': 'web_bandwidth'
    };
    
    // 实验类型到配置文件的映射
    const configMap = {
        'classifier': 'empirical_privacy',
        'privacy_noise': 'privacy_loss_vs_noise_std',
        'privacy_query': 'privacy_loss_vs_query_num',
        'related_video': 'overhead_comparison_video',
        'related_web': 'overhead_comparison_web',
        'video_bandwidth': 'dp_interval_vs_overhead_video',
        'web_bandwidth': 'dp_interval_vs_overhead_web'
    };
    
    const dirName = dirMap[expType] || expType;
    const configName = configMap[expType] || expType;
    
    // 将时间格式转换为文件名格式 (例如: 2025/5/14 11:35:06 -> 2025-05-14_11-35)
    const timeFormatted = formatTimeForPath(startTime);
    
    return `/mnt/hgfs/共享文件夹/evaluation/${dirName}/results/${configName}(${timeFormatted})`;
}

// 格式化时间用于文件路径
function formatTimeForPath(timeString) {
    // 假设输入格式为 "2025/5/14 11:35:06"
    // 输出格式为 "2025-05-14_11-35"
    const date = new Date(timeString);
    
    if (isNaN(date.getTime())) {
        // 如果时间格式不正确，直接返回原始字符串
        return timeString.replace(/[/:]/g, '-').replace(/\s/g, '_').substring(0, 16);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}`;
}

// 获取实验类型中文名称
function getExperimentTypeName(expType) {
    const typeNames = {
        'classifier': 'Classifier',
        'privacy_noise': 'Privacy Noise',
        'privacy_query': 'Privacy Query',
        'related_video': 'Related Video',
        'related_web': 'Related Web',
        'video_bandwidth': 'Video Bandwidth',
        'web_bandwidth': 'Web Bandwidth'
    };
    
    return typeNames[expType] || expType;
}

// 将显示名称转换为键名
function convertDisplayNameToKey(displayName) {
    const nameToKeyMap = {
        'Classifier': 'classifier',
        'Privacy Noise': 'privacy_noise',
        'Privacy Query': 'privacy_query',
        'Related Video': 'related_video',
        'Related Web': 'related_web',
        'Video Bandwidth': 'video_bandwidth',
        'Web Bandwidth': 'web_bandwidth'
    };
    
    // 如果是显示名称，则转换为键名；如果已经是键名，则直接返回
    return nameToKeyMap[displayName] || displayName;
}

// 复制PKL文件路径到剪贴板
function copyPklPath() {
    const pathInput = document.getElementById('pkl-file-path');
    pathInput.select();
    pathInput.setSelectionRange(0, 99999); // 用于移动设备
    
    try {
        document.execCommand('copy');
        showNotification('路径已复制到剪贴板', 'success');
    } catch (err) {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动复制', 'error');
    }
}

// 关闭PKL文件路径弹窗
function closePklPathModal() {
    const modal = document.getElementById('pkl-path-modal');
    if (modal) {
        modal.remove();
    }
} 