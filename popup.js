// popup.js
// Initialize Cookie template
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

// 应用按钮 - 修改为同时执行保存和应用
document.getElementById('apply').addEventListener('click', function() {
  chrome.storage.sync.get(['cookieData'], function(result) {
    let cookies = result.cookieData || defaultCookies;
    
    // 更新Cookie有效期为5年后
    cookies = updateCookiesExpiration(cookies);
    
    // 先保存到存储
    chrome.storage.sync.set({cookieData: cookies}, function() {
      console.log('CookieData confirmed with updated expiration');
      
      // 再应用cookie
      chrome.runtime.sendMessage({action: 'setCookies', cookies: cookies}, function(response) {
        if (response.result === 'success') {
          console.log('Cookies successfully set');
          chrome.tabs.update({url: 'https://115.com/?cid=0&offset=0&mode=wangpan', active: true}, function(tab) {
            window.close(); // 关闭插件的窗口
          });
        } else {
          console.error('Failed to set cookies:', response.message);
        }
      });
    });
  });
});

// 编辑按钮
document.getElementById('edit').addEventListener('click', function() {
  chrome.tabs.create({
    url: 'edit.html'
  });
});

// 导出按钮
document.getElementById('export').addEventListener('click', function() {
  chrome.storage.sync.get(['cookieData'], function(result) {
    let cookies = result.cookieData || defaultCookies;
    let a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(cookies, null, 2)], {type: 'application/json'}));
    a.download = 'cookies.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});
