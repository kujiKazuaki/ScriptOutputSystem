/**
 * ポップアップメッセージを表示する関数
 * @param {string} title - ポップアップのタイトル
 * @param {string} showBody - ポップアップに表示する本文
 * @param {string|null} [option=null] - ポップアップのパターンをセット (デフォルトはOKボタンセット)
 * @returns {boolean|undefined} - YES_NOボタンセットの場合、「はい」が選択されたらtrueを返す。その他の場合、undefinedを返す。
 */
function showPopup(title, showBody, option = null) {
  const ui = SpreadsheetApp.getUi();  // ユーザーインターフェースを取得

  // オプションがYES_NOボタンセットかどうかをチェック
  if (option === "YES_NO") {
    const res = ui.alert(title, showBody, ui.ButtonSet.YES_NO);  // YES_NOボタンセットのポップアップを表示

    // ユーザーが「はい」をクリックした場合にtrueを返す
    if (res == ui.Button.YES) {
      return true;
    } else {
      // ユーザーが「いいえ」をクリックした場合にキャンセルメッセージを表示
      ui.alert('処理はキャンセルされました。');
      return false;
    }
  } else {
    // OKボタンセットのポップアップを表示
    ui.alert(title, showBody, ui.ButtonSet.OK);
  }
}