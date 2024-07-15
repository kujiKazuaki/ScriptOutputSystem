/**
 * 『セッティング』シートに含まれる値からスレッド内のコメントを取得し、出力対象シートにキャラクター名と台本をそれぞれ出力する関数
 * ※「カスタムメニュー」の「台本を作成する」ボタンから実行される
 */
function Button_createScript() {
  const title = "確認画面"
  const showBody = `
  【実行するボタン名】
  台本を作成する
  
  【実行しますか？】
  『セッティング』シートに含まれる値からスレッド内のコメントを取得し、
  出力対象シートにキャラクター名と台本をそれぞれ出力します
  `
  const option = "ui.ButtonSet.YES_NO"
  const result = showPopup(title, showBody, option)
  console.log(result)
  if (result) {
    createScript()
  }
}

/**
 * 『セッティング』シートに含まれる値からスレッド内のコメントを取得し、出力対象シートにキャラクター名と台本をそれぞれ出力する関数
 * @YMMと連携させて使用する際の注意点
 * ▼『セッティング』シートにて
 * ・１行目の値は必ず意図する値であるべき
 * ・キャラクター設定で、「キャラクター名」の値とymm_CharacterName_Listの要素の名称は必ず一緒にする必要がある
 */
function createScript() {
  /**
   * リソース確保
   * シート情報 & リソースの初期化に関する初期設定
   * 
   * @type {SpreadsheetApp.Spreadsheet} ss - スプレッドシート情報
   */
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  Set_outputForm(ss) // DataSetを以下処理で正常に使用できるようにするためにセッティングする
  /**
   * リソース確保
   * セッティングシートから必要情報を取得
   * 
   * @type {string} setSheetName - セッティングシートの名前
   * @type {DataSet.Sheets} sheetsDS - Sheetsオブジェクト
   * @type {number} settingDS_Idx - セッティングシートオブジェクトが格納されているインデックス番号
   * @type {Object} setDS - セッティングオブジェクト
   * @type {Array.<Object>} ymm_Character_List - ボイスと性別が格納されたリスト ex) [ { name: '動画1:霊夢', gender: '女性' },,,,]
   */
  const setSheetName = "セッティング"
  const sheetsDS = DataSet.Sheets
  const settingDS_Idx = sheetsDS.Items.findIndex((item) => item.sheetName === setSheetName)
  const setDS = sheetsDS.Items[settingDS_Idx]
  const { vgPair: ymm_Character_List } = setDS
  /**
   * リソース確保
   * スクレイピングDSから必要情報を取得する
   * 
   * @type {string} readURL - スクレイピング元のURL ex) http://aaieba.livedoor.biz/archives/61226213.html
   * @type {Object} targetSite_DS - スクレイピング元のDS ex) { name: 'ああ言えばFORYOU!!',  url: /https?:\/\/aaieba.livedoor\.biz\/archives\//,  readPages: 1 }
   */
  const { readURL, validWebSite } = DataSet.Scraping
  const { targetSite_DS } = validWebSite
  /**
   * 読み込みURLからスレッド情報を取得する
   * @type {Array.<Array.<Array.<string>>>} thread_List - スレッドが記載された3次元配列. １テーマごとのスレッド内容が2次元配列目で分解されている ex) [[['メインスレッド'],,,], [["サブスレッド"],,,],,,]
   */
  const thread_List = getParserThread(readURL, targetSite_DS) // 読み込みURLからスレッド情報を全て取得する関数の実行 ※『台本作成／スクレイピング』参照
  /**
   * 各シートへの出力処理
   */
  const sheetNamePlug = "出力対象シート"
  thread_List.forEach((thread, i) => {
    /**
     * ランダムにキャラを入れ込む
     * @type {Array.<Object>} ymm_Character_List - [ { name: '2:ゆっくり魔理沙', gender: '女性' },  { name: '3:ずんだもん', gender: '女性' },, ]
     * @type {Array.<Array.<string>>} set_thread - 出力する二次元配列 ex) [[ '8:妖夢', '基本人間舐めてるから…' ], [],,,]
     * @type {DataSet.Sheets.Items.element} ds - DS_シートオブジェクト
     * @type {SpreadsheetApp.Sheet} outputSheet - シートオブジェクト
     */
    let set_thread = getRamdomVoice(ymm_Character_List, thread)
    set_thread = split_Script(set_thread) // リストを分割する関数

    // 出力先シートのDSを特定する
    const fullNum = SO.changeToFull_FromHalf(i + 1) // 半角数字を全角数字にしてシート名のフォーマットに合わせる
    const tarIdx = DataSet.Sheets.Items.findIndex((item) => item.sheetName === (sheetNamePlug + fullNum))
    const outputSheet = ss.getSheetByName(DataSet.Sheets.Items[tarIdx].sheetName)

    outputSheet.activate() // スレッド内容を出力する瞬間をユーザーに見せるためにアクティブ化する
    DataSet.Sheets.Items[tarIdx].sheetInfo = outputSheet // 対象DSの更新

    // 台本の出力
    SO.setScripts(DataSet.Sheets.Items[tarIdx], set_thread)
  })
}

