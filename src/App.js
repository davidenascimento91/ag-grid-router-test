import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component

import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

const App = () => {
  const gridRef = useRef(); // Optional - for accessing Grid's API
  const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
  const [filters, setFilters] = useState({});
  const [sortState, setSortState] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

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
      price: JSON.parse(decodeURIComponent(params.price || null)),
    };
  };

  const getQueryParamsFromFilters = (filters) => {
    if (!filters || !Object.keys(filters).length) {
      return {
        make: null,
        model: null,
        price: null,
      };
    }

    return {
      make: encodeURIComponent(JSON.stringify(filters.make || null)),
      model: encodeURIComponent(JSON.stringify(filters.model || null)),
      price: encodeURIComponent(JSON.stringify(filters.price || null)),
    };
  };

  const addQuaryString = () => {
    const query = getQueryParamsFromFilters(filters);
    setSearchParams(query);
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
    const auxFilters = filters;
    const newFilters = event.api.getFilterModel();
    setFilters({ ...auxFilters, ...newFilters });
  });

  const sortHandler = useCallback((event) => {
    const columnDefs = event.api.getColumnDefs();
    const auxFilters = filters;

    columnDefs.forEach((el) => {
      if (typeof el.sort == "string") {
        auxFilters[el.colId] = { ...auxFilters[el.colId], sort: el.sort };
      }
    });
    console.log("auxFilters", auxFilters);
    setFilters(auxFilters);
  });

  const onGridReady = () => {
    const params = {
      make: searchParams.get("make"),
      model: searchParams.get("model"),
    };
    const { ...model } = getFiltersFromQueryParams(params);
    const gridOptions = gridRef.current;
    gridOptions.api.setFilterModel(model);
    /*  gridOptions.columnApi.applyColumnState({
      state: sortState,
      defaultState: { sort: null },
    }); */
    gridOptions.api.sizeColumnsToFit();
    setFilters(model);
  };

  // Example load data from sever
  useEffect(() => {
    fetch("https://www.ag-grid.com/example-assets/row-data.json")
      .then((result) => result.json())
      .then((rowData) => setRowData(rowData));
  }, []);

  useEffect(() => {
    console.log("filters", filters);
    addQuaryString();
  }, [filters]);

  return (
    <div>
      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      <div className="ag-theme-alpine" style={{ height: 500 }}>
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={rowData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true} // Optional - set to 'true' to have rows animate when sorted
          rowSelection="multiple" // Options - allows click selection of rows
          onCellClicked={cellClickedListener} // Optional - registering for Grid Event
          onFilterChanged={filterHandler}
          onSortChanged={sortHandler}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
};

export default App;
