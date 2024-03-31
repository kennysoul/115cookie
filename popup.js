// 使用模板初始化 Cookie 内容
const defaultCookies = [
    {
        "domain": ".115.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "CID",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": true,
        "storeId": null,
        "value": "填上你的数值"
    },
    {
        "domain": ".115.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "PHPSESSID",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": true,
        "storeId": null,
        "value": "填上你的数值"
    },
    {
        "domain": ".115.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "SEID",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": true,
        "storeId": null,
        "value": "填上你的数值"
    },
    {
        "domain": ".115.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "UID",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": true,
        "storeId": null,
        "value": "填上你的数值"
    }
  ];
  
  // 将模板的 Cookie 内容填充到文本区域
  document.getElementById('cookieInput').value = JSON.stringify(defaultCookies, null, 2);
  
  // 其他代码...
  
  // 从本地读取cookieData
  chrome.storage.local.get(['cookieData'], function(result) {
    // 如果本地有保存的cookieData，就使用本地的数据，否则使用默认的数据
    let cookies = result.cookieData || defaultCookies;
    document.getElementById('cookieInput').value = JSON.stringify(cookies, null, 2);
  });
  
  // 设置 Cookie
  document.getElementById('setCookies').addEventListener('click', function() {
    let cookieInput = document.getElementById('cookieInput').value;
    let cookies = JSON.parse(cookieInput);
  
    chrome.runtime.sendMessage({action: 'setCookies', cookies: cookies}, function(response) {
      console.log('Cookies set');
    });
  });
  
  // 编辑 Cookie
  document.getElementById('editCookies').addEventListener('click', function() {
    // 获取文本区域的内容
    let cookieInput = document.getElementById('cookieInput').value;
    // 将编辑后的cookie值保存到cookieData变量中
    chrome.runtime.sendMessage({action: 'setCookies', cookies: JSON.parse(cookieInput)}, function(response) {
      console.log('Cookies updated');
    });
  });
  
  // 导出 Cookie
  document.getElementById('exportCookies').addEventListener('click', function() {
    chrome.storage.local.get(['cookieData'], function(result) {
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
        });
      };
      reader.readAsText(file);
    };
    input.click(); // 触发文件选择对话框
  });
  
