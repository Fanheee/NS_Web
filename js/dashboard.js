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

// 当前登录用户信息
let currentUser = null;

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
    fetch('/api/users')
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