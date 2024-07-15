/**
 * トリガー有：スプレッドシート起動時(シンプルトリガー)
 * メニューバーに独自ボタンを設置する関数
 * @see - https://developers.google.com/apps-script/guides/triggers?hl=ja#onopene
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  SetMenu();
  DATASET.menu.forEach((item) => {
    const menu = ui.createMenu(item.barName);
    item.Items.forEach((button) => {
      menu.addItem(button.buttonName, button.function)
    })
    menu.addToUi();
  })
}