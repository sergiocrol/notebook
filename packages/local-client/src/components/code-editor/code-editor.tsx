import "./code-editor.css";
import React, { useRef } from "react";
import MonacoEditor, {
  EditorProps,
  OnMount,
  OnChange,
} from "@monaco-editor/react";
import prettier from "prettier";
import parser from "prettier/parser-babel";

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const options: EditorProps["options"] = {
  wordWrap: "on",
  showUnused: false,
  folding: false,
  tabSize: 2,
  lineNumbersMinChars: 3,
  fontSize: 16,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  minimap: {
    enabled: false,
  },
};

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<any>();

  // This is gonna get the editor value once it is mounted the first time
  const handleEditorMount: OnMount = (editor, monaco) => {
    // This is another way to change an editor option. But it can also be done on the options
    editor.getModel()?.updateOptions({ tabSize: 2 });
    // update the value of editor ref
    editorRef.current = editor;
  };

  // This is gonna get the editor value with any change
  const handleEditorChange: OnChange = (value) => {
    if (value) onChange(value);
  };

  // We can use prettier to format our code when clicking format button
  const onFormatClick = () => {
    const unformatted = editorRef.current.getModel().getValue();
    // The replace function is for removing the extra line that prettier adds automatically when we format the code
    // it is something that will not be desirable for us.
    const formatted = prettier
      .format(unformatted, {
        parser: "babel",
        plugins: [parser],
        useTabs: false,
        semi: true,
        singleQuote: true,
      })
      .replace(/\n$/, "");

    editorRef.current.setValue(formatted);
  };

  return (
    <div className="editor-wrapper">
      <button
        className="button button-format is-primary is-small"
        onClick={onFormatClick}
      >
        Format
      </button>
      <MonacoEditor
        onMount={handleEditorMount}
        onChange={handleEditorChange}
        value={initialValue}
        height="100%"
        language="javascript"
        theme="vs-dark"
        options={options}
      />
    </div>
  );
};

export default CodeEditor;
