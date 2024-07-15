const DATASET = {
  "menu": null,
  "env": null,
}

/**
 * ↓↓↓↓↓↓ DATASET更新関数 ↓↓↓↓↓↓
 */

/**
 * DATASET.menuを更新する関数
 */
function SetMenu() {
  const setItem = [
    {
      "barName": "設定メニュー",
      "Items": [
        {
          "buttonName": "URLから台本を作成する",
          "function": "Button_createScript",
        },
        {
          "buttonName": "台本からボイスを割り当てる",
          "function": "Button_allocationVoice",
        },
      ]
    }
  ];
  DATASET.menu = setItem;
}