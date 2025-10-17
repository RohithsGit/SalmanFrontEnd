import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { urlPrefix,urlPrefixLive } from "../store/store";
import * as XLSX from "xlsx";

// --- API Calls ---
function fillProductPayload(obj) {
  return {
    Flag: obj.Flag || "",
    ProductID: obj.ProductID !== undefined ? Number(obj.ProductID) : null,
    SKU: obj.SKU || "",
    Name: obj.Name || "",
    Description: obj.Description || "",
    BrandID: obj.BrandID !== "" ? Number(obj.BrandID) : null,
    CategoryID: obj.CategoryID !== "" ? Number(obj.CategoryID) : null,
    SizeID: obj.SizeID !== "" ? Number(obj.SizeID) : null,
    ColorID: obj.ColorID !== "" ? Number(obj.ColorID) : null,
    SupplierID: obj.SupplierID !== "" ? Number(obj.SupplierID) : null,
    PurchasePrice: obj.PurchasePrice !== "" ? Number(obj.PurchasePrice) : null,
    SalePrice: obj.SalePrice !== "" ? Number(obj.SalePrice) : null,
    ReorderLevel: obj.ReorderLevel !== "" ? Number(obj.ReorderLevel) : null,
    IsActive: obj.IsActive !== undefined ? !!obj.IsActive : null
  };
}
async function fetchProductList() {
  const payload = fillProductPayload({ Flag: "View", ProductID: 0 });
  const response = await fetch(urlPrefixLive + "products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}
async function addProduct(data, callback) {
  const payload = fillProductPayload({ ...data, Flag: "Create", ProductID: 0 });
  const res = await fetch(urlPrefixLive + "products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to add product");
  const result = await res.json();
  if (callback) callback(result);
  return result;
}
async function updateProduct(data, callback) {
  const payload = fillProductPayload({ ...data, Flag: "Update" });
  const res = await fetch(urlPrefixLive + "products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update product");
  const result = await res.json();
  if (callback) callback(result);
  return result;
}
async function deleteProduct(productId, callback) {
  const payload = fillProductPayload({ Flag: "Delete", ProductID: productId });
  const res = await fetch(urlPrefixLive + "products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to delete product");
  const result = await res.json();
  if (callback) callback(result);
  return result;
}
async function generateExcelTemplate() {
  const res = await fetch(urlPrefixLive + "CreateExcelTemplate", {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to create Excel template");
  const result = await res.json();
  alert(result.message);
  return result;
}

// --- UI Components ---
function EditSvg() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="8" fill="#3b82f6" />
      <path d="M7 17h2l7-7-2-2-7 7v2z" stroke="#fff" strokeWidth="1.2" />
      <path d="M14.5 7.5l2 2" stroke="#fff" strokeWidth="0.9" />
    </svg>
  );
}
function DeleteSvg() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="8" fill="#ef4444" />
      <path d="M8.5 8.5l7 7M8.5 15.5l7-7" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" fill="#16a34a" />
      <path d="M10 6v8M6 10h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ExcelIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
      <rect width="20" height="20" rx="4" fill="#65b32e" />
      <text x="2" y="15" fontSize="9" fill="#fff" fontWeight="bold">XLSX</text>
    </svg>
  );
}

