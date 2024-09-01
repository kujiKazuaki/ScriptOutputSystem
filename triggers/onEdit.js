/**
 * @param {Event} e - The onEdit event.
 * @see https://developers.google.com/apps-script/guides/triggers#onedite
 */
function onEdit(e) {
  // 編集された範囲の情報を取得
  const range = e.range;
  const sheet = range.getSheet();

  const validSheetName = "セッティング";
  const validCellRange = "B11";

  // 編集されたシート名と範囲を確認
  const pass1 = sheet.getName() === validSheetName; // 編集されたシート名
  const pass2 = range.getA1Notation() === validCellRange; // 編集された範囲
  if (pass1 && pass2) { // 『ボイス設定』のプルタブの値に合わせてボイスリストを設置する処理
    const editedCell = sheet.getActiveCell();
    const newValue = editedCell.getValue();
    const targetVoiceList = getTargetVoiceListFromEnvSheet(newValue);

    const [setStartRow, setStartCol] = [13, 2];
    sheet.getRange(setStartRow, setStartCol, sheet.getLastRow(), 2).clearContent();
    sheet.getRange(setStartRow, setStartCol, targetVoiceList.length, targetVoiceList[0].length).setValues(targetVoiceList);
  }
  console.log("onEdit関数にて、処理が全て終了しました")
}

/**
 * 環境シートから指定されたセット名に対応するボイスリストを取得する関数
 * 
 * @param {string} setName - 検索するセット名
 * @return {Array.<string>} - セット名に対応するボイスリスト (2次元配列)
 */
function getTargetVoiceListFromEnvSheet(setName) {
  const voiceEnvSheetName = "ボイス設定";
  const startCol_voiceSet = 3;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const envSheet = ss.getSheetByName(voiceEnvSheetName);

  const lastCol = envSheet.getLastColumn();
  const setNameList = envSheet.getRange(2, startCol_voiceSet, 1, lastCol).getValues().flat();
  const tarIdx = setNameList.findIndex(item => item === setName);

  if (tarIdx >= 0) { // 指定されたセット名が見つかった場合
    const tarCol = startCol_voiceSet + tarIdx;
    const targetValue = envSheet.getRange(4, tarCol, envSheet.getLastRow(), 2).getValues();

    return targetValue;
  } else {
    // セット名が見つからなかった場合、シートをアクティブにしてエラーログを表示
    envSheet.activate();
    errorLog(`『${voiceEnvSheetName}』シートの2行目の値と一致しません。` + "確認してください。\n" + "※半角スペースなど含まれていないかなども確認してください。", true);
  }
}