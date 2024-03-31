let cookieData = null;

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'setCookies') {
    cookieData = request.cookies;
    // 保存cookieData到本地
    chrome.storage.local.set({cookieData: cookieData}, function() {
      console.log('cookieData saved');
    });
    // 其他代码...
  } else if (request.action === 'getCookies') {
    // 从本地读取cookieData
    chrome.storage.local.get(['cookieData'], function(result) {
      sendResponse({cookies: result.cookieData || cookieData});
    });
  }
  return true; // 确保异步sendResponse有效
});

// 自动设置cookie
chrome.cookies.onChanged.addListener(function(changeInfo) {
  if (changeInfo.cause === 'explicit' && changeInfo.cookie.domain.endsWith('115.com') && cookieData) {
    // 获取所有已保存的cookie
    chrome.cookies.getAll({domain: '115.com'}, function(cookies) {
      for (let cookie of cookies) {
        chrome.cookies.remove({url: 'https://115.com', name: cookie.name});
      }
      for (let cookie of cookieData) {
        chrome.cookies.set({
          url: 'https://115.com',
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          expirationDate: cookie.expirationDate
        });
      }
    });
  }
});

// 阻止其他来源修改cookie
chrome.cookies.onChanged.addListener(function(changeInfo) {
  // 检查是否是我们关心的cookie
  if (changeInfo.cookie.domain.endsWith('115.com')) {
    // 获取我们保存的cookie值
    chrome.storage.local.get(['cookieData'], function(result) {
      let cookies = result.cookieData;
      if (cookies) {
        for (let cookie of cookies) {
          // 找到被修改的cookie
          if (cookie.name === changeInfo.cookie.name) {
            // 将cookie的值重置为我们保存的值
            chrome.cookies.set({
              url: 'https://115.com',
              name: cookie.name,
              value: cookie.value,
              domain: cookie.domain,
              path: cookie.path,
              secure: cookie.secure,
              httpOnly: cookie.httpOnly,
              expirationDate: cookie.expirationDate
            });
            break;
          }
        }
      }
    });
  }
});
