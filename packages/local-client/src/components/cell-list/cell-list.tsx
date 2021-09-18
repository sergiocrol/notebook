import "./cell-list.css";
import { Fragment, useEffect } from "react";
import { useTypedSelector } from "../../hooks/use-typed-selector";
import CellListItem from "../cell-list-item/cell-list-item";
import AddCell from "../add-cell/add-cell";
import { useActions } from "../../hooks/use-actions";

const CellList: React.FC = () => {
  const { fetchCells } = useActions();

  useEffect(() => {
    fetchCells();
  }, []);

  // We get the data and the array of cells from our store, and we iterate the ordered list
  // returning a new array with the ordered cells (data[id])
  const cells = useTypedSelector(({ cells: { order, data } }) =>
    order.map((id) => data[id])
  );

  const renderedCells = cells.map((cell) => (
    <Fragment key={cell.id}>
      <CellListItem cell={cell} />
      <AddCell previousCellId={cell.id} />
    </Fragment>
  ));

  return (
    <div className="cell-list">
      <AddCell forceVisible={cells.length === 0} previousCellId={null} />
      {renderedCells}
    </div>
  );
};

export default CellList;
