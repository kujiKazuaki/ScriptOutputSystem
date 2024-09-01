function TEST_Helper_improveValue() {
  parserAniman(animanURL = "https://animanch.com/archives/20946628.html")
  // https://animanch.com/archives/20946628.html - エラーでるurl
  createScriptSystem();
}

/**
 * htmlタグにあたる部分を削除する関数
 * @param {string} baseStr - エスケープ対象文字列
 * @return {string} - エスケープ処理後の文字列
 */
function removeHtml(baseStr, option = null) {
  if (!option) {
    throw new Error('有効なoptionを設定してください: "header" または "comment"');
  }

  let result = '';

  switch (option) {
    case 'header':
      console.warn(`baseStr(${option}):`, baseStr);

      result = baseStr
        .replace(/^>/, '')  // 先頭の > を削除
        .replace(/<\/?[^>]+(>|$)/g, '')  // HTMLタグを削除;
        .replace(/(\d)\./g, '$1:')
        .replace(/\s{2,}/g, ' ') // 空文字が2つ以上連続するなら1つにする
        .trim() // 両サイドのスペース文字を削除する
      break;
    case 'comment':
      console.warn(`baseStr(${option}):`, baseStr);

      result = baseStr
        .replace(/^[^>]*>/, '')           // 最初の HTML 属性部分（styleなど）を削除 ex - style="font-size: 24px;">>>2グラオザーム先生
        .replace(/<\/?[^>]+(>|$)/g, match => match === '<br />' ? '\n' : '') // <br />を改行に置換し、他のHTMLタグを全て削除
        .replace(/&gt;&gt;/g, '>>');     // &gt;&gt; を >> に置換

      console.log('result', result)
      break;
    default:
      throw new Error('無効なoptionが設定されています');
  }

  result = Helper_improveValue(result);
  console.log('加工後', result)

  return result;
}

/**
 * 加工後の値を修正する関数
 * @param {string} str - 修正対象の文字列
 * @return {string} - 加工後の文字列
 */
function Helper_improveValue(str) {
  // 行ごとのフィルタリング処理を共通化
  const filterLines = (text, excludePatterns) => {
    let lines = text.split(/\r\n|\n|\r/); // 改行でテキストを行に分割
    return lines.filter(line => {
      const trimmedLine = line.trim();
      return trimmedLine !== "。" && trimmedLine !== "" && !excludePatterns.some(regex => regex.test(line));
    }).join("\n");
  };

  // 不要な行のフィルタリング
  str = filterLines(str, [/">。/, /googletag.cmd.push/, /id="/]);

  // 1行目が数字のみの場合の変換処理
  let lines = str.split(/\r\n|\n|\r/); // 改行でテキストを行に分割
  if (lines.length > 0 && /^\d+$/.test(lines[0])) {
    lines[0] = '>>' + lines[0];
  }
  str = lines.join("\n");

  // 正規表現を適用するための共通関数
  const applyReplacements = (text, replacements) => {
    replacements.forEach(({ regex, changeStr }) => {
      text = text.replace(regex, changeStr);
    });
    return text;
  };

  // 「>〇(半角数字)」の形式の文字列を「>>〇(半角数字)」に置換する、他
  const replaceList = [
    { "regex": /^。/g, "changeStr": "" },        // 行頭の「。」を削除
    { 'regex': /<span class="anchor"><span class="anchor"/, 'changeStr': '' }, // 返信に当たるタグを削除, >100 ではなく >>100 として処理するためのコード
    { 'regex': />>(\d+)\n<br \/>/, 'changeStr': '>>$1\n' }, // >>100</br> を変更する
    { 'regex': /<br \/>/g, 'changeStr': '\n' }, // コメントの改行部分を作成する
  ];

  // 置換リストの適用
  // console.log("加工前", str)
  str = applyReplacements(str, replaceList);

  return str;
}
