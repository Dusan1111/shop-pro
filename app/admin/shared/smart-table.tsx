import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import "./smart-table.scss"; // Import CSS
import RemoveButton from "./remove-button";

interface TableComponentProps {
  data: any[];
  columns: string[];
  columnKeys: string[];
  onRowClick?: (row: any) => void;
  selectedRow?: string;
  onRemove?: (row: any) => any | undefined;
  customRenderers?: { [key: string]: (row: any) => React.ReactNode };
}

const TableComponent: React.FC<TableComponentProps> = ({
  data,
  columns,
  columnKeys,
  onRowClick,
  selectedRow,
  onRemove = () => { },
  customRenderers = {},
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [loading, setLoading] = useState(false); // State for loading effect.

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Helper function to render default cell content
  const renderDefault = (value: any) => {
    if (value === undefined || value === null) return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  // Define columns using TanStack Table
  const tableColumns = useMemo<ColumnDef<any>[]>(() => {
    return columnKeys.map((key, index) => ({
      accessorKey: key,
      header: columns[index],
      cell: (info: any) => {
        const value = info.getValue();
        if (customRenderers[key]) {
          return customRenderers[key](info.row.original);
        }
        if (index === 0 && searchQuery) {
          return highlightMatch(String(value), searchQuery);
        }
        return renderDefault(value);
      },
      enableSorting: index !== 0, // Disable sorting for the first column (search column)
    }));
  }, [columnKeys, columns, customRenderers, searchQuery]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      String(item[columnKeys[0]])
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery, columnKeys]);

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="tableContainer">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="first_row">
              {headerGroup.headers.map((header, index) => (
                <th key={header.id} className="sortable">
                  {index === 0 ? (
                    <>
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                      <input
                        type="text"
                        className="headerSearch"
                        value={searchQuery}
                        onChange={(e) => {
                          setLoading(true);
                          setSearchQuery(e.target.value);
                          setTimeout(() => setLoading(false), 300);
                        }}
                        placeholder={`Pretraži po ${header.column.columnDef.header}`}
                      />
                    </>
                  ) : (
                    <span
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: "pointer" }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: " ▲",
                        desc: " ▼",
                      }[header.column.getIsSorted() as string] ?? null}
                    </span>
                  )}
                </th>
              ))}
              {onRemove.length > 0 && <th></th>}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (onRemove.length > 0 ? 1 : 0)} className="loadingOverlay">
                <div className="spinner"></div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.original._id}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={selectedRow === row.original._id ? "selected" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {onRemove.length > 0 && (
                  <td
                    className="remove_column"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RemoveButton remove={() => onRemove(row.original)} content={<Trash2 size={18} />} />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="bottom-table-container">
        <div className="pagination">
          <button
            className="activePage"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prethodna
          </button>
          {Array.from({ length: table.getPageCount() }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => table.setPageIndex(index)}
              className={table.getState().pagination.pageIndex === index ? "activePage" : "currentPage"}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="activePage"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sledeća
          </button>
        </div>
        <div className="rowsPerPageSelector">
          <span className="rowsPerLabel">Redova po stranici: </span>
          <select
            id="rowsPerPage"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              setLoading(true);
              table.setPageSize(Number(e.target.value));
              setTimeout(() => setLoading(false), 300);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;