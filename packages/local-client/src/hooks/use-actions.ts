import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../state";

export const useActions = () => {
  const dispatch = useDispatch();

  // We use useMemo function in order to memoize the bindingActionCreators
  // By default, bindActionCreators will return a new object every time we use it, so if one of these actions
  // is a dependency of a useEffect, for instance, we are rerendering the useEffect again and again (that's something that happens in code-cell.tsx)
  // In this case we only want to bind our actions one single time; we do not want to rebinding it everytime we are gonna use it or simething like that.
  return useMemo(() => {
    return bindActionCreators(actionCreators, dispatch);
  }, [dispatch]);
};
