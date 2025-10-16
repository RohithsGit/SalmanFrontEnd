import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

// --- Product List ---
const products = [
  { id: 1, name: "Banarasi Silk Saree", price: 3800 },
  { id: 2, name: "Cotton Kurta", price: 799 },
  { id: 3, name: "Fancy Dupatta", price: 599 },
  { id: 4, name: "Designer Lehenga", price: 8500 },
  { id: 5, name: "Silk Blouse", price: 1200 },
  { id: 6, name: "Party Wear Dress", price: 2300 }
];

// --- BillPreviewModal Subcomponent ---
const BillPreviewModal = ({ open, onClose, billItems, customerName, customerMobile, finalTotal }) => {
  const billViewRef = useRef();

  // Upload bill image to ASP.NET backend
  const handleDownload = async () => {
    if (!billViewRef.current) return;
    const canvas = await html2canvas(billViewRef.current, { useCORS: true, backgroundColor: "#fff" });

    // Convert canvas to Blob for upload
    canvas.toBlob(async (blob) => {
      if (!blob) { alert("Failed to export image."); return; }
      const date = new Date().toISOString().slice(0, 10);
      const file = new File([blob], `bill-${Date.now()}.png`, { type: "image/png" });
      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadResp = await fetch("https://localhost:7012/api/Bill/SaveBill", {
          method: "POST",
          body: formData
        });
        const uploadResult = await uploadResp.json();
        if (uploadResp.ok) {
          alert("Bill uploaded and saved to server at: " + uploadResult.filePath);
        } else {
          alert("Upload failed: " + (uploadResult || "Error"));
        }
      } catch (err) {
        alert("Upload error: " + err.message);
      }
    }, "image/png");
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-2xl w-full relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-purple-700 text-center">Clothing Shop Bill Preview</h2>
        <div ref={billViewRef} className="border rounded-xl bg-purple-50 py-4 px-6 mb-4">
          <div className="flex justify-between mb-2">
            <div>
              <div className="text-lg font-bold text-purple-800">Salman Shop</div>
              <div className="text-xs text-gray-500">Billing Date: {new Date().toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">Customer: {customerName || "-"} ({customerMobile || "-"})</div>
            </div>
            <div className="text-right font-bold text-blue-600">Grand Total: ₹{finalTotal}</div>
          </div>
          <table className="min-w-full my-3 border border-gray-300 text-base">
            <thead className="bg-purple-300 text-purple-900"><tr>
              <th className="p-2">Qty</th>
              <th className="p-2 text-left">Product</th>
              <th className="p-2">Rate</th>
              <th className="p-2">Discount</th>
              <th className="p-2">Final</th>
              <th className="p-2">Total</th>
            </tr></thead>
            <tbody>
            {billItems.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-2 text-gray-400">No products</td></tr>
            ) : billItems.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="p-1 text-center">{i.quantity}</td>
                <td className="p-1">{i.productName}</td>
                <td className="p-1 text-right">₹{i.originalPrice}</td>
                <td className="p-1 text-right">₹{i.discount}</td>
                <td className="p-1 text-right text-blue-800">₹{i.finalPrice}</td>
                <td className="p-1 text-right font-black text-green-700">₹{i.total}</td>
              </tr>
            ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="bg-green-200 px-4 py-2 rounded-xl text-2xl font-black text-green-700">
              ₹{finalTotal}
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleDownload}
            className="bg-purple-700 text-white font-bold text-lg rounded-xl py-2 px-8 shadow-lg hover:bg-purple-800 transition-all"
          >
            Download to Server
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Billing Component ---
const Billing = () => {
  const billRef = useRef(null);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [bargain, setBargain] = useState(0);
  const [items, setItems] = useState([]);
  const [finalize, setFinalize] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  const [currentProduct, setCurrentProduct] = useState({
    search: "",
    selectedProduct: null,
    quantity: 1,
    discount: 0,
    finalPrice: 0,
    showDropdown: false
  });

  // Bill preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);

  const actualAmount = items.reduce((t, i) => t + i.originalPrice * i.quantity, 0);
  const subtotal = items.reduce((t, i) => t + i.total, 0);
  const afterBargain = Math.max(0, subtotal - bargain);
  const grandTotal = Math.max(0, afterBargain);
  useEffect(() => setFinalTotal(grandTotal), [grandTotal]);

  const handleFieldChange = (idx, field, val) =>
    setItems(items.map((item, i) => {
      if (i !== idx) return item;
      let up = { ...item, [field]: field === "productName" ? val : Number(val) };
      if (field === "discount" || field === "finalPrice") {
        up.finalPrice = field === "discount"
          ? Math.max(item.originalPrice - Number(val), 0)
          : Number(val);
        up.discount = field === "finalPrice"
          ? Math.max(item.originalPrice - Number(val), 0)
          : Number(val);
      }
      up.total = up.finalPrice * up.quantity;
      return up;
    }));

  const filteredProducts = currentProduct.search
    ? products.filter((p) => p.name.toLowerCase().includes(currentProduct.search.toLowerCase()))
    : products;

  const selectProduct = (p) =>
    setCurrentProduct({
      ...currentProduct,
      selectedProduct: p,
      search: p.name,
      finalPrice: p.price,
      discount: 0,
      showDropdown: false
    });

  const addItem = () => {
    if (!currentProduct.selectedProduct || currentProduct.quantity < 1) return;
    const d = currentProduct.discount > 0
      ? Math.max(Math.min(currentProduct.discount, currentProduct.selectedProduct.price), 0)
      : 0;
    const fp = Math.max(currentProduct.selectedProduct.price - d, 0);
    const newI = {
      id: Date.now(),
      productId: currentProduct.selectedProduct.id,
      productName: currentProduct.selectedProduct.name,
      originalPrice: currentProduct.selectedProduct.price,
      quantity: currentProduct.quantity,
      discount: d,
      finalPrice: fp,
      total: fp * currentProduct.quantity
    };
    setItems([...items, newI]);
    setCurrentProduct({
      search: "", selectedProduct: null, quantity: 1, discount: 0, finalPrice: 0, showDropdown: false
    });
  };

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const handleSendWhatsApp = async () => {
    const apiKey = "6e9e7209e2eb64715b23044533cc3aff";
    if (!billRef.current) { alert("Bill not generated."); return; }
    if (!customerMobile || customerMobile.length < 10) { alert("Enter correct number."); return; }
    const canvas = await html2canvas(billRef.current, { useCORS: true, backgroundColor: "#fff" });
    const dataUrl = canvas.toDataURL("image/png");
    const formData = new FormData();
    formData.append("image", dataUrl.replace(/^data:image\/png;base64,/, ""));
    const upload = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body: formData });
    const json = await upload.json();
    if (!json.success) { alert("Upload failed"); return; }
    const imageUrl = json.data.url;
    const resp = await fetch("https://localhost:7012/api/Salman/SendImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ RecipientNumber: customerMobile, ImageUrl: imageUrl })
    });
    const result = await resp.json();
    alert(result.success ? "Bill sent!" : "Failed: " + result.result);
  };

  return (
    <div className="w-full min-h-fit flex justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 pt-4 pb-4">
      <div className="w-full max-w-4xl bg-white rounded-xl p-4 shadow border border-gray-300 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-2xl font-black text-blue-800">Salman Shop Billing</h2>
          <div className="flex gap-3">
            <div className="flex flex-col">
              <label className="text-gray-700 text-xs font-semibold">Customer Name</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={finalize}
                className="w-40 border border-gray-300 rounded px-2 py-1 bg-gray-50"
                placeholder="Name"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 text-xs font-semibold">Mobile</label>
              <input
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ""))}
                maxLength="10"
                disabled={finalize}
                className="w-36 border border-gray-300 rounded px-2 py-1 bg-gray-50"
                placeholder="Mobile"
              />
            </div>
          </div>
        </div>

        {/* Product Add Row */}
        {!finalize && (
          <div className="grid grid-cols-6 gap-2 p-2 border border-gray-200 bg-gray-50 rounded-md">
            <div className="flex flex-col relative col-span-2">
              <label className="text-xs text-gray-700 font-semibold mb-0.5">Product</label>
              <input
                type="text"
                value={currentProduct.search}
                onFocus={() => setCurrentProduct({ ...currentProduct, showDropdown: true })}
                onBlur={() => setTimeout(() => setCurrentProduct((c) => ({ ...c, showDropdown: false })), 150)}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, search: e.target.value, showDropdown: true, selectedProduct: null })
                }
                className="border border-gray-300 rounded px-2 py-1 bg-white text-sm"
                placeholder="Select"
              />
              {currentProduct.showDropdown && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow z-10">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => selectProduct(p)}
                      className="px-3 py-1 flex justify-between hover:bg-gray-100 text-sm cursor-pointer"
                    >
                      <span>{p.name}</span>
                      <span className="text-blue-600 font-bold">₹{p.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-700 font-semibold mb-0.5">Qty</label>
              <input
                type="number"
                min="1"
                value={currentProduct.quantity}
                onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: Number(e.target.value) })}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-700 font-semibold mb-0.5">MRP</label>
              <input
                type="number"
                disabled
                value={currentProduct.selectedProduct?.price || ""}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-blue-50"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-700 font-semibold mb-0.5">Discount</label>
              <input
                type="number"
                min="0"
                value={currentProduct.discount}
                disabled={!currentProduct.selectedProduct}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    discount: Number(e.target.value),
                    finalPrice: currentProduct.selectedProduct
                      ? Math.max(currentProduct.selectedProduct.price - Number(e.target.value), 0)
                      : 0
                  })
                }
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addItem}
                disabled={!currentProduct.selectedProduct}
                className={`w-full py-1 rounded font-black text-base ${
                  currentProduct.selectedProduct ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400"
                }`}
              >
                ➕
              </button>
            </div>
          </div>
        )}

        {/* Bill Table */}
        <div ref={finalize ? billRef : undefined}>
          <table className="min-w-full border border-gray-400 text-sm">
            <thead className="bg-blue-50 text-blue-900 font-bold">
              <tr>
                <th className="p-2">Qty</th><th className="p-2 text-left">Product</th>
                <th className="p-2">MRP</th><th className="p-2">Discount</th>
                <th className="p-2">Final</th><th className="p-2">Total</th>
                {!finalize && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={finalize ? 6 : 7} className="text-center text-gray-400 py-2">No products</td></tr>
              )}
              {items.map((i, idx) => (
                <tr key={i.id} className="border-b">
                  <td className="p-1 text-center">{i.quantity}</td>
                  <td className="p-1">{i.productName}</td>
                  <td className="p-1 text-right">₹{i.originalPrice}</td>
                  <td className="p-1 text-right">
                    {!finalize ? (
                      <input
                        type="number"
                        min={0}
                        value={i.discount}
                        onChange={(e) => handleFieldChange(idx, "discount", e.target.value)}
                        className="w-14 border border-gray-300 rounded px-1 py-0.5 text-sm text-right bg-gray-50"
                      />
                    ) : (
                      <>₹{i.discount}</>
                    )}
                  </td>
                  <td className="p-1 text-right text-blue-800">₹{i.finalPrice}</td>
                  <td className="p-1 text-right font-black text-green-700">₹{i.total}</td>
                  {!finalize && (
                    <td className="p-1 text-center">
                      <button onClick={() => removeItem(i.id)} className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600">
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-end items-center">
          <div className="flex flex-col">
            <label className="text-xs text-gray-700 font-semibold">Actual</label>
            <input className="border border-gray-300 rounded px-2 py-1 bg-gray-100 font-bold text-sm w-[90px]" disabled value={actualAmount} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-700 font-semibold">Bargain</label>
            <input
              type="number" min={0} value={bargain} onChange={(e) => setBargain(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 bg-gray-50 font-bold text-sm w-[90px]" disabled={finalize}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-700 font-semibold">Subtotal</label>
            <input className="border border-gray-300 rounded px-2 py-1 bg-blue-50 font-bold text-sm w-[90px]" disabled value={afterBargain} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-700 font-semibold">Total</label>
            <input
              type="number" value={finalTotal} onChange={(e) => setFinalTotal(Number(e.target.value))}
              className="border border-green-400 rounded px-2 py-1 bg-green-50 font-bold text-sm w-[100px]"
            />
          </div>
          {!finalize && (
            <button onClick={() => setFinalize(true)} className="py-2 px-6 bg-green-600 text-white rounded font-black hover:bg-green-700">
              Finalize Bill
            </button>
          )}
        </div>

        {/* After Finalize: Bill Preview and Send WhatsApp */}
        {finalize && (
          <div className="flex justify-between items-center mt-1">
            <div className="flex flex-row gap-3">
              <button onClick={() => setPreviewOpen(true)} className="py-2 px-7 bg-purple-700 text-white rounded font-black hover:bg-purple-800">
                Bill Preview
              </button>
              <button onClick={() => setFinalize(false)} className="py-2 px-6 bg-gray-200 text-blue-800 rounded font-black hover:bg-gray-300">
                ← Edit
              </button>
            </div>
            <button onClick={handleSendWhatsApp} className="py-2 px-8 bg-blue-700 text-white rounded font-black hover:bg-blue-800">
              Send Bill to WhatsApp
            </button>
          </div>
        )}

        {/* Bill Preview Modal */}
        <BillPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          billItems={items}
          customerName={customerName}
          customerMobile={customerMobile}
          finalTotal={finalTotal}
        />
      </div>
    </div>
  );
};

export default Billing;
