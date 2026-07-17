import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const columnLabels = {
  granted: "Granted",
  published: "Published",
  design: "Design",
  utility: "Utility",
  grandTotal: "Grand Total",
};

const getRowKey = (table) => {
  if (
    table.rows?.some((row) => row.country !== undefined) ||
    table.grandTotal?.country !== undefined
  ) {
    return "country";
  }

  return "year";
};

export const downloadAnalysisPDF = (tables) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Patent Analysis Report", 14, 18);

  let y = 30;

  Object.values(tables).forEach((table) => {
    if (!table) return;

    const rowKey = getRowKey(table);

    doc.setFontSize(14);
    doc.text(table.title, 14, y);

    const head = [
      [
        rowKey === "country" ? "Country" : "Year",
        ...(table.columns || []).map(
          (col) => columnLabels[col] || col
        ),
      ],
    ];

    const body = [
      ...(table.rows || []).map((row) => [
        row[rowKey],
        ...(table.columns || []).map((col) => row[col] ?? 0),
      ]),
      [
        "Grand Total",
        ...(table.columns || []).map(
          (col) => table.grandTotal?.[col] ?? 0
        ),
      ],
    ];

    autoTable(doc, {
      startY: y + 5,
      head,
      body,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
      },
    });

    y = doc.lastAutoTable.finalY + 15;
  });

  doc.save("Patent-Analysis.pdf");
};