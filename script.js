let isSttReady = false;
let isRecording = false;

document.addEventListener('DOMContentLoaded',()=>{
    const recordButton = document.getElementById('record-button');
    // 禁用按鈕直到STT準備好
    recordButton.disabled = true;
    recordButton.textContent = "初始化中...";
    
    async function setupSTT() {
        try {
            console.log("開始 STT 初始化...");
            Recorder = new ASRRecorder("ASR0421_70789634","Api042170789634","https://asrapi01.bronci.com.tw",false)
            // *** 假設的函數名稱和參數，你需要替換成實際的 ***
            // 可能需要傳入帳號密碼等，或它們是從全域變數讀取
            await handleInit();
            console.log("初始化完成。");

            //console.log("開始取得模型...");
            // *** 假設的函數名稱，你需要替換成實際的 ***
            //await handleGetModelList();
            //console.log("模型取得完成。");

            isSttReady = true;
            recordButton.disabled = false;
            recordButton.textContent = "🎤 開始錄音";
            console.log("STT 已準備就緒！");

        } catch (error) {
            console.error("STT 初始化或取得模型失敗:", error);
            recordButton.textContent = "STT 錯誤";
            // 可以顯示更友好的錯誤訊息給使用者
        }
    }

    // 執行STT設置
    setupSTT();

    recordButton.addEventListener('click', async () => {
        if (!isSttReady) {
            console.warn("STT 尚未準備好，無法錄音。");
            return; // 如果STT未就緒，不執行任何操作
        }
    
        if (!isRecording) {
            // --- 開始錄音 ---
            try {
                console.log("嘗試開始錄音...");
                // *** 假設的函數名稱，你需要替換成實際的 ***
                await handleStart();
                isRecording = true;
                recordButton.textContent = "⏹️ 停止錄音";
                console.log("錄音已開始。");
                // 可能需要一些視覺提示，例如按鈕變色
    
            } catch (error) {
                console.error("開始錄音失敗:", error);
                // 重置狀態或顯示錯誤
                isRecording = false; // 確保狀態正確
                recordButton.textContent = "🎤 開始錄音";
            }
        } else {
            // --- 停止錄音 ---
            try {
                console.log("嘗試停止錄音...");

                
                await Recorder.websocket.send("EOS");
                console.log("已發送 EOS 信號。");

                await handleStop();
                isRecording = false;
                recordButton.textContent = "🎤 開始錄音";
                console.log("錄音已停止。");
                // 等待結果回傳 (下一步處理)


    
            } catch (error) {
                console.error("停止錄音失敗:", error);
                 // 可能需要重置狀態或顯示錯誤
                 // 即使停止失敗，也可能需要將UI狀態改回非錄音狀態
                 isRecording = false;
                 recordButton.textContent = "🎤 開始錄音";
            }
        }
    });
    
    const sttOutputElement = document.getElementById('js-content');
    const chatInputElement = document.getElementById('textInput');
    
    if (sttOutputElement && chatInputElement) {
        const observer = new MutationObserver((mutationsList, observer) => {
            // 監聽到變化
            for(const mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const newText = sttOutputElement.textContent;
                    if (newText && newText.trim() !== "") { // 確保有內容且非空
                        console.log("MutationObserver 偵測到 STT 輸出:", newText);
                        chatInputElement.value += newText + " "; // 附加到聊天輸入框
                        chatInputElement.focus();
                        // 清空來源，避免重複觸發或累積舊內容
                        sttOutputElement.textContent = '';
                    }
                }
            }
        });

        // 設定觀察目標和選項
        const config = { childList: true, characterData: true, subtree: true };
        observer.observe(sttOutputElement, config);
        console.log("MutationObserver 已附加到 #js-content");

        // (可選) 在頁面卸載時停止觀察
        // window.addEventListener('beforeunload', () => observer.disconnect());

    } else {
        console.error("#js-content 或 #textInput 元素未找到，MutationObserver 無法設定。");
    }

});








