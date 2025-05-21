// DOM 元素
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');
const loginButton = document.querySelector('.action-buttons .action-button:first-child');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const registerUsername = document.getElementById('reg-username');
const registerEmail = document.getElementById('reg-email');
const registerPassword = document.getElementById('reg-password');
const registerConfirmPassword = document.getElementById('reg-confirm-password');

// 本地存储键
const USERS_STORAGE_KEY = 'netshaper_users';

// 初始化用户存储
function initUserStorage() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
    }
}

// 表单切换函数
function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    registerForm.style.animation = 'fadeInUp 0.5s ease-out forwards';
}

function showLoginForm() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    loginForm.style.animation = 'fadeInUp 0.5s ease-out forwards';
}

// 事件监听器
if (switchToRegister) {
    switchToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterForm();
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
}

if (loginButton) {
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
}

// 注册功能
document.getElementById('register').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = registerUsername.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const confirmPassword = registerConfirmPassword.value;
    
    // 表单验证
    if (!username || !email || !password || !confirmPassword) {
        showNotification('请填写所有字段', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不匹配', 'error');
        return;
    }
    
    // 显示加载中通知
    showNotification('注册中...', 'info');
    
    // 发送到服务器
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 显示成功消息
            showNotification('注册成功！请登录', 'success');
            
            // 清空表单并切换到登录界面
            registerUsername.value = '';
            registerEmail.value = '';
            registerPassword.value = '';
            registerConfirmPassword.value = '';
            showLoginForm();
        } else {
            showNotification(data.message || '注册失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('注册失败，请稍后再试', 'error');
    });
});

// 登录功能
document.getElementById('login').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // 表单验证
    if (!username || !password) {
        showNotification('请输入用户名和密码', 'error');
        return;
    }
    
    // 显示加载中通知
    showNotification('登录中...', 'info');
    
    // 发送到服务器
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 显示成功消息
            showNotification('登录成功！正在跳转...', 'success');
            
            // 跳转到仪表板页面
            setTimeout(() => {
                window.location.href = `dashboard.html?id=${data.user.id}&username=${encodeURIComponent(data.user.username)}`;
            }, 1000);
        } else {
            showNotification(data.message || '登录失败', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('登录失败，请稍后再试', 'error');
        
        // 调试用：如果服务器未启动，提供一个本地模式登录选项
        if (error.message.includes('Failed to fetch')) {
            setTimeout(() => {
                const useLocalMode = confirm('服务器似乎未启动。是否使用本地模式（仅用于演示）？');
                if (useLocalMode) {
                    redirectToDemoMode(username);
                }
            }, 1000);
        }
    });
});

// 调试用：本地模式登录（仅用于演示）
function redirectToDemoMode(username) {
    const demoId = Date.now().toString();
    window.location.href = `dashboard.html?id=${demoId}&username=${encodeURIComponent(username)}&demo=true`;
}

// 通知功能
function showNotification(message, type = 'info') {
    // 检查是否已存在通知元素
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
        </div>
    `;
    
    // 添加到文档
    document.body.appendChild(notification);
    
    // 动画效果
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// 粒子效果初始化
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
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
                value: 0.5,
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
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
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

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initUserStorage();
    initParticles();
    
    // 为输入框添加焦点效果
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // 添加CSS样式以支持通知
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            background: rgba(13, 20, 41, 0.8);
            color: white;
            z-index: 1000;
            box-shadow: 0 0 15px rgba(0, 247, 255, 0.5);
            transform: translateX(120%);
            transition: transform 0.5s ease;
            backdrop-filter: blur(10px);
            border-left: 4px solid #00f7ff;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            border-left-color: #00ff7f;
        }
        
        .notification.error {
            border-left-color: #ff0055;
        }
        
        .notification.info {
            border-left-color: #00f7ff;
        }
        
        .welcome-container {
            max-width: 600px;
            padding: 30px;
            background: rgba(13, 20, 41, 0.8);
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(0, 247, 255, 0.5);
            backdrop-filter: blur(10px);
            animation: fadeInUp 1s ease-out;
        }
        
        .welcome-container h1 {
            color: #fff;
            margin-bottom: 20px;
            text-shadow: 0 0 10px #00f7ff;
        }
        
        .welcome-container p {
            margin: 15px 0;
            font-size: 18px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .welcome-container button {
            margin-top: 20px;
            padding: 10px 25px;
            background: rgba(0, 247, 255, 0.1);
            border: 2px solid #00f7ff;
            color: white;
            font-family: 'Orbitron', sans-serif;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            transition: all 0.3s ease;
        }
        
        .welcome-container button:hover {
            background: rgba(0, 247, 255, 0.2);
            box-shadow: 0 0 15px rgba(0, 247, 255, 0.5);
        }
    `;
    document.head.appendChild(style);
    
    // 添加霓虹灯闪烁效果
    const logoText = document.querySelector('.logo-text');
    if (logoText) {
        setInterval(() => {
            logoText.style.animation = 'neonFlicker 1.5s ease-in-out';
            setTimeout(() => {
                logoText.style.animation = 'none';
            }, 1500);
        }, 5000);
    }
});

// 添加键盘快捷键
document.addEventListener('keydown', function(e) {
    // Alt + L 显示登录表单
    if (e.altKey && e.key === 'l') {
        showLoginForm();
    }
    
    // Alt + R 显示注册表单
    if (e.altKey && e.key === 'r') {
        showRegisterForm();
    }
}); 