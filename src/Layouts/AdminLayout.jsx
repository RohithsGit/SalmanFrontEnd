import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Brand from "../Pages/Brand.jsx";
import Category from '../Pages/Category.jsx';
import Color from '../Pages/Color.jsx';
import Supplier from '../Pages/Suppliers.jsx';
import Size from '../Pages/Size.jsx';
import Product from '../Pages/Product';
import Customers from "../Pages/Customers.jsx";
import Billing from "../Pages/Billing.jsx";
import {  Sidebar, LogoutPopup } from "./Components/AdminMiniComponents.jsx";

// --- Inventory Widget for Navbar ---
function InventoryStatsWidget({ inventoryData, products }) {
  const totalProducts = products.length || 0;
  const lowStock = inventoryData.filter(x => x.low).length;

  return (
    <div className="flex items-center space-x-7 ml-6">
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 font-medium">Total Products</span>
        <span className="text-lg font-bold text-blue-700">{totalProducts}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 font-medium">Low Stock</span>
        <span className="text-lg font-bold text-red-600">{lowStock}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 font-medium">Last Updated</span>
        <span className="text-lg font-bold">Today</span>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [activePanel, setActivePanel] = useState('Products');
  const [products, setProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [billingData, setBillingData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Products', icon: '👕' },
    { name: 'Billing', icon: '🧾' },
    { name: 'Customers', icon: '👥' },
    { name: 'Brands', icon: '🏷️' },
    { name: 'Categories', icon: '📂' },
    { name: 'Colors', icon: '🎨' },
    { name: 'Suppliers', icon: '🏢' },
    { name: 'Size', icon: '🏢' }
  ];

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([
        { sku: 'SAR101', name: 'Banarasi Silk Saree', brand: 'FabIndia', price: 3800, stock: 15 },
        { sku: 'KRT202', name: 'Cotton Kurta', brand: 'Raymond', price: 799, stock: 40 },
        { sku: 'LHG303', name: 'Embroidered Lehenga', brand: 'Biba', price: 5200, stock: 8 },
        { sku: 'SHW404', name: 'Silk Sherwani', brand: 'Manyavar', price: 6000, stock: 3 }
      ]));
  }, []);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => setInventoryData(data))
      .catch(() => setInventoryData([
        { name: 'Banarasi Silk Saree', stock: 15, low: false },
        { name: 'Cotton Kurta', stock: 3, low: true },
        { name: 'Embroidered Lehenga', stock: 8, low: false },
        { name: 'Silk Sherwani', stock: 2, low: true }
      ]));
  }, []);

  useEffect(() => {
    fetch('/api/billing')
      .then(res => res.json())
      .then(data => setBillingData(data))
      .catch(() => setBillingData(products.slice(0, 2)));
  }, [products]);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(() => setCustomers([
        { name: 'Anjali Sharma', phone: '9845012345', email: 'anjali@gmail.com', address: 'Banjara Hills, Hyderabad' },
        { name: 'Rahul Verma', phone: '9811112233', email: 'rahul@gmail.com', address: 'Colaba, Mumbai' }
      ]));
  }, []);

  const handleLogoutClick = () => { setShowLogoutPopup(true); };
  const handleLogoutConfirm = () => {
    setShowLogoutPopup(false);
    navigate('/');
  };
  const handleLogoutCancel = () => { setShowLogoutPopup(false); };

  const renderMainContent = () => {
    switch (activePanel) {
      case 'Products': return <Product />;
      case 'Billing': return <Billing/> 
      case 'Customers': return <Customers/>;
      case 'Brands': return <Brand />;
      case 'Categories': return <Category />;
      case 'Colors': return <Color />;
      case 'Suppliers': return <Supplier />;
      case 'Size': return <Size />;
      
      default:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">{activePanel}</h2>
              <p className="text-gray-600">This section is under development</p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col overflow-hidden">
      <AnimatePresence>
        {showLogoutPopup && (
          <LogoutPopup
            show={showLogoutPopup}
            onConfirm={handleLogoutConfirm}
            onCancel={handleLogoutCancel}
          />
        )}
      </AnimatePresence>
      <nav className="flex items-center justify-between h-16 px-8 bg-white shadow-lg z-10 flex-shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold text-blue-700">
          Clothify
        </motion.div>
        <ul className="flex space-x-6 items-center">
          <motion.li whileHover={{ scale: 1.05 }} className="hover:text-blue-500 transition-colors duration-300 cursor-pointer font-semibold">Home</motion.li>
          <motion.li whileHover={{ scale: 1.05 }} className="hover:text-blue-500 transition-colors duration-300 cursor-pointer font-semibold">Reports</motion.li>
          <motion.li whileHover={{ scale: 1.05 }} className="hover:text-blue-500 transition-colors duration-300 cursor-pointer font-semibold">Settings</motion.li>
          <InventoryStatsWidget inventoryData={inventoryData} products={products} />
        </ul>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full px-6 py-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition duration-200 font-semibold"
          onClick={handleLogoutClick}
        >
          Logout
        </motion.button>
      </nav>
      <div className="flex flex-1 h-0">
        <Sidebar menuItems={menuItems} activePanel={activePanel} setActivePanel={setActivePanel} />
        <main className="flex-1 p-8 h-full overflow-auto">{renderMainContent()}</main>
        {/* InventoryPanel removed */}
      </div>
    </div>
  );
}