function SearchableSelect({ options, value, onChange, placeholder }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const selected = options.find(opt => String(opt.value) === String(value));
  const filtered = options.filter(opt =>
    !q || (opt.label + "").toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="relative">
      <input
        className="border px-3 py-2 rounded-lg w-full bg-gray-50 cursor-pointer focus:outline-green-500"
        value={selected?.label || ""}
        placeholder={placeholder || "Select"}
        onFocus={() => setOpen(true)}
        onChange={e => {
          setOpen(true);
          setQ(e.target.value);
        }}
        readOnly={!open}
        autoComplete="off"
        style={{ transition: "box-shadow .14s" }}
      />
      <AnimatePresence>
      {open &&
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          className="absolute left-0 top-full mt-1 z-50 w-full bg-white border shadow-2xl max-h-60 overflow-y-auto rounded-xl"
          transition={{ duration: 0.14 }}>
          <div className="p-1">
            <input
              className="border px-2 py-1 rounded w-full mb-2 text-xs focus:outline-none"
              value={q}
              onChange={e => setQ(e.target.value)}
              autoFocus
              placeholder="Search..."
            />
          </div>
          {filtered.length === 0 && (
            <div className="p-2 text-center text-gray-400 text-xs">No options</div>
          )}
          {filtered.map(opt => (
            <div
              key={`${opt.value}-${opt.label}`}
              className={`px-3 py-2 cursor-pointer hover:bg-green-100 text-base rounded-xl
                ${String(opt.value) === String(value) ? "bg-green-200 font-bold" : ""}`}
              onMouseDown={() => {
                onChange(opt.value);
                setOpen(false);
                setQ("");
              }}
              style={{ transition: "background .18s" }}
            >{opt.label}</div>
          ))}
        </motion.div>
      }
      </AnimatePresence>
    </div>
  );
}
function ExcelImportModal({ open, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return;
    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          let data = XLSX.utils.sheet_to_json(ws, { defval: "" });
  
          const mappedData = data.map((row, index) => ({
            SlNo: row.SlNo || index + 1,
            ProductName: row.ProductName || "",
            Category: row.Category || "",
            Size: row.Size || "",
            Brand: row.Brand || "",
            Color: row.Color || "",
            ActualPrice: Number(row.ActualPrice) || 0,
            SellingPrice: Number(row.SellingPrice) || 0
          }));
  
          const res = await fetch(urlPrefixLive + "BulkInsertProducts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mappedData)
          });
          if (!res.ok) throw new Error("Failed to import Excel");
          const result = await res.json();
          if (onImport) onImport(result);
          setImporting(false);
          onClose();
        } catch (err) {
          setImporting(false);
          alert("Import failed: " + err.message);
        }
      };
      reader.onerror = (err) => {
        setImporting(false);
        alert("File reading failed: " + err.message);
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setImporting(false);
      alert("Import failed: " + err.message);
    }
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backdropFilter: "blur(2.7px)", background: "rgba(52, 255, 92, 0.18)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-green-300 bg-gradient-to-br from-green-100 to-white"
            initial={{ scale: 0.97, y: 40, opacity: 0.9 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 40, opacity: 0 }}
            transition={{ duration: 0.18, type: 'spring' }}
          >
            <button
              className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-gray-600"
              type="button"
              aria-label="Close"
              onClick={onClose}
            >×</button>
            <div className="text-xl font-bold text-green-700 mb-5 flex items-center gap-2">
              <ExcelIcon />
              Import Products from Excel
            </div>
            <input type="file" accept=".xlsx,.xls" className="w-full bg-green-50 border border-green-400 px-3 py-2 rounded mb-7" onChange={e => setFile(e.target.files[0])} />
            <button
              type="submit"
              disabled={!file || importing}
              className="bg-green-600 text-white px-8 py-2 rounded-full font-semibold text-base shadow hover:bg-green-700 transition"
            >{importing ? "Importing..." : "Import"}</button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductModal({ open, onClose, onSubmit, fields, setFields, mode, allOptions }) {
  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    setFields(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const modalFields = [
      { label: "Product Name", name: "Name", type: "input" },
      { label: "Brand", name: "BrandID", type: "select", options: allOptions.BrandID },
      { label: "Category", name: "CategoryID", type: "select", options: allOptions.CategoryID },
      { label: "Size", name: "SizeID", type: "select", options: allOptions.SizeID },
      { label: "Color", name: "ColorID", type: "select", options: allOptions.ColorID },
      { label: "Supplier", name: "SupplierID", type: "select", options: allOptions.SupplierID },
      { label: "Purchase Price", name: "PurchasePrice", type: "input", inputType: "number" },
      { label: "Sale Price", name: "SalePrice", type: "input", inputType: "number" },
      { label: "SKU", name: "SKU", type: "input" },
      { label: "Description", name: "Description", type: "input" }
  ];
  // Group fields, two per row
  const rows = [];
  for (let i = 0; i < modalFields.length; i += 2) {
    rows.push([modalFields[i], modalFields[i + 1]]);
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backdropFilter: "blur(8px)", background: "rgba(22,140,60,0.04)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={onSubmit}
            className="rounded-3xl shadow-2xl bg-gradient-to-br from-green-50 to-white p-0 w-[870px] max-w-4xl relative border border-green-400"
            initial={{ scale: 0.97, y: 20, opacity: 0.92 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 20, opacity: 0.94 }}
            transition={{ duration: 0.18, type: 'spring' }}
            style={{ minHeight: '0', maxHeight: '92vh', overflowY: 'auto' }}
            autoComplete="off"
          >
            <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white font-bold px-10 py-6 rounded-t-3xl text-2xl flex items-center shadow-md">
              {mode === "add" ? "Add Product" : "Edit Product"}
              <button
                type="button"
                className="ml-auto text-xl font-bold bg-white/80 text-green-700 rounded-full px-3 py-0.5 hover:bg-green-600 hover:text-white transition"
                onClick={onClose}
                title="Close"
                aria-label="Close"
                style={{ marginLeft: 28 }}
              >×</button>
            </div>
            <div className="px-12 py-9 pb-5">
              {/* Form grid: two label-field pairs per row */}
              <div className="flex flex-col gap-y-7 mb-5">
                {rows.map((row, rIdx) => (
                  <div className="flex gap-x-16 items-center" key={rIdx}>
                    {row.map(field => field && (
                      <div className="flex items-center w-1/2 gap-x-4" key={field.name}>
                        <label
                          htmlFor={field.name}
                          className="text-lg font-semibold text-green-800 w-40 text-right"
                        >
                          {field.label}
                        </label>
                        {field.type === "input" ? (
                          <input
                            type={field.inputType || "text"}
                            name={field.name}
                            id={field.name}
                            value={fields[field.name]}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-2 text-base bg-gray-100 w-[70%] focus:bg-white focus:shadow-outline focus:ring-2 focus:ring-green-400 transition"
                          />
                        ) : (
                          <div className="w-[70%]">
                            <SearchableSelect
                              options={field.options}
                              value={fields[field.name]}
                              onChange={v =>
                                setFields(f => ({ ...f, [field.name]: v }))
                              }
                              placeholder={field.label}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {/* Remaining action bar */}
              <div className="flex items-center gap-6 px-2 mt-5 mb-3">
                <input
                  type="checkbox"
                  name="IsActive"
                  checked={fields.IsActive}
                  onChange={handleChange}
                  className="w-6 h-6 accent-green-700 border border-green-700 rounded"
                  id="IsActive"
                />
                <label htmlFor="IsActive" className="text-md font-semibold text-green-700 mr-auto">
                  Active
                </label>
                <button
                  type="submit"
                  className="ml-auto bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white px-10 py-3 rounded-full font-bold text-lg shadow hover:scale-105 transition"
                >
                  {mode === "add" ? "Add Product" : "Update Product"}
                </button>
                <button
                  type="button"
                  className="bg-gray-200 px-7 py-3 rounded-full font-bold text-lg text-gray-700 border hover:bg-gray-300 transition"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default function Product() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [editFields, setEditFields] = useState(null);
  const [addFields, setAddFields] = useState({
    ProductID: "",
    SKU: "",
    Name: "",
    Description: "",
    BrandID: "",
    CategoryID: "",
    SizeID: "",
    ColorID: "",
    SupplierID: "",
    PurchasePrice: "",
    SalePrice: "",
    ReorderLevel: "",
    IsActive: true
  });
  const [filters, setFilters] = useState({
    Name: "",
    BrandID: "",
    CategoryID: "",
    SizeID: "",
    ColorID: "",
    SupplierID: "",
    SalePrice: "",
    PurchasePrice: ""
  });

  // Dropdowns API
  const [dropdowns, setDropdowns] = useState([]);
  useEffect(() => {
    fetch('https://localhost:7012/api/Salman/usp_GetDropdowuns')
      .then(res => res.json())
      .then(setDropdowns)
      .catch(() => setDropdowns([]));
  }, []);

  function groupOptions(type) {
    return dropdowns
      .filter(x => x.SourceType === type)
      .map(x => ({ value: String(x.ID), label: x.Name }));
  }
  const allOptions = {
    BrandID: groupOptions("Brand"),
    CategoryID: groupOptions("Category"),
    SizeID: groupOptions("Size"),
    ColorID: groupOptions("Color"),
    SupplierID: groupOptions("Supplier"),
  };

  function getNameById(sourceType, id) {
    if (!id) return "--";
    const opt = dropdowns.find(x => String(x.SourceType) === String(sourceType) && String(x.ID) === String(id));
    if (!opt) return "--";
    return opt.Name;
  }

  const columns = [
    { key: "Name", label: "Product" },
    { key: "BrandID", label: "Brand", type: "Brand" },
    { key: "CategoryID", label: "Category", type: "Category" },
    { key: "SizeID", label: "Size", type: "Size" },
    { key: "ColorID", label: "Color", type: "Color" },
    { key: "SupplierID", label: "Supplier", type: "Supplier" },
    { key: "SalePrice", label: "Sale Price" },
    { key: "PurchasePrice", label: "Purchase Price" }
  ];

  // For upload result and error modal
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadErrors, setUploadErrors] = useState(null);
  const [showResultPopup, setShowResultPopup] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await fetchProductList();
      setProducts(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const filteredProducts = products.filter(prod => (
    (filters.Name === "" || prod.Name?.toLowerCase().includes(filters.Name.toLowerCase())) &&
    (filters.BrandID === "" || String(prod.BrandID) === String(filters.BrandID)) &&
    (filters.CategoryID === "" || String(prod.CategoryID) === String(filters.CategoryID)) &&
    (filters.SizeID === "" || String(prod.SizeID) === String(filters.SizeID)) &&
    (filters.ColorID === "" || String(prod.ColorID) === String(filters.ColorID)) &&
    (filters.SupplierID === "" || String(prod.SupplierID) === String(filters.SupplierID)) &&
    (filters.SalePrice === "" || String(prod.SalePrice) === String(filters.SalePrice)) &&
    (filters.PurchasePrice === "" || String(prod.PurchasePrice) === String(filters.PurchasePrice))
  ));

  function handleFilterChange(key, value) {
    setFilters(f => ({ ...f, [key]: value }));
  }
  function openAddModal() {
    setAddFields({
      ProductID: "",
      SKU: "",
      Name: "",
      Description: "",
      BrandID: "",
      CategoryID: "",
      SizeID: "",
      ColorID: "",
      SupplierID: "",
      PurchasePrice: "",
      SalePrice: "",
      ReorderLevel: "",
      IsActive: true
    });
    setShowAdd(true);
  }
  function openEditModal(product) { setEditFields({ ...product }); setShowEdit(true); }
  function closeModal() { setShowAdd(false); setShowEdit(false); setEditFields(null); }
  function openImportModal() { setShowImport(true); }
  function closeImportModal() { setShowImport(false); }

  async function handleGenerateExcel() {
    try {
      await generateExcelTemplate();
    } catch (e) {
      alert("Excel template generation failed: " + e.message);
    }
  }

  // Handle result from Excel import to show popup accordingly
  const handleExcelImportResult = (result) => {
    const hasErrors = Array.isArray(result) && result.some(item => item.ErrorMessage);
    if (hasErrors) {
      setUploadErrors(result);
      setUploadResult(null);
    } else {
      setUploadResult(result && result.length > 0 ? result[0] : null);
      setUploadErrors(null);
      loadProducts();
    }
    setShowResultPopup(true);
  };

  // Download error PDF from server
  const downloadErrorPdf = async () => {
    if (!uploadErrors) return;
    try {
      const res = await fetch(urlPrefixLive + "DownloadErrorPdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadErrors),
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ImportErrors.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  };

  // Popup to show upload results or error messages
  const UploadResultPopup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full shadow-lg relative">
        <button
          onClick={() => {
            setShowResultPopup(false);
            setUploadErrors(null);
            setUploadResult(null);
          }}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
          aria-label="Close Popup"
        >×</button>

        {uploadErrors ? (
          <>
            <h2 className="text-red-600 font-bold text-xl mb-4">Import Errors</h2>
            <div className="max-h-72 overflow-auto border rounded p-3 mb-4 bg-gray-50">
            {uploadErrors.map(({ SlNo, ErrorMessage }, i) => (
                  <div key={i} className="mb-2 p-2 border-b last:border-b-0 flex justify-between items-center">
                     <span><strong>SlNo:</strong> {SlNo}</span>
                  <span className="text-red-600 font-semibold"><strong>Error:</strong> {ErrorMessage}</span>
                 </div>
               ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResultPopup(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >Close</button>
              <button
                onClick={downloadErrorPdf}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >Download PDF</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-green-600 font-bold text-xl mb-4">Import Successful</h2>
            <p className="mb-4">Products inserted successfully: {uploadResult?.InsertedCount ?? 0}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowResultPopup(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full min-h-full px-3 pt-3">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold text-green-800 py-4 pl-3">
          Products <span className="text-gray-400 font-normal">({filteredProducts.length})</span>
        </span>
        <div className="flex gap-3 items-center">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded shadow font-bold hover:bg-green-800 transition text-base"
            onClick={handleGenerateExcel}
          >
            <ExcelIcon /> Generate XLSX
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded shadow font-bold hover:bg-green-600 transition text-base"
            onClick={openImportModal}
          >
            <ExcelIcon /> Import XLSX
          </button>
          <button
            className="bg-green-600 p-0.5 rounded-full shadow-lg hover:bg-green-700 transition"
            style={{ width: 48, height: 48 }}
            onClick={openAddModal}
            title="Add Product"
          >
            <PlusIcon />
          </button>
        </div>
      </div>
      {error && (
        <div className="text-red-500 font-bold text-center my-8">{error}</div>
      )}
      <div className="w-full overflow-x-auto bg-white rounded-xl shadow border p-1">
        <table className="min-w-full">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={col.key} className="py-3 px-3 border-b-2 border-blue-100 bg-green-50 text-green-700 font-bold text-sm text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span>{col.label}</span>
                    {showFilters && (
                      <input
                        type="text"
                        value={filters[col.key] || ""}
                        onChange={e => handleFilterChange(col.key, e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 w-24 text-xs"
                        placeholder={`Search`}
                        style={{ marginTop: 2 }}
                      />
                    )}
                  </div>
                </th>
              ))}
              <th className="py-3 px-2 border-b-2 bg-green-50 text-green-700 text-center font-bold text-sm">
                <button
                  className="bg-green-100 px-3 py-0.5 rounded shadow font-bold hover:bg-green-200 text-green-700 text-xs"
                  style={{ minWidth: 75 }}
                  onClick={() => setShowFilters(f => !f)}
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="text-center py-8 text-gray-400 font-bold">No products found.</td></tr>
            ) : (
              filteredProducts.map(prod => (
                <tr key={prod.ProductID} className="hover:bg-green-50 transition">
                  {columns.map(col => (
                    <td key={col.key} className="py-2 px-3 border-b text-center text-sm">
                      {col.type
                        ? getNameById(col.type, prod[col.key])
                        : prod[col.key] ?? "--"}
                    </td>
                  ))}
                  <td className="py-2 px-2 border-b text-center">
                    <span className="inline-flex gap-2">
                      <button onClick={() => openEditModal(prod)} title="Edit"><EditSvg /></button>
                      <button onClick={() => deleteProduct(prod.ProductID, loadProducts)} title="Delete"><DeleteSvg /></button>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Excel Import Modal - Pass a new onImport handler to show popup */}
      <ExcelImportModal
        open={showImport}
        onClose={closeImportModal}
        onImport={(result) => handleExcelImportResult(result)}
      />

      {/* Add Modal */}
      <ProductModal
        open={showAdd}
        onClose={closeModal}
        onSubmit={async e => {
          e.preventDefault();
          await addProduct(addFields, () => {
            closeModal();
            loadProducts();
          });
        }}
        fields={addFields}
        setFields={setAddFields}
        mode="add"
        allOptions={allOptions}
      />
      {/* Edit Modal */}
      <ProductModal
        open={showEdit}
        onClose={closeModal}
        onSubmit={async e => {
          e.preventDefault();
          await updateProduct(editFields, () => {
            closeModal();
            loadProducts();
          });
        }}
        fields={editFields || addFields}
        setFields={setEditFields}
        mode="edit"
        allOptions={allOptions}
      />

      {/* Upload Result Popup */}
      {showResultPopup && <UploadResultPopup />}
    </motion.div>
  );
}
