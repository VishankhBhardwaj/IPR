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

const formatDateForPdf = (value) => {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleDateString("en-GB");
};

const formatInventorsForPdf = (patent) => {
  if (!patent.inventors?.length) {
    return patent.inventorName || "-";
  }

  return patent.inventors
    .map((inventor) => {
      const designation = (inventor.designation || "")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
      const departments = inventor.departments?.length
        ? ` (${inventor.departments.join(", ")})`
        : "";

      return `${inventor.name} - ${designation}${departments}`;
    })
    .join("\n");
};

export const downloadPatentsPDF = (patents = []) => {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(18);
  doc.text("Patent Registry Report", 14, 16);

  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString("en-GB")}`, 14, 22);
  doc.text(`Total records: ${patents.length}`, 14, 27);

  const head = [
    [
      "Application No.",
      "Title",
      "Applicant",
      "Inventors / Designation / Departments",
      "Year",
      "Status",
      "Type",
      "Filed Date",
      "Publication Date",
      "Country",
    ],
  ];

  const body = patents.map((patent) => [
    patent.applicationNo || "-",
    patent.patentTitle || "-",
    patent.applicantName || "-",
    formatInventorsForPdf(patent),
    patent.year ?? "-",
    patent.status || "-",
    patent.patentType || "-",
    formatDateForPdf(patent.filedDate),
    formatDateForPdf(patent.publicationDate),
    patent.country || "-",
  ]);

  autoTable(doc, {
    startY: 32,
    head,
    body,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 42 },
      2: { cellWidth: 30 },
      3: { cellWidth: 44 },
      4: { cellWidth: 14 },
      5: { cellWidth: 20 },
      6: { cellWidth: 16 },
      7: { cellWidth: 24 },
      8: { cellWidth: 24 },
      9: { cellWidth: 18 },
    },
  });

  doc.save("Patent-Registry.pdf");
};
