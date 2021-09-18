import produce from "immer";
import { ActionType } from "../action-types";
import { Action } from "../actions";
import { Cell } from "../cell";

interface CellsState {
  loading: boolean;
  error: string | null;
  order: string[];
  data: {
    [key: string]: Cell;
  };
}

const initialState: CellsState = {
  loading: false,
  error: null,
  order: [],
  data: {},
};

const reducer = produce((state: CellsState = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.SAVE_CELLS_ERROR:
      state.error = action.payload;

      return state;
    case ActionType.FETCH_CELLS:
      state.loading = true;
      state.error = null;

      return state;
    case ActionType.FETCH_CELLS_COMPLETED:
      state.order = action.payload.map((cell) => cell.id);
      state.data = action.payload.reduce((acc, cell) => {
        acc[cell.id] = cell;
        return acc;
      }, {} as CellsState["data"]);

      return state;
    case ActionType.FETCH_CELLS_ERROR:
      state.loading = false;
      state.error = action.payload;

      return state;
    case ActionType.UPDATE_CELL:
      const { id, content } = action.payload;
      // With immer we can wrap the reducer with the immer produce function, and we can
      // work with the state as it was a new fresh one (we do not have to create a new one,
      // and spread the old values and so on).
      state.data[id].content = content;
      // Also, we do not need to return the new state, because immer will do it for us.
      // But in this case, since we are using TS, we need to return the new state, otherwise
      // TS will assume that the state can be undefined if we write just a "return";
      return state;
    case ActionType.DELETE_CELL:
      const cellId = action.payload;
      delete state.data[cellId];
      state.order.splice(state.order.indexOf(cellId), 1);

      return state;
    case ActionType.MOVE_CELL:
      const { direction } = action.payload;
      const originalPosition = state.order.indexOf(action.payload.id);
      const finalPosition =
        direction === "up" ? originalPosition - 1 : originalPosition + 1;
      // If the movement is out of array constrains, we do not move the cell.
      if (finalPosition < 0 || finalPosition > state.order.length - 1)
        return state;
      // We swap the order. In the original position now is gonna be the element that was taking the position where we've moved the new one.
      // and in the final position is gonna be the payload's id; in other words, the element we want to move.
      state.order[originalPosition] = state.order[finalPosition];
      state.order[finalPosition] = action.payload.id;

      return state;
    case ActionType.INSERT_CELL_AFTER:
      const cell: Cell = {
        content: "",
        type: action.payload.type,
        id: randomId(),
      };
      state.data[cell.id] = cell;
      action.payload.id
        ? state.order.splice(
            state.order.indexOf(action.payload.id) + 1,
            0,
            cell.id
          )
        : state.order.unshift(cell.id);

      return state;
    default:
      return state;
  }
});

const randomId = () => {
  return Math.random().toString(36).substring(2, 7);
};

export default reducer;
