import { useTypedSelector } from "./use-typed-selector";

export const useCumulativeCode = (cellId: string) => {
  // In order to get access to the previous code cell content and variable, we can get this cumulativeCode piece of state
  // It will look for the previous cells and return an array of strings with all the cell codes (until the current cell)
  return useTypedSelector((state) => {
    const { data, order } = state.cells;
    const orderedCells = order.map((id) => data[id]);

    // We can add an initial show action, so we can show in the preview the code we want in a more handy way.
    const showFunc = `
      import _React from "react";
      import _ReactDOM from "react-dom";

      var show = (value) => {
        const root = document.querySelector('#root');

        if (typeof value === 'object') {
          if (value.$$typeof && value.props) {
            _ReactDOM.render(value, root);
          } else {
            root.innerHTML = JSON.stringify(value);
          }
        } else {
          root.innerHTML = value;
        }
      };
    `;
    const showFuncNoOp = "var show = () => {}";
    const cumulativeCode = [];
    for (let c of orderedCells) {
      if (c.type === "code") {
        if (c.id === cellId) {
          cumulativeCode.push(showFunc);
        } else {
          cumulativeCode.push(showFuncNoOp);
        }
        cumulativeCode.push(c.content);
      }
      if (c.id === cellId) {
        break;
      }
    }
    return cumulativeCode;
  }).join("\n");
};
