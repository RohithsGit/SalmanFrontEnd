import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
const urlPrefix = "https://localhost:7012/api/Salman/";

export default function Brand() {
  const [brands, setBrands] = useState(null); // null = loading, [] = no data, array = data
  const [formMode, setFormMode] = useState("add");
  const [editBrand, setEditBrand] = useState(null);
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Website: "",
    ContactEmail: "",
    ContactPhone: "",
    Active: 1
  });
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Add mounted guard
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetchBrands();
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchBrands = async () => {
    setError(null);
    setBrands(null);
    try {
      const response = await fetch(urlPrefix + "brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          BrandID: 0, 
          Name: "", 
          Description: "",
          Website: "",
          ContactEmail: "",
          ContactPhone: "",
          Active: 1,
          Flag: "View" 
        })
      });
      if (!mounted.current) return;
      if (response.ok) setBrands(await response.json());
      else setError("Server error occurred. Please refresh.");
    } catch {
      if (!mounted.current) return;
      setError("Network problem happened. Please refresh.");
    }
  };

  const handleEdit = brand => {
    setFormMode("edit");
    setEditBrand(brand);
    setFormData({
      Name: brand.Name || "",
      Description: brand.Description || "",
      Website: brand.Website || "",
      ContactEmail: brand.ContactEmail || "",
      ContactPhone: brand.ContactPhone || "",
      Active: brand.Active || 1
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const resetForm = () => {
    setFormData({
      Name: "",
      Description: "",
      Website: "",
      ContactEmail: "",
      ContactPhone: "",
      Active: 1
    });
    setEditBrand(null);
    setFormMode("add");
  };

  const confirmDelete = id => setDeleteConfirm({ show: true, id });
  const doDelete = async () => {
    await fetch(urlPrefix + "brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        BrandID: deleteConfirm.id, 
        Name: "", 
        Description: "",
        Website: "",
        ContactEmail: "",
        ContactPhone: "",
        Active: 1,
        Flag: "Delete" 
      })
    });
    setDeleteConfirm({ show: false, id: null });
    fetchBrands();
  };
  const cancelDelete = () => setDeleteConfirm({ show: false, id: null });

  const handleFormSubmit = async e => {
    e.preventDefault();
    if (formMode === "add") {
      await fetch(urlPrefix + "brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          BrandID: 0, 
          ...formData,
          Flag: "Create" 
        })
      });
    } else if (formMode === "edit") {
      await fetch(urlPrefix + "brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          BrandID: editBrand.BrandID, 
          ...formData,
          Flag: "Update" 
        })
      });
    }
    resetForm();
    await fetchBrands();
  };

  // Defensive rendering so it never returns blank
  if (error) {
    return (
      <div className="mb-12 flex flex-col items-center justify-center h-72">
        <div className="text-red-600 font-bold mb-4">{error}</div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={fetchBrands}>Refresh</button>
      </div>
    );
  }

  if (brands === null) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-lg">Loading brands...</div>
    );
  }

  return (
    <div className="mb-12 max-w-5xl mx-auto">
      {/* Enhanced add/edit brand form */}
      <form onSubmit={handleFormSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">
          {formMode === "add" ? "Add New Brand" : "Edit Brand"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
            <input
              type="text"
              name="Name"
              className="border px-3 py-2 rounded w-full"
              value={formData.Name}
              onChange={handleFormChange}
              placeholder="Enter brand name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              name="Description"
              className="border px-3 py-2 rounded w-full"
              value={formData.Description}
              onChange={handleFormChange}
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="text"
              name="Website"
              className="border px-3 py-2 rounded w-full"
              value={formData.Website}
              onChange={handleFormChange}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="text"
              name="ContactEmail"
              className="border px-3 py-2 rounded w-full"
              value={formData.ContactEmail}
              onChange={handleFormChange}
              placeholder="contact@brand.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              name="ContactPhone"
              className="border px-3 py-2 rounded w-full"
              value={formData.ContactPhone}
              onChange={handleFormChange}
              placeholder="+1234567890"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="Active"
                checked={formData.Active === 1}
                onChange={handleFormChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-semibold">
            {formMode === "add" ? "Add Brand" : "Update Brand"}
          </button>
          {formMode === "edit" && (
            <button type="button" className="bg-gray-300 px-6 py-2 rounded font-semibold"
              onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Enhanced brands table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Description</th>
              <th className="p-3 text-left font-semibold">Website</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-center font-semibold">Active</th>
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-400">
                  No brands found.
                </td>
              </tr>
            ) : brands.map(brand => (
              <tr key={brand.BrandID} className="border-b last:border-0">
                <td className="p-3 text-left">{brand.BrandID}</td>
                <td className="p-3 text-left font-medium">{brand.Name}</td>
                <td className="p-3 text-left text-gray-600">{brand.Description || "-"}</td>
                <td className="p-3 text-left">
                  {brand.Website ? (
                    <a href={brand.Website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      Visit
                    </a>
                  ) : "-"}
                </td>
                <td className="p-3 text-left">{brand.ContactEmail || "-"}</td>
                <td className="p-3 text-left">{brand.ContactPhone || "-"}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    brand.Active === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {brand.Active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-center space-x-1">
                  <button className="bg-blue-500 px-3 py-1 rounded text-white text-xs"
                    onClick={() => handleEdit(brand)}>
                    Edit
                  </button>
                  <button className="bg-red-500 px-3 py-1 rounded text-white text-xs"
                    onClick={() => confirmDelete(brand.BrandID)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Animated Delete Confirmation Popup */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 40 }}
              transition={{ duration: 0.23, type: "spring" }}
            >
              <div className="text-3xl text-red-600 mb-2">⚠️</div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">
                Are you sure?
              </h3>
              <p className="text-gray-500 mb-6">Do you really want to delete this brand? This action cannot be undone.</p>
              <div className="flex space-x-4 justify-center">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-red-700 transition"
                  onClick={doDelete}>
                  Yes, Delete
                </button>
                <button
                  className="bg-gray-200 px-4 py-2 rounded font-semibold shadow hover:bg-gray-300 transition"
                  onClick={cancelDelete}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
