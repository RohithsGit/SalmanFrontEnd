import React from 'react';
import { motion } from 'framer-motion';


// Billing Panel
export function BillingPanel({ billingData }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Billing System</h2>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <input type="text" placeholder="Search products..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center font-semibold text-gray-700 mb-4">
          <div>Product</div>
          <div>Quantity</div>
          <div>Price</div>
          <div>Total</div>
        </div>
        <div>
          {billingData.map((product, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-center py-3 border-b">
              <div className="font-medium">{product.name}</div>
              <div><input type="number" defaultValue="1" className="w-16 px-2 py-1 border rounded text-center" /></div>
              <div className="font-semibold text-black-600">₹{product.price}</div>
              <div className="font-bold text-green-600">₹{product.price}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t text-right">
          <div className="text-2xl font-bold text-green-600">Total: ₹4599</div>
          <button className="mt-4 px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition duration-200">
            Generate Bill
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Customers Panel
export function CustomersPanel({ customers }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Customers Management</h2>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <table className="min-w-full">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-2 text-left font-semibold">Name</th>
              <th className="p-2 text-left font-semibold">Phone</th>
              <th className="p-2 text-left font-semibold">Email</th>
              <th className="p-2 text-left font-semibold">Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => (
              <tr key={idx}>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.phone}</td>
                <td className="p-2">{c.email}</td>
                <td className="p-2">{c.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// Sidebar
export function Sidebar({ menuItems, activePanel, setActivePanel }) {
  return (
    <motion.aside initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-64 bg-white border-r shadow-lg h-full flex flex-col pt-6 flex-shrink-0">
      <div className="px-4 mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">Management</h3>
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActivePanel(item.name)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activePanel === item.name
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

// Inventory Panel
export function InventoryPanel({ inventoryData, products }) {
  return (
    <motion.aside initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-80 bg-gradient-to-b from-green-50 to-green-100 border-l shadow-lg h-full flex flex-col p-6 flex-shrink-0 overflow-auto">
      <h2 className="font-bold text-xl mb-6 text-green-700 flex items-center">
        <span className="mr-2">📦</span>
        Inventory Status
      </h2>
      <div className="space-y-4">
        {inventoryData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg shadow-sm ${item.low ? 'bg-red-50 border border-red-200' : 'bg-white border border-green-200'}`}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm text-gray-700">{item.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.low ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                {item.stock}
              </span>
            </div>
            {item.low && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-600 mt-2 font-medium">
                ⚠️ Low Stock Alert!
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6 w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-green-700 transition duration-200">
        Update Inventory
      </motion.button>
      <div className="mt-auto pt-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-semibold text-gray-700 mb-2">Quick Stats</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Total Products: <span className="font-bold">{products.length || '420'}</span></div>
            <div>Low Stock: <span className="font-bold text-red-600">12</span></div>
            <div>Last Updated: <span className="font-bold">Today</span></div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

// Logout Popup
export function LogoutPopup({ show, onConfirm, onCancel }) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black/30 z-50"
        style={{ pointerEvents: show ? 'auto' : 'none' }}
      >
        <motion.div
          initial={{ y: 40, scale: 0.92, opacity: 0.85 }}
          animate={{ y: show ? 0 : 50, scale: show ? 1.09 : 0.92, opacity: show ? 1 : 0.85 }}
          exit={{ y: 40, scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", stiffness: 230, damping: 23 }}
          className="bg-white rounded-3xl shadow-2xl px-14 py-12 max-w-md min-w-[370px] text-center"
          style={{ boxShadow: "0 12px 48px 0 rgba(30,55,90,0.18)" }}
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-3">Confirmation</h2>
          <p className="mb-7 text-gray-800 text-lg font-medium">Really want to go?</p>
          <div className="flex justify-center gap-7">
            <button
              onClick={onConfirm}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 focus:outline-none transition-all"
            >
              Yes
            </button>
            <button
              onClick={onCancel}
              className="px-8 py-3 rounded-xl bg-gray-100 text-blue-700 font-bold text-lg hover:bg-gray-200 focus:outline-none transition-all"
            >
              No
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }
