/** @type {string} あにまんchのURL */
const ANIMAN = /http(?:s):\/\/animanch\.com\/archives\//;

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
          "function": "Button_createScriptSystem",
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

/**
 * DATASET.envを更新する関数
 */
function SetEnv() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingSheet = ss.getSheetByName("セッティング");
  const errLogList = [];
  let errMSG = "";
  let escape = "";

  /**
   * 台本出力設定	の取得
   */
  const scriptOutputConfig = settingSheet.getRange("C3:C5").getValues().flat();
  const halfwidth = settingSheet.getRange("D3").getValue();
  // l(scriptOutputConfig); // [ '台本を分けずに出力する', 25, 4 ]
  const commentOutputMode = ["台本を分けずに出力する", "台本を分けて出力する"];

  if (!commentOutputMode.includes(scriptOutputConfig[0])) { // どちらかの値ではない場合
    errMSG = "『セッティング』シートの『単体コメントの出力方法』欄が、「台本を分けずに出力する」または「台本を分けて出力する」ではありません。\nどちらかの文章に設定してください。\n※半角スペースなど含まれていないかなども確認してください。";
    errLogList.push(errMSG);
  }

  escape = escapeHTML(String(scriptOutputConfig[1]));
  const input_lineMaxChars = convertToHalfWidth(escape);
  if (isEmptyString(input_lineMaxChars)) {
    errMSG = "『セッティング』シートの『各行の最大文字数』欄が空欄になっています。\n半角数字または全角数字のみに設定してください";
    errLogList.push(errMSG);
  } else if (!input_lineMaxChars ?? false) {
    errMSG = "『セッティング』シートの『各行の最大文字数』欄が数字以外の文章になっています。\n半角数字または全角数字のみに設定してください\n※半角スペースなど含まれていないかなども確認してください。";
    errLogList.push(errMSG);
  }

  // 最大行数
  escape = escapeHTML(String(scriptOutputConfig[2]));
  const input_maxLines = convertToHalfWidth(escape);
  if (isEmptyString(input_maxLines)) {
    errMSG = "『セッティング』シートの『最大行数』欄が空欄になっています。\n半角数字または全角数字のみに設定してください";
    errLogList.push(errMSG);
  } else if (!input_maxLines ?? false) {
    errMSG = "『セッティング』シートの『最大行数』欄が数字以外の文章になっています。\n半角数字または全角数字のみに設定してください\n※半角スペースなど含まれていないかなども確認してください。";
    errLogList.push(errMSG);
  }

  // 半角文字列の形式
  escape = escapeHTML(String(halfwidth));
  const input_halfwidth = convertToHalfWidth(escape);
  if (isEmptyString(input_halfwidth)) {
    errMSG = "『セッティング』シートの『半角のカウント形式』欄が空欄になっています。\n半角数字または全角数字のみに設定してください";
    errLogList.push(errMSG);
  } else if (!input_halfwidth ?? false) {
    errMSG = "『セッティング』シートの『半角のカウント形式』欄が数字以外の文章になっています。\n半角数字または全角数字のみに設定してください\n※半角スペースなど含まれていないかなども確認してください。";
    errLogList.push(errMSG);
  }

  /**
   * あにまんchのＵＲＬ
   */
  const scrapingURL = settingSheet.getRange("B8").getValue();
  const scrapingCheck = settingSheet.getRange("D8").getValue();

  if (typeof scrapingCheck === "boolean") {
    if (!(scrapingCheck || ANIMAN.test(scrapingURL))) {
      errMSG = "『セッティング』シートの『あにまんchのＵＲＬ』欄のURLは、あにまんchのURLではありません。\nあにまんchのURLを設置してください。";
      errLogList.push(errMSG);
    }
  } else {
    errMSG = "『セッティング』シートの『E8』はチェックボックスになっていません。\nチェックボックスを設置してください。";
    errLogList.push(errMSG);
  }
  // l("scrapingURL", scrapingURL, scrapingCheck)

  /**
   * ボイスの設定
   */
  const lastLow = settingSheet.getLastRow();
  const startRow_voice = 13;
  const sumVoiceRows = lastLow - startRow_voice + 1;
  let voiceList = settingSheet.getRange(startRow_voice, 2, sumVoiceRows, 2).getValues();
  voiceList = voiceList.filter(item => !(item[0] === "" || item[1] === ""))
  voiceList = voiceList.map(item => { return { 'name': item[0], 'gender': item[1] } })

  const maleList = voiceList.filter(item => item.gender === "男性");
  const femaleList = voiceList.filter(item => item.gender === "女性");

  /**
   * ジェンダー識別設定
   */
  const genderList = getGender(ss);

  if (errLogList.length > 0) { // 『セッティング』シートに1つでも不備があった場合の処理
    errMSG = errLogList.join("\n\n");
    errorLog(errMSG);
    throw new Error("『セッティング』シートに不備があるため、処理を中断します。");
  }

  /**
   * DATASET.envの更新処理
   */
  const setEnvDATASET = {
    "scriptOutput": {
      "mode": scriptOutputConfig[0],
      "lineMaxChars": scriptOutputConfig[1],
      "maxLines": scriptOutputConfig[2],
      'halfwidth': halfwidth,
    },
    "url": scrapingURL,
    "voice": {
      "all": voiceList, // ["キャラクター名", "性別"]のリスト
      "male": maleList,
      "female": femaleList,
    },
    'voiceRegex': {
      "maleRegexList": genderList[0],
      "femaleRegexList": genderList[1],
    }
  };
  DATASET.env = setEnvDATASET;
}

/**
 * 『ジェンダー識別設定』欄の設定のリストを取得する関数
 * @parma {null|Spreadsheet.Spreadsheet} - null または スプレッドシート情報
 * @return {Array.<string>} - [["男性の正規表現リスト"], ["女性の正規表現リスト"]]
 */
function getGender(ss = null) {
  const [targetSheetName, startRow, maleCol, femaleCol] = ["ボイス設定", 4, 1, 2];
  ss = ss ?? SpreadsheetApp.getActiveSpreadsheet();

  /**
   * テキストの両サイドに '/' がない場合、追加して返す関数
   * @param {string} text - 処理対象のテキスト
   * @return {string} - 両サイドに '/' が追加されたテキスト、もしくは元のテキスト
   */
  const addSlashesIfNeeded = (text) => {
    // 正規表現オプションが含まれているか確認
    const regexPattern = /\/.+\/[gimsuy]*/;
    if (regexPattern.test(text)) {
      // 何もせずに元の文章を返す
      return text;
    }

    // 文章の両サイドに'/'があるか確認
    if (text.startsWith('/') && text.endsWith('/')) {
      // 何もせずに元の文章を返す
      return text;
    } else {
      // 両サイドに'/'を追加して返す
      return '/' + text + '/';
    }
  }

  const voiceSheet = ss.getSheetByName(targetSheetName);

  if (!voiceSheet) {
    errorLog(`シート「${targetSheetName}」が見つかりません。`);
  }
  const lastRow = voiceSheet.getLastRow();
  if (lastRow < startRow) {
    errorLog(`シート「${targetSheetName}」に値の入った行がありません`);
  }

  const maleList = voiceSheet
    .getRange(startRow, maleCol, lastRow - startRow + 1, 1)
    .getValues()
    .flat()
    .filter(item => item !== "");
  const femaleList = voiceSheet
    .getRange(startRow, femaleCol, lastRow - startRow + 1, 1)
    .getValues()
    .flat()
    .filter(item => item !== "");
  return [maleList.map(item => addSlashesIfNeeded(item)), femaleList.map(item => addSlashesIfNeeded(item))];
}