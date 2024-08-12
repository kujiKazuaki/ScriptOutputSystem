/**
 * htmlタグにあたる部分を削除する関数
 * @param {string} str - エスケープ対象文字列
 * @return {string} - エスケープ処理後の文字列
 */
function removeHtml(str) {
  // 返信にあたる正規表現を使用し、対象文字列でヒットしたら「>>番号」といった形に変換する
  // 特定のパターン（>&gt;&gt;数字）を >>数字\n に置換
  const resRegex = />&gt;&gt;(\d+)/g;
  const replacedText = str.replace(resRegex, '>>$1\n');
  /**
   * HTMLタグの削除
   */
  let result = Helper_stripHtmlTags(replacedText);
  result = Helper_improveValue(result)

  return result;
}

/**
 * 指定された文字列からHTMLタグを削除する関数
 * @param {string} str - HTMLタグを含む文字列。
 * @return {string} HTMLタグが削除された文字列。
 */
function Helper_stripHtmlTags(str) {
  // 正規表現を使用してHTMLタグを空文字に置換
  let textWithoutTags = str.replace(/<[^>]*>/g, '');
  // 文字列の最後に`<div`があったら削除する
  textWithoutTags = textWithoutTags.replace(/<div/g, '');
  // 空白行と '>' のみの行を削除（空白文字のみの行も含む）
  let textWithoutEmptyLines = textWithoutTags.replace(/^\s*(>|\s*)[\r\n]/gm, '');
  return textWithoutEmptyLines;
}

function TEST_Helper_improveValue() {
  parserAniman(animanURL = "https://animanch.com/archives/20946628.html")
}
/**
 * 加工後の値を修正する関数
 * @param {string} str - 修正対象の文字列
 * @return {string} - 加工後の文字列
 */
function Helper_improveValue(result) {
  // console.log('result', result)
  const replaceList = [
    { // 「>〇(半角数字)。」の形式の文字列を「>〇(半角数字)」に置換する
      "regex": /(>\d+)\。/g,
      "changeStr": "$1"
    },
    { // 「>〇(半角数字)」の形式の文字列を「>>〇(半角数字)」に置換する
      "regex": /^>(\d+)/g,
      "changeStr": ">>$1"
    },
    { // 文字の始まりが、「>」で、その後に数字以外の日本語が来る場合、先頭の「>」を削除する
      "regex": /^>([^0-9>]+)/,
      "changeStr": "$1"
    },
    {
      "regex": /^。/g,
      "changeStr": "",
    },
    {
      "regex": />。&gt;&gt;\d+。/g,
      "changeStr": "\n",
    },
    {
      "regex": /&gt;/g,
      "changeStr": "",
    },
    {
      "regex": /(。)。/,
      "changeStr": "$1",
    }
  ]
  const passRegex = [ // 各行に含まれる値があればその行を格納しないようにするためのリスト
    /">。/
  ]
  let result_str = result
  /**
   * 加工手順１
   * 指定されたセルに含まれるテキストに対して処理が行われ、「。」や空文字のみの行が削除される
   */
  let lines = result_str.split(/\r\n|\n|\r/); // 改行でテキストを行に分割
  const filteredLines = lines.filter(function (line) {
    const trimmedLine = line.trim();
    return trimmedLine !== "。" && trimmedLine !== "";
  });
  result_str = filteredLines.join("\n"); // 除外後の行を改行で結合

  /**
   * 加工手順４
   * 1行目が数字のみになっている値は「>>数字」に変換する
   */
  lines = result_str.split(/\r\n|\n|\r/); // 改行でテキストを行に分割
  if (lines.length > 0 && /^\d+$/.test(lines[0])) {
    lines[0] = '>>' + lines[0];
  }
  result_str = lines.join("\n")

  replaceList.forEach((item) => {
    result_str = result_str.replace(item.regex, item.changeStr)
  })

  /**
   * 加工手順５
   * 各行に含まれる値があればその行を格納しないようにするためのリストを使って含める行を決定する
   */
  lines = result_str.split(/\r\n|\n|\r/); // 改行でテキストを行に分割
  lines = lines.filter((item) => !passRegex.some((regex) => regex.test(item)))
  result_str = lines.join("\n")

  return result_str
}