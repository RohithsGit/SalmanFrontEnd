import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { urlPrefixLive } from "../store/store";
import * as XLSX from "xlsx";

function ExcelImportModal({ open, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleSubmit = async (e) => {
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

          const mappedData = data.map((row) => ({
            ProductID: row.ProductID || "",
            ProductName: row.ProductName || "",
            CategoryID: row.CategoryID || "",
            CategoryName: row.CategoryName || "",
            SizeID: row.SizeID || "",
            SizeName: row.SizeName || "",
            ColorID: row.ColorID || "",
            ColorName: row.ColorName || "",
            ActualCost: String(row.ActualCost || ""),
            SellingCost: String(row.SellingCost || ""),
            Quantity: String(row.Quantity || ""),
          }));

          const res = await fetch(urlPrefixLive + "BulkInsertProducts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mappedData),
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
          style={{
            backdropFilter: "blur(2.7px)",
            background: "rgba(52, 255, 92, 0.18)",
          }}
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
            transition={{ duration: 0.18, type: "spring" }}
          >
            <button
              className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-gray-600"
              type="button"
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
            <div className="text-xl font-bold text-green-700 mb-5 flex items-center gap-2">
              <ExcelIcon />
              Import Products from Excel
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="w-full bg-green-50 border border-green-400 px-3 py-2 rounded mb-7"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              type="submit"
              disabled={!file || importing}
              className="bg-green-600 text-white px-8 py-2 rounded-full font-semibold text-base shadow hover:bg-green-700 transition"
            >
              {importing ? "Importing..." : "Import"}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function fillProductPayload(obj) {
  return {
    Flag: obj.Flag || "",
    ProductID: obj.ProductID || "",
    ProductName: obj.ProductName || "",
    CategoryID: obj.CategoryID || "",
    SizeID: obj.SizeID || "",
    ColorID: obj.ColorID || "",
    ActualCost: obj.ActualCost || "",
    SellingCost: obj.SellingCost || "",
    Quantity: obj.Quantity || "",
  };
}

async function fetchProductList() {
  const payload = fillProductPayload({ Flag: "view" });
  const response = await fetch(urlPrefixLive + "ProductMaster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

async function addProduct(data, callback) {
  const payload = fillProductPayload({ ...data, Flag: "add", ProductID: "" });
  const res = await fetch(urlPrefixLive + "ProductMaster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add product");
  const result = await res.json();
  if (callback) callback(result);
  return result;
}

async function updateProduct(data, callback) {
  const payload = fillProductPayload({ ...data, Flag: "update" });
  const res = await fetch(urlPrefixLive + "ProductMaster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update product");
  const result = await res.json();
  if (callback) callback(result);
  return result;
}

async function deleteProduct(ProductID, callback) {
  const payload = fillProductPayload({ Flag: "delete", ProductID });
  const res = await fetch(urlPrefixLive + "ProductMaster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to delete product");
  const result = await res.json();
  if (callback) callback(result);
  return result;
}

async function generateExcelTemplate() {
  const res = await fetch(urlPrefixLive + "CreateExcelTemplate", {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to create Excel template");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ProductTemplate.xlsx";
  a.click();
  window.URL.revokeObjectURL(url);
}

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
      <path
        d="M8.5 8.5l7 7M8.5 15.5l7-7"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" fill="#16a34a" />
      <path
        d="M10 6v8M6 10h8"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
      <rect width="20" height="20" rx="4" fill="#65b32e" />
      <text x="2" y="15" fontSize="9" fill="#fff" fontWeight="bold">
        XLSX
      </text>
    </svg>
  );
}

function SearchableSelect({ options, value, onChange, placeholder }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => String(opt.value) === String(value));
  const filtered = options.filter(
    (opt) => !q || (opt.label + "").toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="relative">
      <input
        className="border px-3 py-2 rounded-lg w-full bg-gray-50 cursor-pointer focus:outline-green-500"
        value={selected?.label || ""}
        placeholder={placeholder || "Select"}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setOpen(true);
          setQ(e.target.value);
        }}
        readOnly={!open}
        autoComplete="off"
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 top-full mt-1 z-50 w-full bg-white border shadow-2xl max-h-60 overflow-y-auto rounded-xl"
          >
            <div className="p-1">
              <input
                className="border px-2 py-1 rounded w-full mb-2 text-xs focus:outline-none"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
                placeholder="Search..."
              />
            </div>
            {filtered.length === 0 && (
              <div className="p-2 text-center text-gray-400 text-xs">No options</div>
            )}
            {filtered.map((opt, idx) => (
              <div
                key={`${opt.value}-${idx}`}
                className={`px-3 py-2 cursor-pointer hover:bg-green-100 text-base rounded-xl ${
                  String(opt.value) === String(value) ? "bg-green-200 font-bold" : ""
                }`}
                onMouseDown={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setQ("");
                }}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({ open, onClose, onSubmit, fields, setFields, mode, allOptions }) {
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFields((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const modalFields = [
    { label: "Product Name", name: "ProductName", type: "input" },
    { label: "Category", name: "CategoryID", type: "select", options: allOptions.CategoryID },
    { label: "Size", name: "SizeID", type: "select", options: allOptions.SizeID },
    { label: "Color", name: "ColorID", type: "select", options: allOptions.ColorID },
    { label: "Purchase Price", name: "ActualCost", type: "input", inputType: "number" },
    { label: "Sale Price", name: "SellingCost", type: "input", inputType: "number" },
  ];

  const rows = [];
  for (let i = 0; i < modalFields.length; i += 2) rows.push([modalFields[i], modalFields[i + 1]]);

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
          >
            <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white font-bold px-10 py-6 rounded-t-3xl text-2xl flex items-center shadow-md">
              {mode === "add" ? "Add Product" : "Edit Product"}
              <button
                type="button"
                className="ml-auto text-xl font-bold bg-white/80 text-green-700 rounded-full px-3 py-0.5 hover:bg-green-600 hover:text-white transition"
                onClick={onClose}
              >
                ×
              </button>
            </div>

            <div className="px-12 py-9 pb-5">
              <div className="flex flex-col gap-y-7 mb-5">
                {rows.map((row, rIdx) => (
                  <div className="flex gap-x-16 items-center" key={`row-${rIdx}`}>
                    {row.map(
                      (field, fIdx) =>
                        field && (
                          <div className="flex items-center w-1/2 gap-x-4" key={`field-${field.name}-${fIdx}`}>
                            <label htmlFor={field.name} className="text-lg font-semibold text-green-800 w-40 text-right">
                              {field.label}
                            </label>
                            {field.type === "input" ? (
                              <input
                                type={field.inputType || "text"}
                                name={field.name}
                                id={field.name}
                                value={fields[field.name]}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-2 text-base bg-gray-100 w-[70%]"
                              />
                            ) : (
                              <div className="w-[70%]">
                                <SearchableSelect
                                  options={field.options}
                                  value={fields[field.name]}
                                  onChange={(v) => setFields((f) => ({ ...f, [field.name]: v }))}
                                  placeholder={field.label}
                                />
                              </div>
                            )}
                          </div>
                        )
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 px-2 mt-5 mb-3">
                <button type="submit" className="ml-auto bg-green-700 text-white px-10 py-3 rounded-full font-bold text-lg">
                  {mode === "add" ? "Add Product" : "Update Product"}
                </button>
                <button type="button" className="bg-gray-200 px-7 py-3 rounded-full font-bold text-lg text-gray-700" onClick={onClose}>
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

// Loading overlay component with blur and spinner
function LoadingOverlay({ visible, message = "Processing..." }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 font-semibold text-lg"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
          >
            <svg
              className="animate-spin h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            {message}
          </motion.div>
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
  const [showImport, setShowImport] = useState(false);
  const [editFields, setEditFields] = useState(null);
  const [loading, setLoading] = useState(false); // loading state

  const [addFields, setAddFields] = useState({
    ProductID: "",
    ProductName: "",
    CategoryID: "",
    SizeID: "",
    ColorID: "",
    ActualCost: "",
    SellingCost: "",
    Quantity: "",
  });

  const [filters, setFilters] = useState({
    ProductName: "",
    CategoryName: "",
    SizeName: "",
    ColorName: "",
  });

  const [allOptions, setAllOptions] = useState({
    CategoryID: [],
    SizeID: [],
    ColorID: [],
  });

  async function fetchMasterDataLayout() {
    const res = await fetch(urlPrefixLive + "MasterDataLayout", { method: "POST" });
    if (!res.ok) throw new Error("Failed to fetch master data");
    const data = await res.json();

    setAllOptions({
      CategoryID: (data.Categories || []).map((c) => ({
        value: c.categoryID,
        label: c.categoryName,
      })),
      SizeID: (data.Sizes || []).map((s) => ({
        value: s.sizeID,
        label: s.sizeName,
      })),
      ColorID: (data.Colors || []).map((co) => ({
        value: co.colorID,
        label: co.colorName,
      })),
    });
  }

  const loadProducts = async () => {
    try {
      const data = await fetchProductList();
      setProducts(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    loadProducts();
    fetchMasterDataLayout();
  }, []);

  const filteredProducts = products.filter(
    (prod) =>
      (!filters.ProductName || prod.ProductName?.toLowerCase().includes(filters.ProductName.toLowerCase())) &&
      (!filters.CategoryName || prod.CategoryName?.toLowerCase().includes(filters.CategoryName.toLowerCase())) &&
      (!filters.SizeName || prod.SizeName?.toLowerCase().includes(filters.SizeName.toLowerCase())) &&
      (!filters.ColorName || prod.ColorName?.toLowerCase().includes(filters.ColorName.toLowerCase()))
  );

  function handleFilterChange(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function openAddModal() {
    setAddFields({
      ProductID: "",
      ProductName: "",
      CategoryID: "",
      SizeID: "",
      ColorID: "",
      ActualCost: "",
      SellingCost: "",
      Quantity: "",
    });
    setShowAdd(true);
  }

  function openEditModal(product) {
    setEditFields({ ...product });
    setShowEdit(true);
  }

  // Handlers with loading state
  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await addProduct(addFields);
      await loadProducts();
      setShowAdd(false);
    } catch (err) {
      alert("Failed to add product: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProduct(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProduct(editFields);
      await loadProducts();
      setShowEdit(false);
    } catch (err) {
      alert("Failed to update product: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full min-h-full px-3 pt-3">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-green-800 py-4 pl-3">
            Products <span className="text-gray-400 font-normal">({filteredProducts.length})</span>
          </span>
          <div className="flex gap-3 items-center">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded shadow font-bold hover:bg-green-800 transition text-base"
              onClick={() => setShowImport(true)}
            >
              <ExcelIcon /> Import XLSX
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded shadow font-bold hover:bg-green-800 transition text-base"
              onClick={generateExcelTemplate}
            >
              <ExcelIcon /> Generate XLSX
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

        {error && <div className="text-red-500 font-bold text-center my-8">{error}</div>}

        <div className="w-full overflow-x-auto bg-white rounded-xl shadow border p-1">
          <table className="min-w-full">
            <thead>
              <tr>
                {[
                  { key: "ProductName", label: "Product" },
                  { key: "CategoryName", label: "Category" },
                  { key: "SizeName", label: "Size" },
                  { key: "ColorName", label: "Color" },
                  { key: "ActualCost", label: "Purchase Price" },
                  { key: "Quantity", label: "Quantity" },
                ].map((col) => (
                  <th
                    key={`head-${col.key}`}
                    className="py-3 px-3 border-b-2 border-blue-100 bg-green-50 text-green-700 font-bold text-sm text-center"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{col.label}</span>
                      <input
                        type="text"
                        value={filters[col.key] || ""}
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 w-24 text-xs mt-1"
                        placeholder={`Search`}
                      />
                    </div>
                  </th>
                ))}
                <th className="py-3 px-2 border-b-2 bg-green-50 text-green-700 text-center font-bold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 font-bold">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod, idx) => (
                  <tr key={`prod-${prod.ProductID || idx}`} className="hover:bg-green-50 transition">
                    {[
                      "ProductName",
                      "CategoryName",
                      "SizeName",
                      "ColorName",
                      "ActualCost",
                      "Quantity",
                    ].map((key) => (
                      <td key={`${key}-${prod.ProductID || idx}`} className="py-2 px-3 border-b text-center text-sm">
                        {prod[key] ?? "--"}
                      </td>
                    ))}
                    <td className="py-2 px-2 border-b text-center">
                      <span className="inline-flex gap-2">
                        <button onClick={() => openEditModal(prod)} title="Edit">
                          <EditSvg />
                        </button>
                        <button onClick={() => deleteProduct(prod.ProductID, loadProducts)} title="Delete">
                          <DeleteSvg />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ProductModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onSubmit={handleAddProduct}
          fields={addFields}
          setFields={setAddFields}
          mode="add"
          allOptions={allOptions}
        />

        <ProductModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          onSubmit={handleUpdateProduct}
          fields={editFields || addFields}
          setFields={setEditFields}
          mode="edit"
          allOptions={allOptions}
        />

        <ExcelImportModal
          open={showImport}
          onClose={() => setShowImport(false)}
          onImport={() => {
            loadProducts();
            setShowImport(false);
          }}
        />
      </motion.div>

      <LoadingOverlay visible={loading} message="Saving product, please wait..." />
    </>
  );
}
