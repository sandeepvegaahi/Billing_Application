
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadErrorPdf = (failedRows) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Bulk Upload Error Report", 14, 15);

  doc.setFontSize(11);
  doc.text(`Total Errors: ${failedRows.length}`, 14, 25);

  const tableBody = failedRows.map((r) => [
    r.row,
    r.error,
  ]);

  autoTable(doc, {
  head: [["Excel Row", "Error Message"]],
  body: tableBody,
  startY: 30,
  styles: { fontSize: 9 },
  headStyles: { fillColor: [220, 53, 69] },
});


  doc.save("Bulk_Upload_Errors.pdf");
};
