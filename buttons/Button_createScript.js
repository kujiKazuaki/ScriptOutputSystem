/**
 * あにまんchのURLから台本を作成するボタン関数
 */
function Button_createScriptSystem() {
  const result = confirm_createScriptSystem();
  if (result) {
    createScriptSystem()
  }
}

/**
 * createScriptSystem関数を実行するかを確認する関数
 * @return {boolean} - yesならtrue, それ以外ならfalse
 */
function confirm_createScriptSystem() {
  const title = "確認画面";
  const showBody = `
  【実行するボタン名】
  URLから台本を作成する
  
  【実行しますか？】
  あにまんchのURLからスレッド内のコメントを取得し、
  出力シートにキャラクター名・台本を出力します
  `;
  const option = "YES_NO";
  return showPopup(title, showBody, option);
}

/**
 * あにまんchのURLから台本を作成する関数
 */
function createScriptSystem() {
  /**
   * 初期設定
   */
  SetEnv() // DataSetを以下処理で正常に使用できるようにするためにセッティングする
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let baseUrl = DATASET.env.url;

  console.log("scriptOutput", DATASET.env.scriptOutput)
  console.log("url", baseUrl)
  console.log("voice", DATASET.env.voice.all)
  console.log("male", DATASET.env.voice.male)
  console.log("female", DATASET.env.voice.female)
  console.log("Regex", DATASET.env.voiceRegex.maleRegexList, DATASET.env.voiceRegex.femaleRegexList)

  /**
   * 読み込みURLからスレッド情報を取得する
   * @type {Array.<Array.<Array.<string>>>} commentList - スレッドが記載された3次元配列. １テーマごとのスレッド内容が2次元配列目で分解されている ex) [[['メインスレッド'],,,], [["サブスレッド"],,,],,,]
   */
  const commentList = parserAniman(baseUrl);

  /**
   * 各シートへの出力処理
   */
  commentList.forEach((comment, i) => {
    // ボイスとセリフが格納された2次元配列
    let voiceAndScriptList = getVoiceAndScriptList(DATASET.env.voice, DATASET.env.voiceRegex, comment)
    voiceAndScriptList = splitScript(DATASET.env.scriptOutput, voiceAndScriptList) // リストを分割する関数

    let sheetName = i === 0 ? 'メイン' : 'コメント一覧';
    const outputSheet = ss.getSheetByName(sheetName);

    outputSheet.activate() // スレッド内容を出力する瞬間をユーザーに見せるためにアクティブ化する
    setScripts(outputSheet, voiceAndScriptList)
  })
}

/**
 * 文字列に含まれる半角文字を全て全角文字に変換する関数
 * @param {string} str - 変換前の文字列
 * @return {string} - 全て全角になった文字列
 */
function Helper_changeToFullFromHalf(str) {
  return String(str).replace(/[!-~]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
  }).replace(/ /g, '　'); // 半角スペースを全角スペースに置換
}

/**
 * あにまん掲示板を対象としたスクレイピング処理関数
 * @param {string} animanURL - スクレイピング先のURL
 * @return {Array.<Array.<Array.<string>>>} - 対象URLのコメントに関するリスト
 */
function parserAniman(animanURL) {
  /**
   * 初期設定
   */
  const options = {
    'method': 'GET',
    'muteHttpExceptions': true,
    headers: {
      'Accept-Language': 'ja-JP'
    }
  };
  const encodeType = "UTF-8"; // エンコードタイプ

  // スクレイピング処理を共通化した関数
  const fetchAndProcessComments = (content, headerPair, commentPair) => {
    const headerList = Parser.data(content).from(headerPair.from).to(headerPair.to).iterate()
    const commentList = Parser.data(content).from(commentPair.from).to(commentPair.to).iterate()
    const formattedScripts = formatScripts(headerList, commentList); // コメントを整理

    console.log('formattedScripts', formattedScripts)
    return sortResponsesByNumber(formattedScripts).filter(item => item[0] !== ''); // 整理されたコメントをレス番号でソート
  };

  /**
   * 本スレッドのスクレイピング
   */
  const response = UrlFetchApp.fetch(animanURL, options); // HTTPレスポンスオブジェクト
  const content = response.getContentText(encodeType);

  // 本スレッドのコメントを処理
  let headerPair = { 'from': 'class="t_h"', 'to': '</div>' };
  let commentPair = { 'from': 'class="t_b"', 'to': '</div>' };
  const mainContents = fetchAndProcessComments(content, headerPair, commentPair);

  /**
   * サブスレッド内容のスクレイピング
   */
  headerPair = { 'from': 'class="commentheader"', 'to': '</div>' };
  commentPair = { 'from': 'class="commentbody"', 'to': '</div>' };
  const subContents = fetchAndProcessComments(content, headerPair, commentPair); // サブスレッドのコメントを処理

  /**
   * 戻り値
   */
  return [mainContents, subContents];
}

/**
 * 出力先のシートに値を出力する関数
 * @param {SpreadsheetApp.Sheet} sheet - シートDS
 * @param {Array.<Array.<string>>} commentList - 出力対象の2次元配列
 */
function setScripts(sheet, commentList) {
  // スクレイピング処理の不具合などで意図せず0要素が引数に入った場合は中断する
  if (commentList.length == 0) return

  // 他リソース確保
  const [startRow, voiceCol] = [1, 1];
  const lastRow = sheet.getLastRow();
  /**
   * シート内の特定列に値があれば、クリアにする
   */
  let sheet_range
  if (lastRow > 0) {
    sheet_range = sheet.getRange(startRow, voiceCol, lastRow, commentList[0].length) // 出力する最も右側の列までのセルをクリアにする
    sheet_range.clearContent()
  }
  /**
   * シートに引数の値を出力する
   */
  sheet_range = sheet.getRange(startRow, voiceCol, commentList.length, commentList[0].length)
  sheet_range.setValues(commentList)
  /**
   * デバッグ処理
   */
  const debug = `
  【setScripts】
  シート名：${sheet.getName()}
  ▼クリア範囲
  getRange(${startRow}, ${voiceCol}, ${lastRow}, ${commentList[0].length})
  ▼出力範囲
  getRange(${startRow}, ${voiceCol}, ${commentList.length}, ${commentList[0].length})
  `
  console.log(debug)
  console.log("commentList", commentList)
}