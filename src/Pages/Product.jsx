import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";


const urlPrefix = "https://localhost:7012/api/Salman/";

// --- API/utility functions (unchanged) ---
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
    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" fill="#16a34a"/>
      <path d="M10 6v8M6 10h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function ProductGroupCard({ name, products, onEdit, onDelete }) {
  return (
    <div className="bg-white shadow rounded-xl border border-blue-200 px-3 py-2 m-1 w-full flex flex-col gap-1 min-h-[48px]">
      <div className="text-sm font-bold text-blue-900 text-center mb-1">{name}</div>
      {products.map(prod => (
        <div key={prod.ProductID} className="flex flex-row items-center justify-between gap-2 px-1 py-0.5 rounded hover:bg-blue-50 transition">
          <span className="text-xs text-gray-700 px-2 py-0.5 bg-blue-100 rounded">{prod.SizeID}</span>
          <span className="text-xs font-bold text-blue-900">₹{prod.SalePrice ?? "--"}</span>
          <span className="flex gap-1 ml-1">
            <button title="Edit Product" onClick={() => onEdit(prod)} className="hover:scale-110 transition-transform"><EditSvg /></button>
            <button title="Delete Product" onClick={() => onDelete(prod.ProductID)} className="hover:scale-110 transition-transform"><DeleteSvg /></button>
          </span>
        </div>
      ))}
    </div>
  );
}
function groupByName(arr) {
  const out = {};
  arr.forEach(item => {
    if (!item.Name) return;
    if (!out[item.Name]) out[item.Name] = [];
    out[item.Name].push(item);
  });
  return out;
}

