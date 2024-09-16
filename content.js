(function () {
  "use strict";

  const buttonId = "VoiceControlChatGPTButton";
  const buttonMicSvgId = "VoiceControlChatGPTButtonSvg";
  const buttonOverWriteSvgId = "VoiceControlChatGPTOverWriteButtonSvg";

  let recognitionActive = false;
  let recognition;

  function textInput(text) {
    const parentElement = document.getElementById("prompt-textarea");
    let element = parentElement.querySelector("p");

    if (element) {
      console.log(`exists element: ${text}`);
      element.textContent = text;
    } else {
      console.log("create element");
      element = document.createElement("p");
      element.textContent = text;
      targetElement.appendChild(element);
    }
  }

  function toggleRecognition() {
    if (recognitionActive) {
      stopRecognition();
    } else {
      startRecognition();
    }
  }

  // 音声認識を開始し
  function startRecognition() {
    if (!recognition) {
      // 音声認識オブジェクトを作成
      const SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.interimResults = true;
    }

    // ボタンとアイコンの取得
    const button = document.getElementById(buttonId);
    const svgIcon = document.getElementById(buttonMicSvgId);
    console.log(svgIcon);

    // 元のスタイルを保存
    const originalBackgroundColor = button.style.backgroundColor;
    const originalColor = svgIcon.getAttribute("fill");

    // ボタンとアイコンの色を変更
    button.style.backgroundColor = "#0000FF";
    svgIcon.setAttribute("fill", "#FFFFFF");

    // 音声認識用のイベントリスナー
    let recognitionText = "";
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      const isFinal = event.results[0].isFinal;

      // デバッグ用
      console.log(result);

      recognitionText = result;
      // 音声認識結果をテキスト表示
      textInput(recognitionText);

      if (isFinal) {
        // 色を元に戻す
        button.style.backgroundColor = originalBackgroundColor;
        svgIcon.setAttribute("fill", originalColor);
        // 音声認識中のフラグをオフ
        recognitionActive = false;
      }
    };

    // 音声認識を開始
    recognition.start();
    // 音声認識中のフラグをオン
    recognitionActive = true;
  }

  function stopRecognition() {
    if (recognition && recognitionActive) {
      recognition.stop(); // 音声認識を停止
    }
  }

  function addButton() {
    if (document.getElementById(buttonId)) return;

    console.log("add button check");

    // 目的の要素のクラス名
    const targetClass = "group relative flex w-full items-center";
    const targetClasses = targetClass.split(" ");

    // MutationObserverを使って対象要素が追加されるのをチェック
    const observer = new MutationObserver((mutations, obs) => {
      const elements = document.getElementsByClassName(targetClass);
      const target = Array.from(elements).filter((el) => {
        return (
          targetClasses.every((cls) => el.classList.contains(cls)) &&
          el.classList.length === targetClasses.length
        );
      });

      // ターゲットが見つかったらボタンを追加
      if (target.length > 0) {
        const targetElement = target[0];
        const button = document.createElement("div");
        button.id = buttonId;
        button.type = "button";
        button.setAttribute("aria-label", "voice input");
        button.className =
          "ml-2 flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 focus-visible:outline-none";

        // ボタン内にSVGアイコンを追加
        button.innerHTML = `
          <svg
            id=${buttonMicSvgId}
            xmlns="http://www.w3.org/2000/svg" // SVGの名前空間
            viewBox="0 0 24 24" // 表示領域の設定
            width="24" // アイコンの幅
            height="24" // アイコンの高さ
            fill="currentColor" // デフォルトの色
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3zm-5 9a5 5 0 0010 0V5a5 5 0 10-10 0v6zm6 9v-2a7 7 0 01-7-7h-2a9 9 0 009 9v2h2v-2a9 9 0 009-9h-2a7 7 0 01-7 7v2z"
            ></path>
          </svg>
        `;

        // 音声認識を開始
        button.addEventListener("click", toggleRecognition);
        targetElement.appendChild(button); // ボタンを追加

        // 要素が見つかったら停止
        obs.disconnect();
        console.log("stop mutation observer");
      }
    });

    // ページ全体の監視を開始
    console.log("start mutation observer");
    observer.observe(document.body, {
      childList: true,
      subtree: true, // 子孫ノードも監視
    });
  }

  // ボタンがすでに存在していないか定期的にチェックし、存在しない場合にボタンを追加
  function checkAndAddButton() {
    if (!document.getElementById(buttonId)) {
      addButton();
    }
  }

  // DOMの読み込みが完了した時点とページ全体のロードが完了した時点でボタン追加
  document.addEventListener("DOMContentLoaded", addButton);
  window.addEventListener("load", addButton);

  // 定期的にボタンが追加されているかチェック
  setInterval(checkAndAddButton, 1000);
})();
