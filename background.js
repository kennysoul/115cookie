let cookieData = null;

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'setCookies') {
    cookieData = request.cookies;
    // 清除现有cookie
    chrome.cookies.getAll({domain: '115.com'}, function(cookies) {
      for (let cookie of cookies) {
        chrome.cookies.remove({url: 'https://115.com', name: cookie.name});
      }
      // 设置新cookie
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
    sendResponse({result: 'success'});
  } else if (request.action === 'getCookies') {
    sendResponse({cookies: cookieData});
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