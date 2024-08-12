/**
 * ポップアップメッセージを表示する関数
 * @param {string} title - ポップアップのタイトル
 * @param {string} showBody - ポップアップに表示する本文
 * @param {string|null} [option=null] - ポップアップのパターンをセット (デフォルトはOKボタンセット)
 * @return {boolean|undefined} - YES_NOボタンセットの場合、「はい」が選択されたらtrueを返す。その他の場合、undefinedを返す。
 */
function showPopup(title, showBody, option = null) {
  const ui = SpreadsheetApp.getUi();  // ユーザーインターフェースを取得
  let res;

  try {
    // オプションがYES_NOボタンセットかどうかをチェック
    if (option === "YES_NO") {
      res = ui.alert(title, showBody, ui.ButtonSet.YES_NO);  // YES_NOボタンセットのポップアップを表示
    } else {
      // OKボタンセットのポップアップを表示
      ui.alert(title, showBody, ui.ButtonSet.OK);
      return;
    }
  } catch (e) {
    ui.alert('ポップアップが閉じられました。処理はキャンセルされました。');
    return false;
  }

  // ユーザーが「はい」をクリックした場合にtrueを返す
  if (res == ui.Button.YES) {
    return true;
  } else if (res == ui.Button.NO) {
    // ユーザーが「いいえ」をクリックした場合にキャンセルメッセージを表示
    ui.alert('処理はキャンセルされました。');
    return false;
  } else if (res == ui.Button.CLOSE) {
    // ユーザーがポップアップの外側をクリックした場合に特定の処理を実行
    ui.alert('ポップアップが閉じられました。処理はキャンセルされました。');
    return false;
  }
}
