import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
const urlPrefix = "https://localhost:7012/api/Salman/";

export default function Size() {
  const [sizes, setSizes] = useState(null);
  const [formMode, setFormMode] = useState("add");
  const [editSize, setEditSize] = useState(null);
  const [formName, setFormName] = useState("");
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetchSizes();
    return () => { mounted.current = false; };
  }, []);

  const fetchSizes = async () => {
    setError(null);
    setSizes(null);
    try {
      const response = await fetch(urlPrefix + "sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Flag: "View",
          SizeID: 0,
          Name: ""
        })
      });
      if (!mounted.current) return;
      if (response.ok) setSizes(await response.json());
      else setError("Server error occurred. Please refresh.");
    } catch {
      if (!mounted.current) return;
      setError("Network problem happened. Please refresh.");
    }
  };

  const handleEdit = size => {
    setFormMode("edit");
    setEditSize(size);
    setFormName(size.Name);
  };

  const confirmDelete = id => setDeleteConfirm({ show: true, id });
  const doDelete = async () => {
    await fetch(urlPrefix + "sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Flag: "Delete",
        SizeID: deleteConfirm.id,
        Name: ""
      })
    });
    setDeleteConfirm({ show: false, id: null });
    fetchSizes();
  };
  const cancelDelete = () => setDeleteConfirm({ show: false, id: null });

  const handleFormSubmit = async e => {
    e.preventDefault();
    let requestBody;
    if (formMode === "add") {
      requestBody = {
        Flag: "Create",
        SizeID: 0,
        Name: formName
      };
    } else if (formMode === "edit" && editSize) {
      requestBody = {
        Flag: "Update",
        SizeID: editSize.SizeID,
        Name: formName
      };
    }
    await fetch(urlPrefix + "sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    setFormName("");
    setEditSize(null);
    setFormMode("add");
    await fetchSizes();
  };

  if (error) {
    return (
      <div className="mb-12 flex flex-col items-center justify-center h-72">
        <div className="text-red-600 font-bold mb-4">{error}</div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={fetchSizes}>Refresh</button>
      </div>
    );
  }

  if (sizes === null) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-lg">
        Loading sizes...
      </div>
    );
  }

  return (
    <div className="mb-12 max-w-xl mx-auto">
      {/* Inline add/edit size */}
      <form onSubmit={handleFormSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          className="border px-3 py-2 rounded flex-1"
          value={formName}
          onChange={e => setFormName(e.target.value)}
          placeholder="Size name (e.g. XS, S, M, L)"
          required
        />
        <div className="flex flex-row gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold">
            {formMode === "add" ? "Add" : "Update"}
          </button>
          {formMode === "edit" && (
            <button type="button" className="bg-gray-300 px-4 py-2 rounded font-semibold"
              onClick={() => { setFormMode("add"); setEditSize(null); setFormName(""); }}>
              Cancel
            </button>
          )}
        </div>
      </form>
      {/* Sizes table */}
      <div className="overflow-x-auto">
        <table className="min-w-full w-full bg-white rounded-xl shadow text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sizes.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-4 text-gray-400">
                  No sizes found.
                </td>
              </tr>
            ) : sizes.map(size => (
              <tr key={size.SizeID} className="border-b last:border-0">
                <td className="p-3 text-left">{size.SizeID}</td>
                <td className="p-3 text-left">{size.Name}</td>
                <td className="p-3 text-center">
                  <div className="flex flex-row gap-2 justify-center">
                    <button className="bg-blue-500 px-3 py-1 rounded text-white"
                      onClick={() => handleEdit(size)}>Edit</button>
                    <button className="bg-red-500 px-3 py-1 rounded text-white"
                      onClick={() => confirmDelete(size.SizeID)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
              <p className="text-gray-500 mb-6">Do you really want to delete this size? This action cannot be undone.</p>
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
