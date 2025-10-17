import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const urlPrefix = "https://localhost:7012/api/Salman/";

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
  const response = await fetch(urlPrefix + "products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}
async function addProduct(data, callback) {
  const payload = fillProductPayload({ ...data, Flag: "Create", ProductID: 0 });
  const res = await fetch(urlPrefix + "products", {
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
  const res = await fetch(urlPrefix + "products", {
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
  const res = await fetch(urlPrefix + "products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to delete product");
  const result = await res.json();
  if (callback) callback(result);
  return result;
}

// --- UI Components ---
function EditSvg() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="8" fill="#3b82f6"/>
      <path d="M7 17h2l7-7-2-2-7 7v2z" stroke="#fff" strokeWidth="1.2"/>
      <path d="M14.5 7.5l2 2" stroke="#fff" strokeWidth="0.9"/>
    </svg>
  );
}
function DeleteSvg() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="8" fill="#ef4444"/>
      <path d="M8.5 8.5l7 7M8.5 15.5l7-7" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" fill="#16a34a"/>
      <path d="M10 6v8M6 10h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function ExcelIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
      <rect width="20" height="20" rx="4" fill="#65b32e"/>
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
        className="border px-3 py-2 rounded w-full bg-gray-50 cursor-pointer"
        value={selected?.label || ""}
        placeholder={placeholder || "Select"}
        onFocus={() => setOpen(true)}
        onChange={e => {
          setOpen(true);
          setQ(e.target.value);
        }}
        readOnly={!open}
        onBlur={() => setTimeout(() => setOpen(false), 140)}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-50 w-full bg-white border shadow-xl max-h-44 overflow-y-auto rounded">
          <div className="p-1">
            <input
              className="border px-2 py-1 rounded w-full mb-1 text-xs"
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
              className={`px-3 py-2 cursor-pointer hover:bg-green-50 text-sm rounded ${String(opt.value) === String(value) ? "bg-green-100 font-bold" : ""}`}
              onMouseDown={() => {
                onChange(opt.value);
                setOpen(false);
                setQ("");
              }}
            >{opt.label}</div>
          ))}
        </div>
      )}
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
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(urlPrefix + "import-products", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Failed to import Excel");
      const result = await res.json();
      if (onImport) onImport(result);
      setImporting(false);
      onClose();
      alert("Import successful!");
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
            background: "rgba(52, 255, 92, 0.18)"
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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backdropFilter: "blur(2px)",
            background: "rgba(20,220,100,0.11)"
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
        >
          <motion.form
            onSubmit={onSubmit}
            className="rounded-2xl shadow-2xl bg-white p-0 w-[720px] max-w-full relative border border-green-400"
            initial={{ y: 20, opacity: 0.97 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0.94 }}
            transition={{ duration: 0.16, type: 'spring' }}
            style={{ minHeight: '0', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white font-bold px-10 py-4 rounded-t-2xl text-xl flex items-center">
              {mode === "add" ? "Add Product" : "Edit Product"}
              <button
                className="ml-auto text-base font-bold bg-gray-200 text-gray-900 rounded-full px-2 py-0.5 hover:bg-gray-400 hover:text-white transition"
                type="button"
                aria-label="Close"
                onClick={onClose}
                style={{marginLeft: 18}}
                title="Close"
              >×</button>
            </div>
            <div className="px-10 pt-5 pb-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-5">
                <input name="Name" placeholder="Product Name" value={fields.Name} onChange={handleChange} className="border rounded px-4 py-2" />
                <SearchableSelect
                  options={allOptions.BrandID} value={fields.BrandID} onChange={v => setFields(f => ({ ...f, BrandID: v }))}
                  placeholder="Brand"
                />
                <SearchableSelect
                  options={allOptions.CategoryID} value={fields.CategoryID} onChange={v => setFields(f => ({ ...f, CategoryID: v }))}
                  placeholder="Category"
                />
                <SearchableSelect
                  options={allOptions.SizeID} value={fields.SizeID} onChange={v => setFields(f => ({ ...f, SizeID: v }))}
                  placeholder="Size"
                />
                <SearchableSelect
                  options={allOptions.ColorID} value={fields.ColorID} onChange={v => setFields(f => ({ ...f, ColorID: v }))}
                  placeholder="Color"
                />
                <SearchableSelect
                  options={allOptions.SupplierID} value={fields.SupplierID} onChange={v => setFields(f => ({ ...f, SupplierID: v }))}
                  placeholder="Supplier"
                />
                <input name="PurchasePrice" type="number" placeholder="Purchase Price" value={fields.PurchasePrice} onChange={handleChange} className="border rounded px-4 py-2" />
                <input name="SalePrice" type="number" placeholder="Sale Price" value={fields.SalePrice} onChange={handleChange} className="border rounded px-4 py-2" />
                <input name="SKU" placeholder="SKU" value={fields.SKU} onChange={handleChange} className="border rounded px-4 py-2" />
                <input name="Description" placeholder="Description" value={fields.Description} onChange={handleChange} className="border rounded px-4 py-2" />
              </div>
              <div className="flex items-center gap-3 px-1">
                <input type="checkbox" name="IsActive" checked={fields.IsActive} onChange={handleChange} className="w-5 h-5 accent-green-700" />
                <label className="text-sm font-semibold text-green-700">Active</label>
                <button type="submit" className="ml-auto bg-green-600 text-white px-8 py-2 rounded-full font-bold text-base shadow hover:bg-green-800 transition">
                  {mode === "add" ? "Add" : "Update"}
                </button>
                <button type="button" className="bg-gray-200 px-5 py-2 rounded-full font-bold text-base text-gray-700 border hover:bg-gray-300 transition"
                        onClick={onClose}>Cancel</button>
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

  // Fetch dropdown options from API (ONCE)
  const [dropdowns, setDropdowns] = useState([]);
  useEffect(() => {
    fetch('https://localhost:7012/api/Salman/usp_GetDropdowuns')
      .then(res => res.json())
      .then(setDropdowns)
      .catch(() => setDropdowns([]));
  }, []);

  // Build grouped options for modal and display mapping for grid
  function groupOptions(type) {
    // To avoid duplicate values, append sourcetype to value for key uniqueness
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

  // Helper: get label by numeric value for given type
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
  function openEditModal(product) { setEditFields({ ...product }); setShowEdit(true);}
  function closeModal() { setShowAdd(false); setShowEdit(false); setEditFields(null);}
  function openImportModal() { setShowImport(true);}
  function closeImportModal() { setShowImport(false);}
  function handleExportExcel() {
    // Wire up your Excel export logic here
    alert("Excel export not implemented! Attach your own code here.");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full min-h-full px-3 pt-3">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold text-green-800 py-4 pl-3">
          Products <span className="text-gray-400 font-normal">({filteredProducts.length})</span>
        </span>
        <div className="flex gap-3 items-center">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded shadow font-bold hover:bg-green-800 transition text-base"
            onClick={handleExportExcel}
          >
            <ExcelIcon /> Export XLSX
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
      {/* Excel Import Modal */}
      <ExcelImportModal open={showImport} onClose={closeImportModal} onImport={loadProducts} />
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
    </motion.div>
  );
}
