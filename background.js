// background.js
let cookieData = null;

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'setCookies') {
    cookieData = request.cookies;
    chrome.cookies.getAll({domain: '115.com'}, function(cookies) {
      let promiseArray = cookies.map(cookie => chrome.cookies.remove({url: 'https://115.com', name: cookie.name}));

      Promise.all(promiseArray).then(() => {
        let setPromiseArray = cookieData.map(cookie => chrome.cookies.set({
          url: 'https://115.com',
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          expirationDate: cookie.expirationDate
        }));

        Promise.all(setPromiseArray).then(() => {
          sendResponse({result: 'success'});
        }).catch(error => {
          console.error('Error setting cookies:', error);
          sendResponse({result: 'error', message: error});
        });
      }).catch(error => {
        console.error('Error removing old cookies:', error);
        sendResponse({result: 'error', message: error});
      });
    });
    return true; // 确保异步sendResponse有效
  }
});

// 自动设置cookie的逻辑也可以进行相应的错误处理和优化
chrome.cookies.onChanged.addListener(function(changeInfo) {
  if (changeInfo.cause === 'explicit' && changeInfo.cookie.domain.endsWith('115.com') && cookieData) {
    chrome.cookies.getAll({domain: '115.com'}, function(cookies) {
      let promiseArray = cookies.map(cookie => chrome.cookies.remove({url: 'https://115.com', name: cookie.name}));

      Promise.all(promiseArray).then(() => {
        let setPromiseArray = cookieData.map(cookie => chrome.cookies.set({
          url: 'https://115.com',
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          expirationDate: cookie.expirationDate
        }));

        Promise.all(setPromiseArray);
      });
    });
  }
});