/**
 * 読み込みURLからスレッド情報を全て取得する関数
 * @param {string} target_URL - スクレイピング先のURL
 * @param {Object} siteDS - 読み込みURLに対する情報が格納されたオブジェクト
 * @return {Array.<Array.<string>>} - スレッド情報
 */
function getParserThread(target_URL, siteDS) {
  console.warn("siteDS", siteDS, target_URL)
  const result_thread_List = [[], []] // [["メイン"], ["サブ"]]]
  const { name, readPages } = siteDS
  console.log(target_URL, siteDS)
  for (let i = 1; i <= readPages; i++) {
    let threads
    switch (name) {
      case "あにまん掲示板":
        console.warn(`あにまん掲示板の${i}ページ目を実行しています`)
        threads = parser_Animan(target_URL, i, siteDS)
        result_thread_List[0] = threads[0]
        result_thread_List[1] = threads[1]
        break
      case "ねいろ速報":
        console.warn(`ねいろ速報の${i}ページ目を実行しています`)
        threads = parser_Neiro(target_URL, i, siteDS)
        console.log(threads)
        result_thread_List[0] = threads[0]
        result_thread_List[1] = threads[1]
        break
      case "ああ言えばFORYOU!!":
        console.warn(`ああ言えばFORYOU!!の${i}ページ目を実行しています`)
        threads = parser_Aaieba(target_URL, i, siteDS)
        console.log(threads)
        result_thread_List[0] = threads[0]
        if (threads[1]) {
          result_thread_List[1] = threads[1]
        }
        break
      default:
        throw new Error("開発者の意図するURLではありません")
    }
  }
  return result_thread_List
}

/**
 * あにまん掲示板を対象としたスクレイピング処理関数
 * @param {string} animanURL - スクレイピング先のURL
 * @param {number} page - ページ数
 * @param {Object.<string>} siteDS - スクレイピング処理をする上で必要になるオブジェクト
 * @return {Array.<Array.<Array.<string>>>} - 対象URLのコメントに関するリスト
 */
