import React, { useState, useEffect } from "react";
import { useAuth } from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useUserPreferences } from "../Context/UserPreferencesContext";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export default function MarketplacePage() {
    const { points, totalPointsEarned, availablePoints, getProfile } = useAuth();
    const { equipItem, unequipItem, equippedItems } = useUserPreferences();
    const navigate = useNavigate();
    const [userPoints, setUserPoints] = useState(availablePoints);
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("statusColors");
    const [ownedItems, setOwnedItems] = useState(() => {
        const saved = localStorage.getItem("ownedItems");
        return saved ? JSON.parse(saved) : [];
    });
    const [showOwned, setShowOwned] = useState(false);

    // Fetch points on mount and when points change
    useEffect(() => {
        getProfile();
    }, [getProfile]);

    useEffect(() => {
        setUserPoints(availablePoints);
    }, [availablePoints]);

    // Task status colors (20-100 points each) - with status mapping
    const statusColors = [
        { id: 1, name: "Ocean Blue (Pending)", color: "#3b82f6", price: 30, category: "statusColors", status: "pending" },
        { id: 2, name: "Emerald Green (In Progress)", color: "#10b981", price: 40, category: "statusColors", status: "in progress" },
        { id: 3, name: "Sunset Orange (Completed)", color: "#f59e0b", price: 50, category: "statusColors", status: "completed" },
        { id: 4, name: "Royal Purple (Overdue)", color: "#8b5cf6", price: 60, category: "statusColors", status: "overdue" },
        { id: 5, name: "Rose Pink (Done)", color: "#ec4899", price: 70, category: "statusColors", status: "done" },
        { id: 6, name: "Cyan Teal (Pending)", color: "#14b8a6", price: 80, category: "statusColors", status: "pending" },
        { id: 7, name: "Amber Gold (In Progress)", color: "#fbbf24", price: 90, category: "statusColors", status: "in progress" },
        { id: 8, name: "Crimson Red (Completed)", color: "#ef4444", price: 100, category: "statusColors", status: "completed" },
    ];

    // Fonts (20-100 points each)
    const fonts = [
        { id: 9, name: "Roboto", font: "Roboto", price: 20, category: "fonts" },
        { id: 10, name: "Inter", font: "Inter", price: 30, category: "fonts" },
        { id: 11, name: "Poppins", font: "Poppins", price: 40, category: "fonts" },
        { id: 12, name: "Montserrat", font: "Montserrat", price: 50, category: "fonts" },
        { id: 13, name: "Playfair Display", font: "Playfair Display", price: 60, category: "fonts" },
        { id: 14, name: "Lora", font: "Lora", price: 70, category: "fonts" },
        { id: 15, name: "Merriweather", font: "Merriweather", price: 80, category: "fonts" },
        { id: 16, name: "Cormorant", font: "Cormorant", price: 100, category: "fonts" },
    ];

    // Background colors (20-100 points each)
    const backgroundColors = [
        { id: 17, name: "Midnight Blue", color: "#1e3a8a", price: 30, category: "backgroundColors" },
        { id: 18, name: "Forest Green", color: "#064e3b", price: 40, category: "backgroundColors" },
        { id: 19, name: "Deep Purple", color: "#581c87", price: 50, category: "backgroundColors" },
        { id: 20, name: "Charcoal Gray", color: "#1f2937", price: 60, category: "backgroundColors" },
        { id: 21, name: "Burgundy", color: "#7f1d1d", price: 70, category: "backgroundColors" },
        { id: 22, name: "Navy", color: "#0c4a6e", price: 80, category: "backgroundColors" },
        { id: 23, name: "Dark Teal", color: "#134e4a", price: 90, category: "backgroundColors" },
        { id: 24, name: "Rich Black", color: "#000000", price: 100, category: "backgroundColors" },
    ];

    // Font colors (20-100 points each)
    const fontColors = [
        { id: 25, name: "Snow White", color: "#ffffff", price: 20, category: "fontColors" },
        { id: 26, name: "Light Gray", color: "#e5e7eb", price: 30, category: "fontColors" },
        { id: 27, name: "Sky Blue", color: "#60a5fa", price: 40, category: "fontColors" },
        { id: 28, name: "Emerald", color: "#34d399", price: 50, category: "fontColors" },
        { id: 29, name: "Amber", color: "#fbbf24", price: 60, category: "fontColors" },
        { id: 30, name: "Rose", color: "#fb7185", price: 70, category: "fontColors" },
        { id: 31, name: "Violet", color: "#a78bfa", price: 80, category: "fontColors" },
        { id: 32, name: "Cyan", color: "#22d3ee", price: 90, category: "fontColors" },
        { id: 33, name: "Gold", color: "#fbbf24", price: 100, category: "fontColors" },
    ];

    const allItems = [...statusColors, ...fonts, ...backgroundColors, ...fontColors];
    const filteredItems = showOwned 
        ? allItems.filter(item => ownedItems.includes(item.id))
        : allItems.filter(item => item.category === selectedCategory && !ownedItems.includes(item.id));

    const handleAddToCart = (item) => {
        if (ownedItems.includes(item.id)) {
            alert("You already own this item!");
            return;
        }
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            setCart(cart.map(cartItem => 
                cartItem.id === item.id 
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const handleRemoveFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const handleBuy = async () => {
        const totalCost = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (totalCost > userPoints) {
            alert("Not enough points!");
            return;
        }
        
        try {
            // Update points via API
            await axios.patch(`${API_URL}/profile/update_points/`, {
                points_to_deduct: totalCost
            });
            
            // Add items to owned items
            const newOwnedItems = [...ownedItems, ...cart.map(item => item.id)];
            setOwnedItems(newOwnedItems);
            localStorage.setItem("ownedItems", JSON.stringify(newOwnedItems));
            
            // Refresh points from API
            await getProfile();
            setCart([]);
            alert("Purchase successful! You can now equip your items.");
        } catch (error) {
            console.error("Error purchasing items:", error);
            alert(error.response?.data?.error || "Failed to purchase items. Please try again.");
        }
    };

    const handleEquip = (item) => {
        equipItem(item);
        alert(`${item.name} equipped!`);
    };

    const handleUnequip = (category, status = null) => {
        unequipItem(category, status);
        alert("Item unequipped!");
    };

    const isEquipped = (item) => {
        if (item.category === "fonts") {
            return equippedItems.font === item.id;
        } else if (item.category === "backgroundColors") {
            return equippedItems.backgroundColor === item.id;
        } else if (item.category === "statusColors") {
            return equippedItems.statusColors[item.status] === item.id;
        }
        return false;
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold text-white">Marketplace</h1>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-500/20 px-6 py-2 rounded-lg border border-blue-500/50">
                            <div className="text-white font-semibold">
                                <div>Total Earned: {totalPointsEarned.toLocaleString()}</div>
                                <div className="text-sm text-blue-300">Available: {userPoints.toLocaleString()}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/calendar")}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Back to Calendar
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Products Grid */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {showOwned ? "My Items" : "Featured Items"}
                            </h2>
                            <button
                                onClick={() => setShowOwned(!showOwned)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    showOwned
                                        ? "bg-green-600 text-white"
                                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                }`}
                            >
                                {showOwned ? "Show Store" : "My Items"}
                            </button>
                        </div>
                        
                        {!showOwned && (
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setSelectedCategory("statusColors")}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        selectedCategory === "statusColors"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                                >
                                    Status Colors
                                </button>
                                <button
                                    onClick={() => setSelectedCategory("fonts")}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        selectedCategory === "fonts"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                                >
                                    Fonts
                                </button>
                                <button
                                    onClick={() => setSelectedCategory("backgroundColors")}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        selectedCategory === "backgroundColors"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                                >
                                    Backgrounds
                                </button>
                                <button
                                    onClick={() => setSelectedCategory("fontColors")}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        selectedCategory === "fontColors"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                                >
                                    Font Colors
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredItems.length === 0 ? (
                                <div className="col-span-2 text-center py-10 text-slate-400">
                                    {showOwned ? "You don't own any items yet." : "No items available in this category."}
                                </div>
                            ) : (
                                filteredItems.map((item) => {
                                    const owned = ownedItems.includes(item.id);
                                    const equipped = isEquipped(item);
                                    
                                    return (
                                        <div
                                            key={item.id}
                                            className={`bg-slate-800/50 border rounded-lg p-4 transition-all ${
                                                equipped ? "border-green-500 border-2" : "border-slate-700 hover:border-blue-400"
                                            }`}
                                        >
                                            {item.color ? (
                                                <div
                                                    className="w-full h-32 rounded mb-4"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-full h-32 rounded mb-4 bg-slate-700 flex items-center justify-center"
                                                    style={{ fontFamily: item.font }}
                                                >
                                                    <span className="text-white text-xl">{item.name}</span>
                                                </div>
                                            )}
                                            <h3 className="font-bold text-white text-lg mb-2">{item.name}</h3>
                                            {!showOwned && (
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-400 font-bold">{item.price}</span>
                                                        <span className="text-slate-400 text-sm">points</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddToCart(item)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            )}
                                            {showOwned && (
                                                <div className="flex gap-2">
                                                    {equipped ? (
                                                        <button
                                                            onClick={() => {
                                                                if (item.category === "statusColors") {
                                                                    handleUnequip("statusColors", item.status);
                                                                } else {
                                                                    handleUnequip(item.category);
                                                                }
                                                            }}
                                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded transition-colors"
                                                        >
                                                            Unequip
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEquip(item)}
                                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded transition-colors"
                                                        >
                                                            Equip
                                                        </button>
                                                    )}
                                                    {equipped && (
                                                        <span className="bg-green-500/20 text-green-400 px-3 py-2 rounded text-sm font-semibold">
                                                            Equipped
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Cart Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-white mb-4">Cart ({cart.length})</h3>

                            {cart.length === 0 ? (
                                <p className="text-slate-400 text-sm">Your cart is empty</p>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded">
                                                <div>
                                                    <p className="text-white font-semibold text-sm">{item.name}</p>
                                                    <p className="text-slate-400 text-xs">x{item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-yellow-400 font-bold">{item.price * item.quantity}</p>
                                                    <button
                                                        onClick={() => handleRemoveFromCart(item.id)}
                                                        className="text-red-400 text-xs hover:text-red-300"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-600 pt-3 mb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-slate-300">Total:</span>
                                            <span className="text-yellow-400 font-bold text-lg">{cartTotal}</span>
                                        </div>
                                        <p className={`text-sm ${cartTotal > userPoints ? "text-red-400" : "text-green-400"}`}>
                                            {cartTotal > userPoints ? `Need ${cartTotal - userPoints} more points` : "Sufficient points"}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleBuy}
                                        disabled={cartTotal > userPoints}
                                        className={`w-full text-white py-2 rounded transition-colors ${
                                            cartTotal > userPoints
                                                ? "bg-slate-600 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700"
                                        }`}
                                    >
                                        Buy Now
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
