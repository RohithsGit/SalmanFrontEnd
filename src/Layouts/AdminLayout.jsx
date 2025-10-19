import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Category from '../Pages/Category.jsx';
import Color from '../Pages/Color.jsx';
import Size from '../Pages/Size.jsx';
import Product from '../Pages/Product';
import Billing from "../Pages/Billing.jsx";
import { Sidebar, LogoutPopup } from "./Components/AdminMiniComponents.jsx";

export default function AdminLayout() {
  const [activePanel, setActivePanel] = useState('Billing'); // Default to Billing
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Billing', icon: '🧾' },
    { name: 'Categories', icon: '📂' },
    { name: 'Colors', icon: '🎨' },
    { name: 'Size', icon: '🏢' }
    // Inventory button is not in sidebar
  ];

  const handleLogoutClick = () => { setShowLogoutPopup(true); };
  const handleLogoutConfirm = () => {
    setShowLogoutPopup(false);
    navigate('/');
  };
  const handleLogoutCancel = () => { setShowLogoutPopup(false); };

  // -- Inventory button: sets special state, closes if other menu/clicks --
  const handleInventoryClick = () => {
    setShowInventory(true);
  };
  const handleCloseInventory = () => {
    setShowInventory(false);
  };

  // Menu click: always close inventory and set panel
  const handleMenuPanel = panel => {
    setShowInventory(false); // always close inventory view on menu click
    setActivePanel(panel);
  };

  // --- Render Main Content ---
  const renderMainContent = () => {
    if (showInventory) {
      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-700">Inventory</h2>
            <button className="px-4 py-2 bg-green-200 text-green-900 rounded-lg font-semibold hover:bg-green-300" onClick={handleCloseInventory}>Close Inventory</button>
          </div>
          <Product />
        </div>
      );
    }
    switch (activePanel) {
      case 'Products': return <Product />;
      case 'Billing': return <Billing/>;
      case 'Categories': return <Category />;
      case 'Colors': return <Color />;
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
          <motion.li whileHover={{ scale: 1.05 }} className="hover:text-blue-500 transition-colors duration-300 cursor-pointer font-semibold">Profile</motion.li>
        </ul>
        <div className="flex flex-row gap-4 items-center">
          {/* Green Inventory Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full px-6 py-2 bg-green-600 text-white shadow-lg hover:bg-green-700 transition duration-200 font-semibold"
            onClick={handleInventoryClick}
          >
            Inventory
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full px-6 py-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition duration-200 font-semibold"
            onClick={handleLogoutClick}
          >
            Logout
          </motion.button>
        </div>
      </nav>
      <div className="flex flex-1 h-0">
        <Sidebar
          menuItems={menuItems}
          activePanel={activePanel}
          setActivePanel={panel => handleMenuPanel(panel)}
        />
        <main className="flex-1 p-8 h-full overflow-auto">{renderMainContent()}</main>
      </div>
    </div>
  );
}
