import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { urlPrefix,urlPrefixLive } from "../store/store";

export default function Customers() {
  const [customers, setCustomers] = useState(null); // null = loading, [] = no data, array = data
  const [formMode, setFormMode] = useState("add");
  const [editCustomer, setEditCustomer] = useState(null);
  const [formData, setFormData] = useState({
    Name: "",
    Phone: "",
    Email: "",
    Address: ""
  });
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Add mounted guard
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetchCustomers();
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchCustomers = async () => {
    setError(null);
    setCustomers(null);
    try {
      const response = await fetch(urlPrefixLive + "customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerID: 0,
          name: "",
          phone: "",
          email: "",
          address: "",
          flag: "view"
        })
      });
      if (!mounted.current) return;
      if (response.ok) setCustomers(await response.json());
      else setError("Server error occurred. Please refresh.");
    } catch {
      if (!mounted.current) return;
      setError("Network problem happened. Please refresh.");
    }
  };

  const handleEdit = customer => {
    setFormMode("edit");
    setEditCustomer(customer);
    setFormData({
      Name: customer.Name || "",
      Phone: customer.Phone || "",
      Email: customer.Email || "",
      Address: customer.Address || ""
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({ Name: "", Phone: "", Email: "", Address: "" });
    setEditCustomer(null);
    setFormMode("add");
  };

  const confirmDelete = id => setDeleteConfirm({ show: true, id });
  const doDelete = async () => {
    await fetch(urlPrefixLive + "customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerID: deleteConfirm.id,
        name: "",
        phone: "",
        email: "",
        address: "",
        flag: "delete"
      })
    });
    setDeleteConfirm({ show: false, id: null });
    fetchCustomers();
  };
  const cancelDelete = () => setDeleteConfirm({ show: false, id: null });

  const handleFormSubmit = async e => {
    e.preventDefault();
    if (formMode === "add") {
      await fetch(urlPrefixLive + "customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerID: 0,
          ...formData,
          flag: "Create"
        })
      });
    } else if (formMode === "edit") {
      await fetch(urlPrefixLive + "customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerID: editCustomer.CustomerID,
          ...formData,
          flag: "update"
        })
      });
    }
    resetForm();
    await fetchCustomers();
  };

  // Defensive rendering so it never returns blank
  if (error) {
    return (
      <div className="mb-12 flex flex-col items-center justify-center h-72">
        <div className="text-red-600 font-bold mb-4">{error}</div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={fetchCustomers}>Refresh</button>
      </div>
    );
  }

  if (customers === null) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-lg">Loading customers...</div>
    );
  }

  return (
    <div className="mb-12 max-w-3xl mx-auto">
      {/* Enhanced add/edit customer form */}
      <form onSubmit={handleFormSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">
          {formMode === "add" ? "Add New Customer" : "Edit Customer"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              name="Name"
              className="border px-3 py-2 rounded w-full"
              value={formData.Name}
              onChange={handleFormChange}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="Phone"
              className="border px-3 py-2 rounded w-full"
              value={formData.Phone}
              onChange={handleFormChange}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="Email"
              className="border px-3 py-2 rounded w-full"
              value={formData.Email}
              onChange={handleFormChange}
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="Address"
              className="border px-3 py-2 rounded w-full"
              value={formData.Address}
              onChange={handleFormChange}
              placeholder="Enter address"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-semibold">
            {formMode === "add" ? "Add Customer" : "Update Customer"}
          </button>
          {formMode === "edit" && (
            <button
              type="button"
              className="bg-gray-300 px-6 py-2 rounded font-semibold"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Enhanced customers table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Address</th>
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-400">
                  No customers found.
                </td>
              </tr>
            ) : customers.map(customer => (
              <tr key={customer.CustomerID} className="border-b last:border-0">
                <td className="p-3 text-left">{customer.CustomerID}</td>
                <td className="p-3 text-left font-medium">{customer.Name}</td>
                <td className="p-3 text-left">{customer.Phone}</td>
                <td className="p-3 text-left">{customer.Email || "-"}</td>
                <td className="p-3 text-left">{customer.Address || "-"}</td>
                <td className="p-3 text-center space-x-1">
                  <button
                    className="bg-blue-500 px-3 py-1 rounded text-white text-xs"
                    onClick={() => handleEdit(customer)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 px-3 py-1 rounded text-white text-xs"
                    onClick={() => confirmDelete(customer.CustomerID)}
                  >
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
              <p className="text-gray-500 mb-6">Do you really want to delete this customer? This action cannot be undone.</p>
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
