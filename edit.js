// 默认Cookie模板
const defaultCookies = [
  {
    "domain": "115.com",
    "expirationDate": 2147483647,
    "hostOnly": true,
    "httpOnly": true,
    "name": "acw_tc",
    "path": "/",
    "sameSite": null,
    "secure": false,
    "session": false,
    "storeId": null,
    "value": "#Input your value"
  },
  {
    "domain": ".115.com",
    "expirationDate": 2147483647,
    "hostOnly": false,
    "httpOnly": false,
    "name": "115_lang",
    "path": "/",
    "sameSite": null,
    "secure": false,
    "session": false,
    "storeId": null,
    "value": "zh"
  },
  {
    "domain": ".115.com",
    "expirationDate": 2147483647,
    "hostOnly": false,
    "httpOnly": true,
    "name": "CID",
    "path": "/",
    "sameSite": null,
    "secure": false,
    "session": false,
    "storeId": null,
    "value": "#Input your value"
  },
  {
    "domain": ".115.com",
    "expirationDate": 2147483647,
    "hostOnly": false,
    "httpOnly": true,
    "name": "KID",
    "path": "/",
    "sameSite": null,
    "secure": false,
    "session": false,
    "storeId": null,
    "value": "#Input your value"
  },
  {
    "domain": ".115.com",
    "expirationDate": 2147483647,
    "hostOnly": false,
    "httpOnly": true,
    "name": "PHPSESSID",
    "path": "/",
    "sameSite": null,
    "secure": false,
    "session": false,
    "storeId": null,
    "value": "#Input your value"
  },
  {
    "domain": ".115.com",
    "expirationDate": 2147483647,
    "hostOnly": false,
    "httpOnly": true,
    "name": "SEID",
    "path": "/",
    "sameSite": null,
    "secure": false,
    "session": false,
    "storeId": null,
    "value": "#Input your value"
  },
  {
    "domain": ".115.com",
    "expirationDate": 2147483647,
    "hostOnly": false,
    "httpOnly": true,
    "name": "UID",
    "path": "/",
    "sameSite": null,
    "secure": false,
    "session": false,
    "storeId": null,
    "value": "#Input your value"
  }
];

// 计算5年后的时间戳（秒）
function getFiveYearsLaterTimestamp() {
  const now = new Date();
  const fiveYearsLater = new Date(now);
  fiveYearsLater.setFullYear(now.getFullYear() + 5);
  return Math.floor(fiveYearsLater.getTime() / 1000);
}

// 更新cookie的过期时间
function updateCookiesExpiration(cookies) {
  const expirationDate = getFiveYearsLaterTimestamp();
  for (let cookie of cookies) {
    cookie.expirationDate = expirationDate;
  }
  return cookies;
}

// 从存储中加载cookie数据
chrome.storage.sync.get(['cookieData'], function(result) {
  let cookies = result.cookieData || defaultCookies;
  document.getElementById('cookieInput').value = JSON.stringify(cookies, null, 2);
});

// 修改通知函数，只在错误时显示弹窗
function showNotification(message, isError = false) {
  if (!isError) {
    // 成功消息不显示弹窗，而是在状态区域显示
    showStatusMessage(message);
    return;
  }
  
  // 错误消息显示弹窗
  alert(message);
}

// 在按钮下方显示状态信息的函数
function showStatusMessage(message, isSuccess = true) {
  const statusElement = document.getElementById('updateStatus');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = 'status-message ' + (isSuccess ? 'success' : 'error');
    
    // 3秒后自动清除
    setTimeout(() => {
      statusElement.textContent = '';
    }, 3000);
  }
}

// 保存按钮
document.getElementById('save').addEventListener('click', function() {
  try {
    let cookieInput = document.getElementById('cookieInput').value;
    let cookies = JSON.parse(cookieInput);
    
    // 更新Cookie有效期为5年后
    cookies = updateCookiesExpiration(cookies);
    
    // 更新显示
    document.getElementById('cookieInput').value = JSON.stringify(cookies, null, 2);
    
    chrome.runtime.sendMessage({action: 'setCookies', cookies: cookies}, function(response) {
      console.log('Cookies updated');
      chrome.storage.sync.set({cookieData: cookies}, function() {
        console.log('New cookieData saved with updated expiration');
        alert('Cookies have been saved. Expiration updated to 5 years from now.');
      });
    });
  } catch (error) {
    alert('Cookie format error: ' + error.message);
  }
});

// 应用按钮 - 修改为同时执行保存和应用
document.getElementById('apply').addEventListener('click', function() {
  try {
    let cookieInput = document.getElementById('cookieInput').value;
    let cookies = JSON.parse(cookieInput);
    
    // 更新Cookie有效期为5年后
    cookies = updateCookiesExpiration(cookies);
    
    // 更新显示
    document.getElementById('cookieInput').value = JSON.stringify(cookies, null, 2);

    // 先保存到存储
    chrome.storage.sync.set({cookieData: cookies}, function() {
      console.log('New cookieData saved with updated expiration');
      
      // 再应用cookie
      chrome.runtime.sendMessage({action: 'setCookies', cookies: cookies}, function(response) {
        if (response.result === 'success') {
          console.log('Cookies successfully set');
          chrome.tabs.update({url: 'https://115.com/?cid=0&offset=0&mode=wangpan', active: true});
        } else {
          console.error('Failed to set cookies:', response.message);
        }
      });
    });
  } catch (error) {
    alert('Cookie格式错误: ' + error.message);
  }
});

