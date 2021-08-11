import { useSelector, TypedUseSelectorHook } from "react-redux";
import { RootState } from "../state";

// This is used to have access to the types of our redux store. So if we want to get
// a state from our store, we'll use this useTypedSelector instead of the common useSelector.
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
