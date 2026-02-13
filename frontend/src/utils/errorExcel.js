import * as XLSX from "xlsx";

export const downloadErrorExcel = (failedRows) => {
  if (!failedRows || failedRows.length === 0) return;

  const formatted = failedRows.map((r) => ({
    "Excel Row": r.row,
    "Error Message": r.error,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formatted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Errors");

  XLSX.writeFile(workbook, "Bulk_Upload_Errors.xlsx");
};
