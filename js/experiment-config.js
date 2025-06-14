// 实验配置处理

// 当文档加载完毕后执行
document.addEventListener('DOMContentLoaded', function() {
    // 绑定实验卡片点击事件
    const experimentCards = document.querySelectorAll('.experiment-card');
    if (experimentCards) {
        experimentCards.forEach(card => {
            card.addEventListener('click', function() {
                const expType = this.getAttribute('data-exp');
                openExperimentConfig(expType);
            });
        });
    }
});

// 打开实验配置弹窗
function openExperimentConfig(expType) {
    // 先调用原dashboard.js中的selectExperiment函数
    const card = document.querySelector(`.experiment-card[data-exp="${expType}"]`);
    if (typeof selectExperiment === 'function' && card) {
        selectExperiment(expType, card);
    }
    
    // 创建弹窗元素
    const modal = document.createElement('div');
    modal.className = 'experiment-modal';
    
    // 根据实验类型获取标题
    const expName = getExperimentName(expType);
    
    // 设置基本弹窗内容
    modal.innerHTML = `
        <div class="experiment-modal-content">
            <div class="modal-header">
                <h3>${expName} 实验配置</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>加载配置参数中...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn">取消</button>
                <button class="apply-btn">应用配置</button>
            </div>
        </div>
    `;
    
    // 添加到文档中
    document.body.appendChild(modal);
    
    // 给关闭按钮添加事件
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 给取消按钮添加事件
    const cancelBtn = modal.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 给应用按钮添加事件
    const applyBtn = modal.querySelector('.apply-btn');
    applyBtn.addEventListener('click', () => {
        applyExperimentConfig(expType, modal);
    });
    
    // 加载实验配置参数
    loadExperimentConfig(expType, modal);
}

// 获取实验名称
function getExperimentName(expType) {
    const nameMap = {
        'classifier': 'Classifier',
        'privacy': 'Privacy',
        'related': 'Related',
        'video_bandwidth': 'Video Bandwidth',
        'web_bandwidth': 'Web Bandwidth'
    };
    
    return nameMap[expType] || expType;
}

// 加载实验配置参数
function loadExperimentConfig(expType, modal) {
    const modalBody = modal.querySelector('.modal-body');
    
    // 使用fetch获取配置文件
    if (expType === 'privacy') {
        // 对于privacy实验，有两种不同的配置，需要先选择
        modalBody.innerHTML = `
            <div class="config-type-selection">
                <h4>请选择Privacy实验配置类型：</h4>
                <div class="config-options">
                    <div class="config-option" data-config="privacy_loss_vs_noise_std">
                        <i class="fas fa-chart-line"></i>
                        <h5>隐私损失与噪声标准差关系</h5>
                        <p>研究不同噪声标准差下的隐私损失</p>
                    </div>
                    <div class="config-option" data-config="privacy_loss_vs_query_num">
                        <i class="fas fa-chart-bar"></i>
                        <h5>隐私损失与查询次数关系</h5>
                        <p>研究不同查询次数下的隐私损失</p>
                    </div>
                </div>
            </div>
        `;
        
        // 添加配置类型选择事件
        const configOptions = modalBody.querySelectorAll('.config-option');
        configOptions.forEach(option => {
            option.addEventListener('click', function() {
                const configType = this.getAttribute('data-config');
                
                // 高亮选中的选项
                configOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // 加载具体配置
                loadSpecificConfig(expType, configType, modalBody);
            });
        });
    } else if (expType === 'related') {
        // 对于related实验，也有两种不同的配置，需要先选择
        modalBody.innerHTML = `
            <div class="config-type-selection">
                <h4>请选择Related实验配置类型：</h4>
                <div class="config-options">
                    <div class="config-option" data-config="overhead_comparison_video">
                        <i class="fas fa-video"></i>
                        <h5>视频开销比较</h5>
                        <p>研究视频流量的开销比较</p>
                    </div>
                    <div class="config-option" data-config="overhead_comparison_web">
                        <i class="fas fa-globe"></i>
                        <h5>网页开销比较</h5>
                        <p>研究网页流量的开销比较</p>
                    </div>
                </div>
            </div>
        `;
        
        // 添加配置类型选择事件
        const configOptions = modalBody.querySelectorAll('.config-option');
        configOptions.forEach(option => {
            option.addEventListener('click', function() {
                const configType = this.getAttribute('data-config');
                
                // 高亮选中的选项
                configOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // 加载具体配置
                loadSpecificConfig(expType, configType, modalBody);
            });
        });
    } else {
        // 根据不同实验类型确定配置文件名
        let configFileName;
        switch(expType) {
            case 'classifier':
                configFileName = 'empirical_privacy.json';
                break;
            case 'video_bandwidth':
                configFileName = 'dp_interval_vs_overhead_video.json';
                break;
            case 'web_bandwidth':
                configFileName = 'dp_interval_vs_overhead_web.json';
                break;
            default:
                configFileName = `${expType}.json`;
        }
        
        // 其他实验类型，直接加载配置
        fetch(`/config/${expType}/${configFileName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('无法获取配置文件');
                }
                return response.json();
            })
            .then(config => {
                renderConfigForm(config, modalBody);
            })
            .catch(error => {
                modalBody.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>加载配置失败: ${error.message}</p>
                    </div>
                `;
            });
    }
}