function parser_Animan(animanURL, page, siteDS) {
  console.log("あにまん掲示板を対象としたスクレイピング処理")
  console.log(animanURL, page, siteDS)
  /**
   * 初期設定
   * HTTPレスポンスに関するリソース確保
   * 
   * @type {Array.<Array.<Array.<string>>>} result_threads - 戻り値となる配列
   * @type {Object} options - パーサーオプションオブジェクト
   * @type {string} encodeType - エンコードタイプ
   * @type {UrlFetchApp.HTTPResponse} response - HTTPレスポンスオブジェクト
   *  @see - https://developers.google.com/apps-script/reference/url-fetch/http-response?hl=ja
   * @type {UrlFetchApp.HTTPResponse.getContent} content - HTTP レスポンスの未加工のバイナリ コンテンツ
   */
  const options = {
    'method': 'GET',
    'muteHttpExceptions': true,
    headers: {
      'Accept-Language': 'ja-JP'
    }
  }
  const encodeType = "utf-8"
  const siteURL = `${animanURL}`
  let response = UrlFetchApp.fetch(siteURL, options)
  let content = response.getContentText(encodeType)
  /**
   * 処理内容
   * スクレイピングにより、メインスレッド内容を取得する
   */
  let content_AllThread = Parser.data(content).from('class="resnum"').to('</div').iterate() // スレッド自体に書き込んだコメントの取得
  content_AllThread = Parser.data(content).from('class="t_b"').to('</div').iterate();
  let regex_AllThread = {
    "start": />([ぁ-んァ-ン一-龠]+)/, // 抽出の開始にあたる正規表現
    "res": [/>&gt;&gt;(\d+)/g], // 返信にあたる正規表現
  }
  let regex_OneThread = {
    "threadNum": />(.*?)<\/span>/g, // スレッド番号
    "threadName": /<span class="resname">(.*?)<\/span>/g, // スレッド名
    "threadDate": /<span class="resdate">(.*?)<\/span>/g, // スレッド日
  }
  DataSet.Scraping.target.content_AllThread = content_AllThread
  DataSet.Scraping.target.regex_AllThread = regex_AllThread
  DataSet.Scraping.target.regex_OneThread = regex_OneThread

  content_AllThread = proThread(DataSet.Scraping.target)
  content_AllThread = sortThread_ByResnum(content_AllThread)
  /**
   * 処理内容
   * スクレイピングにより、サブスレッド内容を取得する
   */
  let content_SubThread = Parser.data(content).from('class="commentnumber"').to('</div').iterate();
  content_SubThread = Parser.data(content).from('class="commentbody"').to('</div').iterate();
  regex_AllThread = {
    "start": />([ぁ-んァ-ン一-龠]+)/,
    "res": [/>&gt;&gt;(\d+)/g],
  }
  regex_OneThread = {
    "threadNum": />(.*?)<\/span>/g, // スレッド番号
    "threadName": /<span class="commentname">(.*?)<\/span>/g, // スレッド名
    "threadDate": /<span class="commentdate">(.*?)<\/span>/g, // スレッド日
  }
  DataSet.Scraping.target.content_AllThread = content_SubThread
  DataSet.Scraping.target.regex_AllThread = regex_AllThread
  DataSet.Scraping.target.regex_OneThread = regex_OneThread
  content_SubThread = proThread(DataSet.Scraping.target)
  content_SubThread = sortThread_ByResnum(content_SubThread)
  /**
   * 戻り値
   */
  return [content_AllThread, content_SubThread]
}

/**
 * ねいろ速報を対象としたスクレイピング処理関数
 * @param {string} neiroURL - スクレイピング先のURL
 * @param {number} page - ページ数
 * @param {Object.<string>} siteDS - スクレイピング処理をする上で必要になるオブジェクト
 * @return {Array.<Array.<Array.<string>>>} - 対象URLのコメントに関するリスト
 */
function parser_Neiro(neiroURL, page, siteDS) {
  console.log("ねいろ速報を対象としたスクレイピング処理")
  console.log(neiroURL, page, siteDS)
  /**
   * 初期設定
   * HTTPレスポンスに関するリソース確保
   * 
   * @type {Array.<Array.<Array.<string>>>} result_threads - 戻り値となる配列
   * @type {Object} options - パーサーオプションオブジェクト
   * @type {string} encodeType - エンコードタイプ
   * @type {UrlFetchApp.HTTPResponse} response - HTTPレスポンスオブジェクト
   *  @see - https://developers.google.com/apps-script/reference/url-fetch/http-response?hl=ja
   * @type {UrlFetchApp.HTTPResponse.getContent} content - HTTP レスポンスの未加工のバイナリ コンテンツ
   */
  const options = {
    'method': 'GET',
    'muteHttpExceptions': true,
    headers: {
      'Accept-Language': 'ja-JP'
    }
  }
  const encodeType = "utf-8"
  const siteURL = `${neiroURL}`
  let response = UrlFetchApp.fetch(siteURL, options)
  let content = response.getContentText(encodeType)
  /**
   * 処理内容
   * スクレイピングにより、メインスレッド内容を取得する
   */
  let content_AllThread = Parser.data(content).from('<div  class="t_b"').to('</b></span></span></div><br /><br />').iterate() // スレッド自体に書き込んだコメントの取得
  let result = []
  let replaceList = [
    {
      "regex": /名前：ねいろ速報&nbsp;&nbsp;\d+/g,
      "changeStr": ""
    },
    {
      "regex": />>>\d+$/g,
      "changeStr": "",
    },
    {
      "regex": /if\(typeof\(adingoFluct\).*?\}\);。/gs,
      "changeStr": "",
    },
  ]
  let res_regex = /><b>&gt;&gt;(\d+)/g
  for (let i = 0; i < content_AllThread.length; i++) {
    const allThread = content_AllThread[i]

    const match = allThread.match(res_regex)
    let matchStr = ""
    if (match) {
      matchStr = match[0] + "\n"
    }
    let rStr = SO.removeHtmlTag(allThread + matchStr, />([ぁ-んァ-ン一-龠]+)/, [/<b>&gt;&gt;(\d+)/g])
    replaceList.forEach((item) => {
      rStr = rStr.replace(item.regex, item.changeStr)
    })
    let lines = rStr.split('\n');
    if (lines.length >= 10) { break }
    result.push([rStr])
  }
  content_AllThread = result
  /**
   * 処理内容
   * スクレイピングにより、サブスレッド内容を取得する
   */
  result = []
  replaceList = [
    {
      "regex": /[\t\s]*/g,
      "changeStr": ""
    },
    {
      "regex": /(>>\d+)>。\d+。/g,
      "changeStr": "$1\n",
    },
  ]
  let content_SubThread = Parser.data(content).from('class="comment-body"').to('</li>').iterate();
  res_regex = /&gt;&gt;(\d+)/g
  for (let i = 0; i < content_SubThread.length; i++) {
    const subThread = content_SubThread[i]
    const match = subThread.match(res_regex)
    let matchStr = ""
    if (match) {
      matchStr = ">>" + match[0].replace(res_regex, "$1") + "\n"
    }
    let rStr = SO.removeHtmlTag(matchStr + subThread, />([ぁ-んァ-ン一-龠]+)/, [/><b>&gt;&gt;(\d+)/g])
    replaceList.forEach((item) => {
      rStr = rStr.replace(item.regex, item.changeStr)
    })
    if (rStr != "") {
      result.push([rStr])
    }
  }
  content_SubThread = result
  /**
   * 戻り値
   */
  return [content_AllThread, content_SubThread]
}