async function initSession() {
    try {
        const requestOptions = {
            method: "POST",
            redirect: "follow"
        };

        const response = await fetch("https://retibot-247393254326.us-central1.run.app/init", requestOptions);
        const result = await response.json(); // 假設回覆是 JSON 格式
        console.log(result);

        // 顯示回覆在 bot 對話裡面
        appendMessage('bot', result.message); // 假設回覆中有 'message' 欄位

        // 獲取 session_id 的值
        const sessionId = result.session_id; // 假設回覆中有 'session_id' 欄位
        return sessionId;
    } catch (error) {
        console.error('初始化會話失敗:', error);
        appendMessage('bot', '初始化會話失敗');
        return null;
    }
}

let sessionId = null;
document.addEventListener('DOMContentLoaded', async () => {
    const sessionId = await initSession();
    if (sessionId) {
        console.log("Session 已初始化，sessionId:", sessionId);
    } else {
        console.error("Session 初始化失敗");
    }
});




    function toggleMenu(){
        const menu = document.getElementById('menu');
        menu.style.display = menu.style.display === 'block' ? 'none':'block';
    }
    
    const chat = document.getElementById('chat');
    function sendMessage(){
        const input = document.getElementById('textInput');
        const text = input.value.trim();
        if (text === '') return;
    
        appendMessage('user',text);
        input.value='';
    
        appendLoading();
        console.log(sessionId,text)
        fetch('https://retibot-247393254326.us-central1.run.app/chat',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({session_id: sessionId, message: text})
        })
        .then(res=>res.json())
        .then(data=>{
            removeLoading();
            appendMessage('bot',data.reply);
        })
        .catch(error=>{
            removeLoading();
            console.error('Error',error);
            appendMessage('bot','很抱歉，大宇宙意識斷線中。')
        });
    }
    function appendMessage(sender,text){
        const message=document.createElement('div');
        message.className=`message ${sender}`;
        if (sender === 'bot'){
            const avatar = document.createElement('div');
            avatar.className = ' avatar';
            message.appendChild(avatar);
        
            const bubble = document.createElement('div');
            bubble.className = ' bubble';
            bubble.textContent = text;
            message.appendChild(bubble);
        
        } else if (sender === 'user'){
            const bubble =document.createElement('div');
            bubble.className=' bubble';
            bubble.textContent = text;
            message.appendChild(bubble);
        }
    
        chat.appendChild(message);
        chat.scrollTop=chat.scrollHeight;
    }
    
    let loadingMessage;
    function appendLoading(){
        loadingMessage = document.createElement('div');
        loadingMessage.className = 'message bot'
    
        const avatar = document.createElement('div');
        avatar.className='avatar';
        loadingMessage.appendChild(avatar);
    
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
    
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = '<span></span><span></span><span></span>';
        
        bubble.appendChild(loading);
        loadingMessage.appendChild(bubble);
    
        chat.appendChild(loadingMessage);
        chat.scrollTop = chat.scrollHeight;
    }
    
    function removeLoading(){
        if (loadingMessage){
            chat.removeChild(loadingMessage);
            loadingMessage=null;
        }
    }

  // 版本資訊
  const VERSION = "1.0.5";
  console.log(`Demo index.html version: ${VERSION}`);

  let Recorder = null;
  let autoScroll = true;

  /**
   * 抓取 DOM
   */
    const username = "ASR0421_70789634";
    const password = "Api042170789634";
    const url = "https://asrapi01.bronci.com.tw";
    const recordFileCheckbox = false;
    const parserUrl = "";
  //const username = document.querySelector("#username");
  //const password = document.querySelector("#password");
  //const devices = document.querySelector("#devices");
  const devices = "default"
  //const url = document.querySelector("#url");
  //const parserUrl = document.querySelector("#parser");
  //const initButton = document.querySelector("#js-init-button");
  //const message = document.querySelector("#js-error-message");
  const getModelListButton = document.querySelector(
    "#js-get-model-list-button"
  );
  const startRecordBtn = document.querySelector("#js-start-record");
  const stopRecordBtn = document.querySelector("#js-stop-record");
  const websocketStatus = document.querySelector("#js-websocket-status");
  const content = document.querySelector("#js-content");
  //const modelSelect = document.querySelector("#js-model-select");
  const clearContentButton = document.querySelector(
    "#js-clear-content-button"
  );
  const autoScrollButton = document.querySelector("#js-auto-scroll");
  const audioBits = document.getElementById("js-audio-bps");
  const volumeCells = document.querySelectorAll(".volume-cell");
  //const recordFileCheckbox = document.querySelector("#js-record-file");
  const parserResult = document.querySelector("#js-parser-result");

  /**
   * 初始化 DOM 之顯示文字
   */
  //message.innerText = "Please click Initialize before start";
  //message.classList.add("blue");
  const connStatusLabel = "Connection status: ";
  const audioBpsLabel = "Audio bitrate: ";
  //websocketStatus.innerText = `${connStatusLabel} No connection`;
  //audioBits.innerText = `${audioBpsLabel} 0 Kbps`;

  /**
   * 抓取 DOM 並設定事件監聽
  
  initButton.addEventListener("click", handleInit);
  getModelListButton.addEventListener("click", handleGetModelList);
  startRecordBtn.addEventListener("click", handleStart);
  stopRecordBtn.addEventListener("click", handleStop);
  autoScrollButton.addEventListener("click", handleAutoScroll);
  clearContentButton.addEventListener("click", handleClear);
  recordFileCheckbox.addEventListener("change", handleChangeRecordFile);
  */
  /**
   * 使用代理器處理狀態
  */
  const handler = {
    set: function (obj, props, value) {
      obj[props] = value;

      if (obj.status) {
        //getModelListButton.removeAttribute("disabled");
        //startRecordBtn.removeAttribute("disabled");
        //stopRecordBtn.removeAttribute("disabled");
      } else {
        //getModelListButton.setAttribute("disabled", true);
        //startRecordBtn.setAttribute("disabled", true);
        //stopRecordBtn.setAttribute("disabled", true);
        //modelSelect.innerText = "";
      }

      if (obj.status && obj.isRecording) {
        //stopRecordBtn.removeAttribute("disabled");
        //startRecordBtn.setAttribute("disabled", true);
      } else if (obj.status && !obj.isRecording) {
        //startRecordBtn.removeAttribute("disabled");
        //stopRecordBtn.setAttribute("disabled", true);
      }
    },
  };
  const proxy = new Proxy({ status: false, isRecording: false }, handler);
  
  /**
   * 允許麥克風權限
   *
   * 此步驟只是為了獲取麥克風權限，實際操作須至 ASRRecorder.js 中執行
   */
  let tempStream = null;
  async function getUserMediaPermission() {
    tempStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });
  }

  /**
   * 創建可選擇 audio devices 列表
   */
  async function getAudioDevices() {
    if (!tempStream) {
      await getUserMediaPermission();
    }

    const audioDevices = await navigator.mediaDevices.enumerateDevices();
      
    audioDevices.forEach((device) => {
      if (device.kind === "audioinput") {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.text = device.label;
        //devices.appendChild(option);
      }
    });

    // 釋放掉 stream 因為只是一次性需獲取麥克風權限
    tempStream.getTracks().forEach((track) => track.stop());
  }
  getAudioDevices();

  /**
   * 初始化
   */
  async function handleInit() {
    //event.preventDefault();

    // 清除狀態 classes
    //message.classList.remove("red", "green", "blue");

    if (!username.value && !password.value && !url.value) {
      //message.innerText =
      //  "Please input username, password, and server URL";
      //message.classList.remove("green");
      //message.classList.add("red");
      return;
    }

    /**
     * 初始化 Recorder 參數依序為 username, password, API url, isRecord
     *
     * 請輸入提供之帳號
     * 請輸入提供之密碼
     * 請輸入提供之 API 網址
     * 請輸入是否於錄音完成後輸出錄音檔案
     */
    try {
      handleDestroy();

      Recorder = new ASRRecorder(
        username.value,
        password.value,
        url.value,
        recordFileCheckbox.checked
      );
      //message.innerText = "Initialized";
      //message.classList.add("green");
      console.log("Initialized");

      proxy.status = true;
    } catch (error) {
      //message.innerText = error;
      //message.classList.add("red");

      proxy.status = false;
    }
  }

  /**
   * 若需修改 ASR model，可抓取 ASR 所提供的 Model 訓練資料 (optional)
  
  async function handleGetModelList() {
    if (!Recorder) return;
    try {
      const { data } = await Recorder.getModelList();
    
      if (data) {
        //modelSelect.innerText = "";
        data.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.name;
          //option.innerText = item.displayName;
          if (item.isDefaultModel === 1) {
            option.setAttribute("selected", true);
          }
          modelSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
 */
  /**
   * 開始轉換聲音資料
   *
   * 重要：請使用 callback 回傳抓取翻譯結果
   */
  async function handleStart() {
    // 第一個參數為 model 若無設定 null ，則使用預設模型
    // 第二個參數為 device 若無設定請輸入 null ，則使用預設聲音設備
    // 第三個參數為 parser 的網址，若無設定則不會觸發 parser
    // 第四個參數為 callback，回傳結果
    //const options = modelSelect.options;
    //const index = modelSelect.options.selectedIndex;
    //const model = index !== -1 ? options[index].value : null;

    //const deviceIndex = devices.options.selectedIndex;
    //const deviceValue = devices.options[deviceIndex].value;
    const parserUrlValue = parserUrl.value;
    const model = "basic-model";
    const deviceValue = null;

    //websocketStatus.innerText = `${connStatusLabel} Connecting ...`;

    try {
      await Recorder.start(model, deviceValue, parserUrlValue, (data) => {
        /*if (data.type === "Parser") {
          handleRenderParserResult(data);
          return;
        }
        */
        handleRender(data);
      });
      //await setScreenLock(); // 鎖定畫面
      proxy.isRecording = true;
    } catch (error) {
      console.log(error);
      //websocketStatus.innerText = `${connStatusLabel} ${error}`;
      handleStop();
    }
  }

  /**
   * 停止轉換聲音資料
   */
  async function handleStop() {
    await Recorder.stop();
    //await releaseScreenLock(); // 釋放畫面
    handleVolumeCellColor(0);
    proxy.isRecording = false;
  }

  /**
   * 當你離開頁面時，若頁面有 keep-alive 機制，請用此函式停止轉換聲音資料及回復 ASRRecorder 初始狀態
   */
  function handleDestroy() {
    if (Recorder) Recorder.destroy();
  }

  /**
   * 渲染麥克風聲音強度
   */
  const volumeCellLength = volumeCells.length;
  const maximumValue = 60;
  const gap = maximumValue / volumeCellLength; // 60 / 24 = 2.5
  function handleVolumeCellColor(volume) {
    const dB = handleConvertDecibel(volume);
    const allVolumeCells = [...volumeCells];
    const numberOfCells = Math.round(dB / gap);

    let cellsToColored;
    if (numberOfCells >= volumeCellLength) {
      cellsToColored = allVolumeCells.slice(volumeCellLength);
    } else {
      cellsToColored = allVolumeCells.slice(
        0,
        volumeCellLength - numberOfCells
      );
    }

    for (const cell of allVolumeCells)
      cell.style.backgroundColor = "#cccccc";

    for (const cell of cellsToColored) {
      const classes = cell.classList;

      cell.style.backgroundColor = classes.contains("red")
        ? "#f56c6c"
        : classes.contains("orange")
        ? "#e6a23c"
        : "#67c23a";
    }
  }

  /**
   * 將聲音量化成分貝(dB)
   *
   * 注意：我們僅用分貝公式特性計算聲音強度與 16bits 邊界值(boundary)的關係，使用的是線性比例，並非實際的分貝
   * formula ref: https://dspillustrations.com/pages/posts/misc/decibel-conversion-factor-10-or-factor-20.html
   */
  function handleConvertDecibel(volume) {
    return -10 * Math.log10(volume);
  }

  /**
   * Demo 如何將翻譯好的資料渲染到畫面上
   */
  function handleRender(data) {
    const { code, result, status, message, bits, volume } = data;

    if (status) {
      if (status === "opened") {
        //websocketStatus.innerText = `${connStatusLabel} Connected (${message})`;
      } else if (status === "closed") {
        //websocketStatus.innerText = `${connStatusLabel} Disconnected (${message})`;
        //audioBits.innerText = `${audioBpsLabel} 0 Kbps`;
        handleStop();
      } else if (status === "bits") {
        //audioBits.innerText = `${audioBpsLabel} ${bits} Kbps`;
      } else if (status === "volume") {
        handleVolumeCellColor(volume);
      }

      return;
    }

    // 此狀態為 ASR 啟動中，可忽略
    if (code === 100 || code === 180) return;

    // 處理錯誤
    // STATUS_UNAUTHORIZED = 401;
    // BRIDGE_STATUS_IDLE_TIMEOUT = 408;
    // BRIDGE_STATUS_UNSUPPORTED_PARAMS = 415;
    // BRIDGE_STATUS_NO_RESOURCE = 486;
    // BRIDGE_STATUS_SERVER_ERROR = 500;
    // BRIDGE_STATUS_SERVER_UNREACHED = 502;
    // BRIDGE_STATUS_SERVER_ABORT = 503;
    // BRIDGE_STATUS_UNKNOWN = 599;
    const errorCode = [401, 408, 415, 486, 500, 502, 503, 599];
    if (errorCode.includes(code)) {
      //websocketStatus.innerText = `${connStatusLabel} Connected (${message})`;
      //audioBits.innerText = `${audioBpsLabel} 0 Kbps`;
      handleStop();
    }

    // 處理 204 處理完成情況
    if (code === 204) {
      handleStop();
    }

    // 此狀態為 ASR 轉換完成，並可渲染至頁面上
    if (code === 200) {
      const { segment, transcript, final } = result[0];

      const dom = document.querySelector(`[data-segment="${segment}"]`);
      console.log("1",dom) //
      if (!dom) {
        const d = document.createElement("p");
        d.dataset.segment = segment;
        d.innerText = transcript;
    
        content.appendChild(d);
        console.log("2",content) //
      } else {
        dom.innerText = transcript;
        console.log("3",dom) //
      }

      if (autoScroll) {
        // ASR output 區塊
        content.scrollTop = content.scrollHeight;
        content.animate({ scrollTop: content.scrollHeight });

        parserResult.scrollTop = parserResult.scrollHeight;
        parserResult.animate({ scrollTop: parserResult.scrollHeight });
      }
    }
  }

  /**
   * 渲染 parser 結果
   */
  function handleRenderParserResult(data) {
    const dom = document.createElement("p");
    dom.innerText = JSON.stringify(data);

    parserResult.appendChild(dom);
    console.log("4",parserResult)
  }

  /**
   * 處理 auto scroll
   */
  /*
  function handleAutoScroll() {
    autoScroll = !autoScroll;

    autoScrollButton.innerText = autoScroll
      ? "Auto scroll OFF"
      : "Auto scroll ON";
  }
*/
  /**
   * 清除 js-content 資料
   */
  function handleClear() {
    content.innerHTML = "";
    parserResult.innerHTML = "";
  }

  /**
   * 確認瀏覽器是否支援 screen wake lock
   
  function isScreenLockSupported() {
    return "wakeLock" in navigator;
  }
  */
  /**
   * 設定瀏覽器 screen lock

  let screenLock;
  async function setScreenLock() {
    if (isScreenLockSupported()) {
      try {
        screenLock = await navigator.wakeLock.request("screen");
        console.log(`screen lock ${screenLock}`);
      } catch (error) {
        console.log(error.name, error.message);
      }
    }
  }
  */
  /**
   * 釋放瀏覽器 screen lock

  async function releaseScreenLock() {
    if (typeof screenLock !== "undefined" && screenLock !== null) {
      await screenLock.release();
      console.log(`screen lock released`);
      screenLock = null;
    }
  }
   */
  /**
   * 變更 isRecord 狀態
   */
  function handleChangeRecordFile() {
    if (Recorder) {
      Recorder.setIsRecord = recordFileCheckbox.checked;
    }
  }