// 加载特定配置
function loadSpecificConfig(expType, configType, modalBody) {
    modalBody.innerHTML += `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>加载具体配置参数中...</p>
        </div>
    `;
    
    // 根据实验类型和配置类型确定配置文件路径
    let configPath;
    if (expType === 'privacy') {
        // privacy实验配置文件与configType一致
        configPath = `${configType}.json`;
    } else if (expType === 'related') {
        // related实验配置文件与configType一致
        configPath = `${configType}.json`;
    } else {
        configPath = `${configType}.json`;
    }
    
    // 使用fetch获取特定配置文件
    fetch(`/config/${expType}/${configPath}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('无法获取配置文件');
            }
            return response.json();
        })
        .then(config => {
            // 移除loading
            const loading = modalBody.querySelector('.loading-spinner');
            if (loading) {
                modalBody.removeChild(loading);
            }
            
            // 添加配置表单
            const configFormContainer = document.createElement('div');
            configFormContainer.className = 'config-form-container';
            modalBody.appendChild(configFormContainer);
            
            renderConfigForm(config, configFormContainer, configType);
        })
        .catch(error => {
            modalBody.innerHTML += `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>加载配置失败: ${error.message}</p>
                </div>
            `;
        });
}

// 渲染配置表单
function renderConfigForm(config, container, configType) {
    let formHTML = '<div class="config-form">';
    
    // 根据配置对象生成表单
    for (const key in config) {
        const value = config[key];
        
        // 显示所有参数，包括路径相关参数
        formHTML += `<div class="form-group">`;
        
        if (Array.isArray(value)) {
            // 数组类型的配置项
            formHTML += `
                <label for="${key}">${formatLabel(key)}:</label>
                <div class="array-input-container">
            `;
            
            // 对于数组类型，创建多个输入框
            value.forEach((item, index) => {
                formHTML += `
                    <div class="array-input-item">
                        <input type="text" id="${key}_${index}" name="${key}[]" value="${item}">
                    </div>
                `;
            });
            
            formHTML += `
                    <button class="add-array-item" data-target="${key}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
        } else {
            // 标量类型的配置项
            formHTML += `
                <label for="${key}">${formatLabel(key)}:</label>
                <input type="text" id="${key}" name="${key}" value="${value}">
            `;
        }
        
        formHTML += `</div>`;
    }
    
    formHTML += `
        <input type="hidden" name="config_type" value="${configType || ''}">
    </div>`;
    
    container.innerHTML = formHTML;
    
    // 为添加数组项按钮添加事件
    const addButtons = container.querySelectorAll('.add-array-item');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetKey = this.getAttribute('data-target');
            const container = this.parentElement;
            const newIndex = container.querySelectorAll('.array-input-item').length;
            
            const newItem = document.createElement('div');
            newItem.className = 'array-input-item';
            newItem.innerHTML = `
                <input type="text" id="${targetKey}_${newIndex}" name="${targetKey}[]" value="0">
                <button class="remove-array-item">
                    <i class="fas fa-minus"></i>
                </button>
            `;
            
            // 插入到添加按钮之前
            container.insertBefore(newItem, this);
            
            // 为删除按钮添加事件
            const removeBtn = newItem.querySelector('.remove-array-item');
            removeBtn.addEventListener('click', function() {
                container.removeChild(newItem);
            });
        });
    });
}

// 格式化标签
function formatLabel(key) {
    // 将snake_case转换为易读的标签
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// 应用实验配置
function applyExperimentConfig(expType, modal) {
    // 获取表单数据
    const form = modal.querySelector('.config-form');
    
    if (!form) {
        showNotification('请先选择配置类型', 'warning');
        return;
    }
    
    const formData = new FormData(form);
    const configData = {};
    
    // 处理表单数据
    for (const [key, value] of formData.entries()) {
        // 处理数组
        if (key.endsWith('[]')) {
            const arrayKey = key.substring(0, key.length - 2);
            if (!configData[arrayKey]) {
                configData[arrayKey] = [];
            }
            configData[arrayKey].push(value);
        } else {
            configData[key] = value;
        }
    }
    
    // 这里可以添加保存配置到服务器的代码
    // 现在只是显示应用成功的消息
    showNotification('配置已成功应用', 'success');
    
    // 关闭弹窗
    document.body.removeChild(modal);
    
    // 更新UI，显示实验已配置
    updateExperimentUI(expType, configData.config_type);
}

// 更新实验UI状态
function updateExperimentUI(expType, configType) {
    const expCard = document.querySelector(`.experiment-card[data-exp="${expType}"]`);
    if (expCard) {
        // 更新卡片样式
        expCard.classList.add('configured');
        
        // 更新卡片内容
        const expContent = expCard.querySelector('.exp-content p');
        if (expContent) {
            if (configType) {
                if (configType === 'privacy_loss_vs_noise_std') {
                    expContent.textContent = '隐私损失与噪声标准差关系';
                } else if (configType === 'privacy_loss_vs_query_num') {
                    expContent.textContent = '隐私损失与查询次数关系';
                } else if (configType === 'overhead_comparison_video') {
                    expContent.textContent = '视频开销比较';
                } else if (configType === 'overhead_comparison_web') {
                    expContent.textContent = '网页开销比较';
                } else {
                    expContent.textContent = `已配置 - ${configType}`;
                }
            } else {
                expContent.textContent = '已配置';
            }
        }
    }
    
    // 更新启动按钮
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.classList.remove('disabled');
        startBtn.innerHTML = `<i class="fas fa-play"></i> 启动 ${getExperimentName(expType)} 实验`;
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 检查是否已经存在通知容器
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // 设置图标
    let icon;
    switch(type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        case 'error':
            icon = 'fa-times-circle';
            break;
        default:
            icon = 'fa-info-circle';
    }
    
    // 设置通知内容
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <p>${message}</p>
        <button class="close-notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加到容器
    notificationContainer.appendChild(notification);
    
    // 添加关闭按钮事件
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notificationContainer.removeChild(notification);
    });
    
    // 自动关闭
    setTimeout(() => {
        if (notification.parentElement) {
            notificationContainer.removeChild(notification);
        }
    }, 5000);
} 