// Modal is unchanged for safety
function ProductAddModal({ open, onClose, onChange, onSubmit, fields }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backdropFilter: "blur(2px)",
            background: "rgba(57,60,100,0.22)"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={onSubmit}
            className="rounded-3xl shadow-2xl p-14 w-full max-w-4xl relative border border-blue-200
                       bg-gradient-to-br from-indigo-100 via-sky-50 to-blue-200"
            initial={{ scale: 0.95, y: 50, opacity: 0.9 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 50, opacity: 0 }}
            transition={{ duration: 0.18, type: 'spring' }}
          >
            <button
              className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-gray-600"
              type="button"
              aria-label="Close"
              onClick={onClose}
            >×</button>
            <div className="text-2xl font-semibold text-blue-900 mb-8">Add Product</div>
            <div className="grid grid-cols-2 gap-8">
              {/* Column 1 */}
              <div className="space-y-6">
                <FieldRow
                  label="SKU" name="SKU" value={fields.SKU}
                  onChange={onChange} inputClass="bg-blue-50 border-blue-300"
                />
                <FieldRow
                  label="Product Name" name="Name" value={fields.Name}
                  onChange={onChange} inputClass="bg-indigo-50 border-indigo-300"
                />
                <FieldRow
                  label="Description" name="Description" value={fields.Description}
                  onChange={onChange} inputClass="bg-green-50 border-green-300"
                />
                <FieldRow
                  label="Brand ID" name="BrandID" value={fields.BrandID}
                  onChange={onChange} inputClass="bg-pink-50 border-pink-300"
                />
                <FieldRow
                  label="Category ID" name="CategoryID" value={fields.CategoryID}
                  onChange={onChange} inputClass="bg-yellow-50 border-yellow-300"
                />
                <FieldRow
                  label="Size ID" name="SizeID" value={fields.SizeID}
                  onChange={onChange} inputClass="bg-sky-50 border-sky-300"
                />
              </div>
              {/* Column 2 */}
              <div className="space-y-6">
                <FieldRow
                  label="Color ID" name="ColorID" value={fields.ColorID}
                  onChange={onChange} inputClass="bg-orange-50 border-orange-300"
                />
                <FieldRow
                  label="Supplier ID" name="SupplierID" value={fields.SupplierID}
                  onChange={onChange} inputClass="bg-teal-50 border-teal-300"
                />
                <FieldRow
                  label="Purchase Price" name="PurchasePrice" type="number" value={fields.PurchasePrice}
                  onChange={onChange} inputClass="bg-amber-50 border-amber-300"
                />
                <FieldRow
                  label="Sale Price" name="SalePrice" type="number" value={fields.SalePrice}
                  onChange={onChange} inputClass="bg-purple-50 border-purple-300"
                />
                <FieldRow
                  label="Reorder Level" name="ReorderLevel" type="number" value={fields.ReorderLevel}
                  onChange={onChange} inputClass="bg-lime-50 border-lime-300"
                />
                <div className="flex items-center mt-2">
                  <label className="text-base min-w-[120px] text-green-700">Active</label>
                  <input type="checkbox" name="IsActive" checked={fields.IsActive} onChange={onChange}
                         className="ml-2 accent-green-600 w-5 h-5" />
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex gap-2 justify-end mt-12">
              <button
                type="submit"
                className="bg-green-600 text-white px-8 py-2 rounded-full font-semibold text-base shadow hover:bg-green-700 transition"
              >Add</button>
              <button
                type="button"
                className="bg-gray-200 px-8 py-2 rounded-full font-semibold text-base text-gray-700 border hover:bg-gray-300 transition"
                onClick={onClose}
              >Cancel</button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// FieldRow now gets an inputClass prop for color/border styling:
function FieldRow({ label, name, value, onChange, type = "text", inputClass = "" }) {
  return (
    <div className="flex items-center">
      <label className="text-base min-w-[120px] text-blue-700">{label}</label>
      <input
        className={`border px-4 py-2 rounded-lg text-base w-full transition-all ${inputClass}`}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
      />
    </div>
  );
}


export default function Product() {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchSize, setSearchSize] = useState("");
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
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

  const loadProducts = async () => fetchProductList().then(setProducts).catch(e => setError(e.message));
  useEffect(() => { loadProducts(); }, []);

  const sizeOptions = Array.from(
    new Set(products.map(p => p.SizeID || ""))
  )
    .filter(x => x !== "")
    .map(sizeID => {
      const prod = products.find(p => String(p.SizeID) === String(sizeID));
      return { ID: sizeID, Name: sizeID };
    });

  const filteredProducts = products.filter(prod =>
    (searchText === "" || prod.Name?.toLowerCase().includes(searchText.toLowerCase())) &&
    (searchSize === "" || String(prod.SizeID) === String(searchSize))
  );
  const grouped = groupByName(filteredProducts);

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
  const handleAddChange = e => {
    const { name, value, type, checked } = e.target;
    setAddFields({ ...addFields, [name]: type === "checkbox" ? checked : value });
  };
  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    setEditFields({ ...editFields, [name]: type === "checkbox" ? checked : value });
  };
  const handleAddSubmit = async e => {
    e.preventDefault();
    await addProduct(addFields, () => {
      closeModal();
      loadProducts();
    });
  };
  const handleEditSubmit = async e => {
    e.preventDefault();
    await updateProduct(editFields, () => {
      closeModal();
      loadProducts();
    });
  };
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(productId, loadProducts);
    }
  };
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
    setShowAdd(true); // this line opens the Add Product popup/modal!
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full min-h-full">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900 pl-3 py-6">Products Management</h2>
        <button className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition mr-5 mt-0.5" onClick={openAddModal} title="Add Product"><PlusIcon /></button>
      </div>
      {/* Search bar and Filter centered */}
      <div className="w-full flex flex-col items-center mb-2">
        <div className="flex items-end gap-6 justify-center">
          <div>
            <label className="block text-sm text-gray-700 font-bold mb-1" htmlFor="searchName">Product</label>
            <input
              id="searchName"
              type="text"
              className="rounded-xl border-2 border-gray-300 focus:border-blue-400 px-4 py-1 text-base w-60"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search product..."
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 font-bold mb-1" htmlFor="searchSize">Size</label>
            <select
              id="searchSize"
              className="rounded-xl border-2 border-gray-300 focus:border-blue-400 px-4 py-1 text-base w-28"
              value={searchSize}
              onChange={e => setSearchSize(e.target.value)}
            >
              <option value="">All</option>
              {sizeOptions.map(opt => (
                <option key={opt.ID} value={opt.ID}>
                  {opt.Name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* List count, subheading */}
        <div className="w-full text-left text-blue-800 font-bold mt-5 text-lg pl-4">Product List</div>
        <div className="w-full text-left text-gray-500 font-medium pl-4 pb-2 pt-0">{filteredProducts.length} products</div>
      </div>
      {error && (
        <div className="text-red-500 font-bold text-center my-8">{error}</div>
      )}
      <AnimatePresence>
        {showAdd && (
          <ProductAddModal
            open={showAdd}
            onClose={closeModal}
            onChange={handleAddChange}
            onSubmit={handleAddSubmit}
            fields={addFields}
            mode="add"
          />
        )}
        {showEdit && (
          <ProductAddModal
            open={showEdit}
            onClose={closeModal}
            onChange={handleEditChange}
            onSubmit={handleEditSubmit}
            fields={editFields}
            mode="edit"
          />
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-2">
        {Object.entries(grouped).length === 0 ? (
          <div className="col-span-5 py-10 text-center text-gray-400 text-xs">No products found.</div>
        ) : (
          Object.entries(grouped).map(([name, arr]) =>
            <ProductGroupCard
              key={arr[0].ProductID}
              name={name}
              products={arr}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          )
        )}
      </div>
    </motion.div>
  );
}
