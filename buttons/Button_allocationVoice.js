/**
 * アクティブシートに既に記載された台本から、ボイスを割り当てる関数
 * ※「カスタムメニュー」の「台本からボイスを割り当てる」ボタンから実行される
 */
function Button_allocationVoice() {
  const result = confirm_allocationVoice();
  if (result) {
    allocationVoice()
  }
}

/**
 * allocationVoice関数を実行するかを確認する関数
 * @return {boolean} - yesならtrue, それ以外ならfalse
 */
function confirm_allocationVoice() {
  const title = "確認画面";
  const showBody = `
  【実行するボタン名】
  台本からボイスを割り当てる

  【実行しますか？】
  アクティブシートに既に記載された台本から、
  ボイスを割り当てる関数を実行します
  `;
  const option = "YES_NO";
  return showPopup(title, showBody, option);
}

/**
 * アクティブシートの台本列(B列)に対し、ボイスを割り当てる関数
 */
function allocationVoice() {
  SetEnv();
  const validSheets = ["メイン", "コメント一覧"];

  const sheet = SpreadsheetApp.getActiveSheet()
  const sheetName = sheet.getName()
  if (!validSheets.includes(sheetName)) {
    console.log(`出力を中断します。アクティブシート：${sheetName}`)
  }

  const lastRow = sheet.getLastRow();
  const commentList = sheet.getRange(1, 2, lastRow).getValues().filter(item => item[0] !== ''); // 対象シートのB列にある値を取得する関数

  let voiceAndScriptList = getVoiceAndScriptList(DATASET.env.voice, DATASET.env.voiceRegex, commentList)
  voiceAndScriptList = splitScript(DATASET.env.scriptOutput, voiceAndScriptList) // リストを分割する関数

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const outputSheet = ss.getSheetByName(sheetName);
  outputSheet.activate() // スレッド内容を出力する瞬間をユーザーに見せるためにアクティブ化する
  setScripts(outputSheet, voiceAndScriptList)
}