/**
 * ああ言えばFORYOU!!を対象としたスクレイピング処理関数
 * @param {string} aaiebaURL - スクレイピング先のURL
 * @param {number} page - ページ数
 * @param {Object.<string>} siteDS - スクレイピング処理をする上で必要になるオブジェクト
 * @return {Array.<Array.<Array.<string>>>} - 対象URLのコメントに関するリスト
 */
function parser_Aaieba(aaiebaURL, page, siteDS) {
  console.log("parser_Aaieba", aaiebaURL, page, siteDS)
  /**
   * リソース確保
   * HTTPレスポンスの設定
   * 
   * @type {Array.<Array.<Array.<string>>>} result_threads - 戻り値となる配列
   * @type {Object} options - パーサーオプションオブジェクト
   * @type {string} encodeType - エンコードタイプ
   * @type {UrlFetchApp.HTTPResponse} response - HTTPレスポンスオブジェクト
   *  @see - https://developers.google.com/apps-script/reference/url-fetch/http-response?hl=ja
   * @type {UrlFetchApp.HTTPResponse.getContent} content - HTTP レスポンスの未加工のバイナリ コンテンツ
   */
  const options = {
    'method': 'GET',
    'muteHttpExceptions': true,
    headers: {
      'Accept-Language': 'ja-JP'
    }
  }
  const encodeType = "utf-8"
  const siteURL = `${aaiebaURL}`
  const response = UrlFetchApp.fetch(siteURL, options)
  const content = response.getContentText(encodeType)
  /**
   * 処理内容
   * スクレイピングにより、メインスレッド内容を取得する
   */
  let content_AllThread = Parser.data(content).from('class="t_b').to('</div><br />').iterate() // スレッド自体に書き込んだコメントの取得
  /**
   * リソース確保1
   * 各スレッドごとに文章を切り分ける為に必要な設定
   * 
   * @type {Array.}
   * @type {string} res_regex - 返信に当たる文字列にヒットする正規表現 ex) >>23
   * @type {string} start_regex - 抽出開始にあたる正規表現
   * @type {Array.<string>} reply_regex_List - 返信にあたる正規表現が格納されたリスト
   */
  let result = []

  console.log("content_AllThread", content_AllThread.length)
  const start_regex = /<br \/> ([ぁ-んァ-ン一-龠]+)/
  const reply_regex_List = [/&gt;&gt;(\d+)/g]
  const specificTags = [
    /<blockquote\s*class="twitter-tweet">.*?<\/blockquote>/gs,
  ]
  for (let i = 0; i < content_AllThread.length; i++) {
    const allThread = content_AllThread[i]
    let rStr = SO.removeHtmlTag(allThread, start_regex, reply_regex_List, specificTags)

    console.warn("加工前", allThread)
    let lines = rStr.split('\n');
    if (lines.length >= 10) { break }
    console.log("加工後rStr", rStr)
    result.push([rStr])
  }
  content_AllThread = result

  return [content_AllThread]
}