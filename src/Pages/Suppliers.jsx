import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
const urlPrefix = "https://localhost:7012/api/Salman/";

export default function Supplier() {
  const [suppliers, setSuppliers] = useState(null);
  const [formMode, setFormMode] = useState("add");
  const [editSupplier, setEditSupplier] = useState(null);
  const [formFields, setFormFields] = useState({
    Name: "",
    ContactName: "",
    Phone: "",
    Email: "",
    Address: ""
  });
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetchSuppliers();
    return () => { mounted.current = false; };
  }, []);

  const fetchSuppliers = async () => {
    setError(null);
    setSuppliers(null);
    try {
      const response = await fetch(urlPrefix + "suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          SupplierID: 0,
          Flag: "View",
          Name: "",
          ContactName: "",
          Phone: "",
          Email: "",
          Address: ""
        })
      });
      if (!mounted.current) return;
      if (response.ok) setSuppliers(await response.json());
      else setError("Server error occurred. Please refresh.");
    } catch {
      if (!mounted.current) return;
      setError("Network problem happened. Please refresh.");
    }
  };

  const handleEdit = supplier => {
    setFormMode("edit");
    setEditSupplier(supplier);
    setFormFields({
      Name: supplier.Name || "",
      ContactName: supplier.ContactName || "",
      Phone: supplier.Phone || "",
      Email: supplier.Email || "",
      Address: supplier.Address || ""
    });
  };

  const confirmDelete = id => setDeleteConfirm({ show: true, id });
  const doDelete = async () => {
    await fetch(urlPrefix + "suppliers/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Flag: "Delete",
        SupplierID: deleteConfirm.id,
        Name: "",
        ContactName: "",
        Phone: "",
        Email: "",
        Address: ""
      })
    });
    setDeleteConfirm({ show: false, id: null });
    fetchSuppliers();
  };

  const cancelDelete = () => setDeleteConfirm({ show: false, id: null });

  const handleFormChange = e => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    let requestBody;
    if (formMode === "add") {
      requestBody = {
        Flag: "Create",
        SupplierID: 0,
        Name: formFields.Name,
        ContactName: formFields.ContactName,
        Phone: formFields.Phone,
        Email: formFields.Email,
        Address: formFields.Address
      };
    } else if (formMode === "edit" && editSupplier) {
      requestBody = {
        Flag: "Update",
        SupplierID: editSupplier.SupplierID,
        Name: formFields.Name,
        ContactName: formFields.ContactName,
        Phone: formFields.Phone,
        Email: formFields.Email,
        Address: formFields.Address
      };
    }
    await fetch(urlPrefix + "suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    setFormFields({
      Name: "",
      ContactName: "",
      Phone: "",
      Email: "",
      Address: ""
    });
    setEditSupplier(null);
    setFormMode("add");
    await fetchSuppliers();
  };

  if (error) {
    return (
      <div className="mb-12 flex flex-col items-center justify-center h-72">
        <div className="text-red-600 font-bold mb-4">{error}</div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={fetchSuppliers}>Refresh</button>
      </div>
    );
  }

  if (suppliers === null) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-lg">
        Loading suppliers...
      </div>
    );
  }

  return (
    <div className="mb-12 max-w-6xl mx-auto">
      {/* Inline add/edit supplier */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-2 mb-6">
        <input
          name="Name"
          type="text"
          className="border px-3 py-2 rounded"
          value={formFields.Name}
          onChange={handleFormChange}
          placeholder="Supplier name"
          required
        />
        <input
          name="ContactName"
          type="text"
          className="border px-3 py-2 rounded"
          value={formFields.ContactName}
          onChange={handleFormChange}
          placeholder="Contact name"
        />
        <input
          name="Phone"
          type="text"
          className="border px-3 py-2 rounded"
          value={formFields.Phone}
          onChange={handleFormChange}
          placeholder="Phone"
        />
        <input
          name="Email"
          type="email"
          className="border px-3 py-2 rounded"
          value={formFields.Email}
          onChange={handleFormChange}
          placeholder="Email"
        />
        <input
          name="Address"
          type="text"
          className="border px-3 py-2 rounded col-span-2"
          value={formFields.Address}
          onChange={handleFormChange}
          placeholder="Address"
        />
        {/* Button row: always in one line, right-aligned */}
        <div className="col-span-2 flex flex-row justify-end gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold">
            {formMode === "add" ? "Add" : "Update"}
          </button>
          {formMode === "edit" && (
            <button type="button" className="bg-gray-300 px-4 py-2 rounded font-semibold"
              onClick={() => { setFormMode("add"); setEditSupplier(null); setFormFields({ Name:"",ContactName:"",Phone:"",Email:"",Address:"" }); }}>
              Cancel
            </button>
          )}
        </div>
      </form>
      {/* Suppliers table */}
      <div className="overflow-x-auto">
        <table className="min-w-full w-full bg-white rounded-xl shadow text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Contact Name</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Address</th>
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-400">
                  No suppliers found.
                </td>
              </tr>
            ) : suppliers.map(supplier => (
              <tr key={supplier.SupplierID} className="border-b last:border-0">
                <td className="p-3 text-left">{supplier.SupplierID}</td>
                <td className="p-3 text-left">{supplier.Name}</td>
                <td className="p-3 text-left">{supplier.ContactName}</td>
                <td className="p-3 text-left">{supplier.Phone}</td>
                <td className="p-3 text-left">{supplier.Email}</td>
                <td className="p-3 text-left">{supplier.Address}</td>
                {/* ACTIONS: Always horizontal row */}
                <td className="p-3 text-center">
                  <div className="flex flex-row gap-2 justify-center">
                    <button className="bg-blue-500 px-3 py-1 rounded text-white"
                      onClick={() => handleEdit(supplier)}>
                      Edit
                    </button>
                    <button className="bg-red-500 px-3 py-1 rounded text-white"
                      onClick={() => confirmDelete(supplier.SupplierID)}>
                      Delete
                    </button>
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
              <p className="text-gray-500 mb-6">Do you really want to delete this supplier? This action cannot be undone.</p>
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
