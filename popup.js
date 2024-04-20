// popup.js
// 使用模板初始化 Cookie 内容
const defaultCookies = [
  // ...
];

// 从同步存储读取cookieData
chrome.storage.sync.get(['cookieData'], function(result) {
// 如果有保存的cookieData，就使用这些数据，否则使用默认的数据
let cookies = result.cookieData || defaultCookies;
document.getElementById('cookieInput').value = JSON.stringify(cookies, null, 2);
});

// 设置 Cookie
document.getElementById('setCookies').addEventListener('click', function() {
  let cookieInput = document.getElementById('cookieInput').value;
  let cookies = JSON.parse(cookieInput);

  chrome.runtime.sendMessage({action: 'setCookies', cookies: cookies}, function(response) {
    console.log('Cookies set');
    // 保存新的cookie值到同步存储
    chrome.storage.sync.set({cookieData: cookies}, function() {
      console.log('New cookieData saved');
      // 在当前标签页打开115.com
      chrome.tabs.update({url: 'https://115.com'}, function() {
        // 等待2秒后再导入cookie
        setTimeout(function() {
          chrome.runtime.sendMessage({action: 'setCookies', cookies: cookies}, function(response) {
            console.log('Cookies imported after 2 seconds');
          });
        }, 2000); // 2000 milliseconds = 2 seconds
        // 关闭插件的窗口
        window.close();
      });
    });
  });
});


// 编辑 Cookie
document.getElementById('editCookies').addEventListener('click', function() {
  // 获取文本区域的内容
  let cookieInput = document.getElementById('cookieInput').value;
  // 将编辑后的cookie值保存到cookieData变量中
  chrome.runtime.sendMessage({action: 'setCookies', cookies: JSON.parse(cookieInput)}, function(response) {
    console.log('Cookies updated');
    // 保存新的cookie值到同步存储
    chrome.storage.sync.set({cookieData: JSON.parse(cookieInput)}, function() {
      console.log('New cookieData saved');
    });
  });
});

// 导出 Cookie
document.getElementById('exportCookies').addEventListener('click', function() {
  chrome.storage.sync.get(['cookieData'], function(result) {
    let cookies = result.cookieData || defaultCookies;
    // 创建一个隐藏的下载链接
    let a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(cookies, null, 2)], {type: 'application/json'}));
    a.download = 'cookies.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click(); // 触发下载
    document.body.removeChild(a);
  });
});

// 导入 Cookie
document.getElementById('importCookies').addEventListener('click', function() {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = function(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = function(event) {
      let cookies = JSON.parse(event.target.result);
      chrome.runtime.sendMessage({action: 'setCookies', cookies: cookies}, function(response) {
        console.log('Cookies imported');
        // 保存新的cookie值到同步存储
        chrome.storage.sync.set({cookieData: cookies}, function() {
          console.log('New cookieData saved');
          // 更新文本区域的内容
          document.getElementById('cookieInput').value = JSON.stringify(cookies, null, 2);
        });
      });
    };
    reader.readAsText(file);
  };
  input.click(); // 触发文件选择对话框
});
