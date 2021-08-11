import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import MonacoJSXHighlighter from "monaco-jsx-highlighter";

// Minimal Babel setup for React JSX parsing:
const babelParse = (code: string) =>
  parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

export function initMonacoJSXHighlighter(editor: any, monaco: any) {
  const monacoJSXHighlighter = new MonacoJSXHighlighter(
    monaco,
    babelParse,
    traverse,
    editor
  );
  console.log(monacoJSXHighlighter);
  monacoJSXHighlighter.highLightOnDidChangeModelContent(100);
  monacoJSXHighlighter.addJSXCommentCommand();
}
