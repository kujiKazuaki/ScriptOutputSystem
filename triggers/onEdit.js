/**
 * @param {Event} e - The onEdit event.
 * @see https://developers.google.com/apps-script/guides/triggers#onedite
 */
function onEdit(e) {
  // const range = e.range;
  // const sheet = range.getSheet();
  // const editedCol = range.getColumn();
  // const value = sheet.getRange(1, editedCol).getValue();
  // const validTitle_List = ["ボイスの規定値"]

  // 編集された範囲の情報を取得
  const range = e.range;
  const sheet = range.getSheet();

  const validSheetName = "セッティング";
  const validCellRange = "B11";

  // 編集されたシート名と範囲を確認
  if (sheet.getName() === validSheetName && range.getA1Notation() === validCellRange) {
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const envSheet = ss.getSheetByName(voiceEnvSheetName);

  const lastCol = envSheet.getLastColumn();
  const setNameList = envSheet.getRange(2, 1, 1, lastCol).getValues().flat();
  const tarIdx = setNameList.findIndex(item => item === setName);

  if (tarIdx >= 0) { // 指定されたセット名が見つかった場合
    const tarCol = 1 + tarIdx;
    const targetValue = envSheet.getRange(4, tarCol, envSheet.getLastRow(), 2).getValues();

    return targetValue;
  } else {
    // セット名が見つからなかった場合、シートをアクティブにしてエラーログを表示
    envSheet.activate();
    errorLog(`『${voiceEnvSheetName}』シートの2行目の値と一致しません。` + "確認してください。\n" + "※半角スペースなど含まれていないかなども確認してください。", true);
  }
}