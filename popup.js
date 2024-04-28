// popup.js
// 使用模板初始化 Cookie 内容
const defaultCookies = [
  // 初始化默认的Cookie模板
];

// 从同步存储读取cookieData
chrome.storage.sync.get(['cookieData'], function(result) {
  let cookies = result.cookieData || defaultCookies;
  document.getElementById('cookieInput').value = JSON.stringify(cookies, null, 2);
});

// 设置 Cookie
document.getElementById('setCookies').addEventListener('click', function() {
  let cookieInput = document.getElementById('cookieInput').value;
  let cookies = JSON.parse(cookieInput);

  chrome.runtime.sendMessage({action: 'setCookies', cookies: cookies}, function(response) {
    if (response.result === 'success') {
      console.log('Cookies successfully set');
      chrome.tabs.update({url: 'https://115.com', active: true}, function(tab) {
        window.close(); // 关闭插件的窗口
      });
    } else {
      console.error('Failed to set cookies:', response.message);
    }
  });
});

// 编辑 Cookie
document.getElementById('editCookies').addEventListener('click', function() {
  let cookieInput = document.getElementById('cookieInput').value;
  chrome.runtime.sendMessage({action: 'setCookies', cookies: JSON.parse(cookieInput)}, function(response) {
    console.log('Cookies updated');
    chrome.storage.sync.set({cookieData: JSON.parse(cookieInput)}, function() {
      console.log('New cookieData saved');
    });
  });
});

// 导出 Cookie
document.getElementById('exportCookies').addEventListener('click', function() {
  chrome.storage.sync.get(['cookieData'], function(result) {
    let cookies = result.cookieData || defaultCookies;
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
        chrome.storage.sync.set({cookieData: cookies}, function() {
          console.log('New cookieData saved');
          document.getElementById('cookieInput').value = JSON.stringify(cookies, null, 2);
        });
      });
    };
    reader.readAsText(file);
  };
  input.click(); // 触发文件选择对话框
});
