import React, { useState } from "react";
import * as XLSX from "xlsx";

interface SummaryItem {
  sku: string;
  qty: number;
}

const App: React.FC = () => {
  const [group1, setGroup1] = useState<SummaryItem[]>([]);
  const [group2, setGroup2] = useState<SummaryItem[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any;

      const skuCol = 8; // Column I
      const qtyCol = 18; // Column S
      const map1: Record<string, number> = {};
      const map2: Record<string, number> = {};
      let grandTotal = 0;

      rows.slice(1).forEach((row) => {
        const sku = row[skuCol];
        const qty = Number(row[qtyCol]) || 0;
        if (typeof sku === "string" && sku.trim()) {
          const firstChar = sku.charAt(0).toUpperCase();
          if (["K", "L", "D"].includes(firstChar)) {
            map1[sku] = (map1[sku] || 0) + qty;
          } else if (firstChar === "R") {
            map2[sku] = (map2[sku] || 0) + qty;
          }

          grandTotal += qty;
        }
      });

      setGroup1(Object.entries(map1).map(([sku, qty]) => ({ sku, qty })));
      setGroup2(Object.entries(map2).map(([sku, qty]) => ({ sku, qty })));
      setGrandTotal(grandTotal);
    };
    reader.readAsArrayBuffer(file);
  };

  const copyToClipboard = (items: SummaryItem[]) => {
    const text = items.map((item) => `${item.sku} - ${item.qty}`).join("\n");
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard! ✅");
  };

  // create a renter btn companent

  const renderBtn = (items: SummaryItem[], title: string) => (
    <button className="copy-button" onClick={() => copyToClipboard(items)}>
      Copy {title} to Clipboard
    </button>
  );

  // create a render table component

  const renderTable = (items: SummaryItem[], title: string) => (
    <div className="table-container">
      <h2>{title}</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.sku}</td>
                <td>{item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>Flipkart Order Summarizer</h1>
      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
      {renderBtn(group1, "K/L/D SKUs")}
      {renderBtn(group2, "R SKUs")}
      {grandTotal > 0 && <p className="grand-total">Grand Total: {grandTotal}</p>}
      {group1.length > 0 && renderTable(group1, "K/L/D SKUs")}
      {group2.length > 0 && renderTable(group2, "R SKUs")}
    </div>
  );
};

export default App;
