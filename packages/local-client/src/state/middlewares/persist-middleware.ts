import { Dispatch } from "redux";
import { Action } from "../actions";
import { ActionType } from "../action-types";
import { saveCells } from "../action-creators";
import { RootState } from "../reducers";

export const persistMiddleware = ({
  dispatch,
  getState,
}: {
  dispatch: Dispatch<Action>;
  getState: () => RootState;
}) => {
  let timer: any;

  return (next: (action: Action) => void) => {
    return (action: Action) => {
      // In this middleware, what we want to do is to dispatch every action we get, but also an additional action
      // to save the cell, if the action we are receiving is one of these: MOVE_CELL, UPDATE_CELL, INSERT_CELL_AFTER or DELETE_CELL
      // Those actions are the only one we care in order to save the cell into the DB, so we let them to do aññ his job in redux, as normal
      // but also we dispatch an SAVE_CELL which each one
      next(action); // no matter the action, always we want to call next middleware

      if (
        [
          ActionType.MOVE_CELL,
          ActionType.INSERT_CELL_AFTER,
          ActionType.UPDATE_CELL,
          ActionType.DELETE_CELL,
        ].includes(action.type)
      ) {
        // Since saveCells is an action creator invoked trough a middleware, the syntax to call it is a bit harder than usual
        // because it returns an async function to which we have to pass two arguments
        if (timer) clearTimeout(timer);

        timer = setTimeout(() => {
          saveCells()(dispatch, getState);
        }, 250);
      }
    };
  };
};
