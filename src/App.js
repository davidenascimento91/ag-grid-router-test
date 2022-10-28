import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component

import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

const App = () => {
  const gridRef = useRef(); // Optional - for accessing Grid's API
  const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
  let [searchParams, setSearchParams] = useSearchParams();

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState([
    { field: "make", filter: true },
    { field: "model", filter: true },
    { field: "price" },
  ]);

  const getFiltersFromQueryParams = (params) => {
    if (!params || !Object.keys(params).length) {
      return null;
    }
    return {
      make: JSON.parse(decodeURIComponent(params.make || null)),
      model: JSON.parse(decodeURIComponent(params.model || null)),
    };
  };

  const getQueryParamsFromFilters = (filters) => {
    if (!filters || !Object.keys(filters).length) {
      return {
        make: null,
        model: null,
      };
    }
    return {
      make: encodeURIComponent(JSON.stringify(filters.make || null)),
      model: encodeURIComponent(JSON.stringify(filters.model || null)),
    };
  };

  // DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(() => ({
    sortable: true,
  }));

  // Example of consuming Grid Event
  const cellClickedListener = useCallback((event) => {
    console.log("cellClicked", event);
  }, []);

  const filterHandler = useCallback((event) => {
    const filters = event.api.getFilterModel();
    const query = getQueryParamsFromFilters(filters);
    setSearchParams(query);
  });

  const onGridReady = () => {
    const params = {
      make: searchParams.get("make"),
      model: searchParams.get("model"),
    };
    const model = getFiltersFromQueryParams(params);
    const gridOptions = gridRef.current;
    gridOptions.api.setFilterModel(model);
  };

  // Example load data from sever
  useEffect(() => {
    fetch("https://www.ag-grid.com/example-assets/row-data.json")
      .then((result) => result.json())
      .then((rowData) => setRowData(rowData));
  }, []);

  // Example using Grid's API
  const buttonListener = useCallback((e) => {
    gridRef.current.api.deselectAll();
  }, []);

  return (
    <div>
      {/* Example using Grid's API */}
      <button onClick={buttonListener}>Push Me</button>

      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      <div className="ag-theme-alpine" style={{ width: 500, height: 500 }}>
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={rowData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true} // Optional - set to 'true' to have rows animate when sorted
          rowSelection="multiple" // Options - allows click selection of rows
          onCellClicked={cellClickedListener} // Optional - registering for Grid Event
          onFilterChanged={filterHandler}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
};

export default App;
