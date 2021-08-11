import React, { useRef, useEffect } from "react";
import "./preview.css";

interface PreviewProps {
  code: string;
  err: string;
}

const html = `
<html>
  <head></head>
  <body>
    <div id="root"></div>
    <script>
      const handleError = (err) => {
        const root = document.querySelector('#root');
        root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
        console.error(err);
      };

      window.addEventListener('error', (event) => {
        event.preventDefault();
        handleError(event.error);
      });

      window.addEventListener('message', (event) => {
        if (event.data.err) throw new Error(event.data.err);

        try {
          eval(event.data.code);
        } catch (err) {
          handleError(err);
        }
      }, false);
    </script>
  </body>
</html>
`;

const Preview: React.FC<PreviewProps> = ({ code, err }) => {
  const iframe = useRef<any>();

  useEffect(() => {
    iframe.current.srcdoc = html;
    setTimeout(() => {
      iframe.current.contentWindow.postMessage({ code, err }, "*");
    }, 50);
  }, [code, err]);

  return (
    // The preview-wrapper class is a pseudo element that will be only showed when the class react-draggable-transparent-selection
    // is added by react-resizable library (in other words, this class is only added when we're resizing, in that way we are creating a
    // pseudo-element that will be hidden when the component is not resizing; so we avoid the problem of the component not being resized
    // when the mouse enter the iframe)
    <div className="preview-wrapper">
      <iframe
        ref={iframe}
        title="frame"
        sandbox="allow-scripts"
        srcDoc={html}
      />
    </div>
  );
};

export default Preview;
