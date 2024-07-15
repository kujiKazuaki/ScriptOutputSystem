/**
 * 例外が発生した際、ログシートに出力して例外を発生する関数
 */
function errorLog(errMSG, popupFlag = false) {
  /**
   * 出力先のシート情報とデータセットを取得する
   */
  const errorSheetName = "失敗ログ";
  const errorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(errorSheetName);
  /**
   * エラーログシートに、必要項目を出力する
   */
  insertData(errorSheet, errMSG, popupFlag);
  /**
   * 例外処理をする
   */
  throw new Error(errMSG);
}

/**
 * 指定されたシートに対して、実行時の日時を1列目に、メッセージを2列目に挿入する関数
 *
 * @param {SpreadsheetApp.Sheet} sheet - データを挿入する対象のシート。
 * @param {string} msg - 挿入するメッセージ
 * @param {boolean} popupFlag - ポップアップとしてエラーメッセージを表示するフラグ
 */
function insertData(sheet, msg, popupFlag) {
  // 実行時の日時を取得
  const now = Helper_formatDateTime(new Date());

  const setRow = 2; // メッセージを入れ込む場所
  const [startCol, endCol] = [1, 2]; // 日時, エラー内容
  sheet.insertRows(setRow);
  sheet.getRange(setRow, startCol, 1, endCol).setValues([[now, msg]]);

  if (popupFlag) {
    const title = "自動通知システムは正常に動きません";
    const showBody = msg;
    showPopup(title, showBody);
  }
}

/**
 * 日付を「YYYY/MM/DD HH:mm:ss」形式の文字列として返す関数
 *
 * @param {Date} date - フォーマットする対象の日付。
 * @return {string} フォーマットされた日付と時刻の文字列。
 */
function Helper_formatDateTime(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // 月は0から始まるため+1し、2桁にする
  const day = ('0' + date.getDate()).slice(-2); // 日を2桁にする
  const hours = ('0' + date.getHours()).slice(-2); // 時を2桁にする
  const minutes = ('0' + date.getMinutes()).slice(-2); // 分を2桁にする
  const seconds = ('0' + date.getSeconds()).slice(-2); // 秒を2桁にする

  // 「YYYY/MM/DD HH:mm:ss」形式の文字列を返す
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}