// 解析原始Cookie文本的函数 - 增强版
function parseCookieText(text) {
  let result = {};
  
  // 尝试解析为JSON
  try {
    const jsonObj = JSON.parse(text);
    // 如果是数组格式的Cookie
    if (Array.isArray(jsonObj)) {
      jsonObj.forEach(cookie => {
        if (cookie.name && cookie.value) {
          result[cookie.name] = cookie.value;
        }
      });
      return result;
    }
    // 如果是对象格式
    else if (typeof jsonObj === 'object') {
      // 可能是单个cookie对象
      if (jsonObj.name && jsonObj.value) {
        result[jsonObj.name] = jsonObj.value;
        return result;
      }
      // 可能是name:value对象
      for (const key in jsonObj) {
        if (typeof jsonObj[key] === 'string') {
          result[key] = jsonObj[key];
        }
      }
      return result;
    }
  } catch (e) {
    // 如果不是JSON，继续尝试其他格式
    console.log("Not a valid JSON, trying other formats");
  }
  
  // 按行分割文本处理常规格式
  const lines = text.split(/\r?\n/);
  
  lines.forEach(line => {
    line = line.trim();
    if (!line) return; // 跳过空行
    
    // 处理HTTP头中的Cookie行
    if (line.toLowerCase().startsWith('cookie:')) {
      const cookieStr = line.substring(line.indexOf(':') + 1).trim();
      const cookiePairs = cookieStr.split(/;\s*/);
      
      cookiePairs.forEach(pair => {
        const [name, value] = pair.trim().split('=');
        if (name && value && name.trim()) {
          result[name.trim()] = value.trim();
        }
      });
      return;
    }
    
    // 处理单独的name=value格式
    const equalPos = line.indexOf('=');
    if (equalPos > 0) {
      const name = line.substring(0, equalPos).trim();
      const value = line.substring(equalPos + 1).trim();
      
      if (name && value) {
        // 移除值中可能的尾部标点或分号
        let cleanValue = value;
        if (cleanValue.endsWith(';')) {
          cleanValue = cleanValue.substring(0, cleanValue.length - 1);
        }
        result[name] = cleanValue;
      }
    }
  });
  
  return result;
}

// 更新Cookie按钮 - 优化版
document.getElementById('updateCookie').addEventListener('click', function() {
  const rawText = document.getElementById('rawCookieInput').value;
  const parsedCookies = parseCookieText(rawText);
  
  // 过滤出有效的Cookie名称
  let validKeys = Object.keys(parsedCookies).filter(key => {
    // 这里可以扩展为列出所有你认为有效的Cookie名称
    const validNames = ['uid', 'cid', 'seid', 'kid', 'phpsessid', '115_lang', 'acw_tc'];
    return validNames.includes(key.toLowerCase());
  });
  
  if (validKeys.length === 0) {
    showNotification('No valid cookie values found (UID, CID, etc.)', true);
    return;
  }
  
  // 获取当前Cookie配置
  try {
    const currentCookiesStr = document.getElementById('cookieInput').value;
    const currentCookies = JSON.parse(currentCookiesStr);
    
    // 更新Cookie
    let updated = false;
    let updatedCount = 0;
    let updatedItems = [];
    
    for (let i = 0; i < currentCookies.length; i++) {
      const cookie = currentCookies[i];
      const lowerName = cookie.name.toLowerCase();
      
      // 检查是否有匹配的Cookie名称（不区分大小写）
      for (const key of validKeys) {
        if (key.toLowerCase() === lowerName) {
          cookie.value = parsedCookies[key];
          updated = true;
          updatedCount++;
          updatedItems.push(cookie.name);
          console.log(`更新Cookie: ${cookie.name}=${parsedCookies[key]}`);
          break;
        }
      }
    }
    
    // 更新文本框和显示状态
    if (updated) {
      document.getElementById('cookieInput').value = JSON.stringify(currentCookies, null, 2);
      showStatusMessage(`Updated: ${updatedItems.join(', ')}`);
    } else {
      showNotification('No matching cookie names found', true);
    }
    
  } catch (error) {
    showNotification('Cookie format error: ' + error.message, true);
  }
});

// Reset按钮 - 恢复默认模板
document.getElementById('resetCookie').addEventListener('click', function() {
  // 展示警告信息
  const warningElement = document.getElementById('warning');
  warningElement.style.display = 'block';
  
  // 5秒后自动隐藏警告
  setTimeout(() => {
    warningElement.style.display = 'none';
  }, 5000);
  
  // 设置为默认模板
  const resetCookies = JSON.parse(JSON.stringify(defaultCookies)); // 深拷贝避免修改原模板
  
  // 更新Cookie有效期为5年后
  const updatedCookies = updateCookiesExpiration(resetCookies);
  
  // 更新到文本框
  document.getElementById('cookieInput').value = JSON.stringify(updatedCookies, null, 2);
});
