import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error("useUserPreferences must be used within UserPreferencesProvider");
    }
    return context;
};

export const UserPreferencesProvider = ({ children }) => {
    const [font, setFont] = useState(() => {
        const saved = localStorage.getItem("userFont");
        return saved || "Roboto";
    });
    const [backgroundColor, setBackgroundColor] = useState(() => {
        const saved = localStorage.getItem("userBackgroundColor");
        return saved || null;
    });
    const [statusColors, setStatusColors] = useState(() => {
        const saved = localStorage.getItem("userStatusColors");
        return saved ? JSON.parse(saved) : {};
    });
    const [fontColor, setFontColor] = useState(() => {
        const saved = localStorage.getItem("userFontColor");
        return saved || null;
    });
    const [equippedItems, setEquippedItems] = useState(() => {
        const saved = localStorage.getItem("equippedItems");
        return saved ? JSON.parse(saved) : {
            font: null,
            backgroundColor: null,
            fontColor: null,
            statusColors: {}
        };
    });

    // Apply font globally
    useEffect(() => {
        if (font) {
            document.documentElement.style.setProperty("--user-font", font);
            // Import font if it's a Google Font
            if (!document.querySelector(`link[href*="${font}"]`)) {
                const link = document.createElement("link");
                link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, "+")}:wght@400;500;600;700&display=swap`;
                link.rel = "stylesheet";
                document.head.appendChild(link);
            }
        }
    }, [font]);

    // Apply background color globally
    useEffect(() => {
        const applyBackground = () => {
            if (backgroundColor) {
                document.documentElement.style.setProperty("--user-background-color", backgroundColor);
                // Apply to body using inline style (overrides CSS)
                document.body.style.backgroundColor = backgroundColor;
                document.body.style.backgroundImage = 'none';
                // Apply to all elements with min-h-screen class
                document.querySelectorAll('.min-h-screen').forEach(el => {
                    el.style.backgroundColor = backgroundColor;
                    el.style.backgroundImage = 'none';
                });
                // Apply to gradient backgrounds - override gradient
                document.querySelectorAll('.bg-gradient-to-br').forEach(el => {
                    el.style.backgroundColor = backgroundColor;
                    el.style.backgroundImage = 'none';
                });
            } else {
                document.documentElement.style.removeProperty("--user-background-color");
                document.body.style.backgroundColor = '';
                document.body.style.backgroundImage = '';
                document.querySelectorAll('.min-h-screen').forEach(el => {
                    el.style.backgroundColor = '';
                    el.style.backgroundImage = '';
                });
                document.querySelectorAll('.bg-gradient-to-br').forEach(el => {
                    el.style.backgroundColor = '';
                    el.style.backgroundImage = '';
                });
            }
        };
        
        applyBackground();
        // Reapply after a short delay to catch dynamically added elements
        const timeout = setTimeout(applyBackground, 100);
        return () => clearTimeout(timeout);
    }, [backgroundColor]);

    // Apply status colors
    useEffect(() => {
        // Clear all status color variables first
        const statusKeys = ['pending', 'in progress', 'in-progress', 'completed', 'overdue', 'done', 'abandoned'];
        statusKeys.forEach(status => {
            document.documentElement.style.removeProperty(`--status-color-${status}`);
        });
        
        // Apply new status colors
        Object.entries(statusColors).forEach(([status, color]) => {
            // Handle both "in progress" and "in-progress" formats
            const normalizedStatus = status === "in progress" ? "in-progress" : status;
            document.documentElement.style.setProperty(`--status-color-${normalizedStatus}`, color);
            // Also set for space version if it's in progress
            if (status === "in progress") {
                document.documentElement.style.setProperty(`--status-color-in progress`, color);
            }
        });
    }, [statusColors]);

    // Apply font color globally
    useEffect(() => {
        if (fontColor) {
            document.documentElement.style.setProperty("--user-font-color", fontColor);
            document.body.style.color = fontColor;
            // Apply to all text elements
            document.querySelectorAll('*').forEach(el => {
                if (el.style.color === '' || el.style.color === 'rgb(0, 0, 0)' || el.style.color === 'black') {
                    el.style.color = fontColor;
                }
            });
        } else {
            document.documentElement.style.removeProperty("--user-font-color");
            document.body.style.color = '';
        }
    }, [fontColor]);

    const equipItem = (item) => {
        if (item.category === "fonts") {
            setFont(item.font);
            const newEquipped = { ...equippedItems, font: item.id };
            setEquippedItems(newEquipped);
            localStorage.setItem("userFont", item.font);
            localStorage.setItem("equippedItems", JSON.stringify(newEquipped));
        } else if (item.category === "backgroundColors") {
            setBackgroundColor(item.color);
            const newEquipped = { ...equippedItems, backgroundColor: item.id };
            setEquippedItems(newEquipped);
            localStorage.setItem("userBackgroundColor", item.color);
            localStorage.setItem("equippedItems", JSON.stringify(newEquipped));
        } else if (item.category === "fontColors") {
            setFontColor(item.color);
            const newEquipped = { ...equippedItems, fontColor: item.id };
            setEquippedItems(newEquipped);
            localStorage.setItem("userFontColor", item.color);
            localStorage.setItem("equippedItems", JSON.stringify(newEquipped));
        } else if (item.category === "statusColors") {
            // For status colors, apply to the specific status
            const statusKey = item.status || "pending";
            const newStatusColors = { ...statusColors, [statusKey]: item.color };
            setStatusColors(newStatusColors);
            const newEquipped = {
                ...equippedItems,
                statusColors: { ...equippedItems.statusColors, [statusKey]: item.id }
            };
            setEquippedItems(newEquipped);
            localStorage.setItem("userStatusColors", JSON.stringify(newStatusColors));
            localStorage.setItem("equippedItems", JSON.stringify(newEquipped));
        }
    };

    const unequipItem = (category, status = null) => {
        if (category === "fonts") {
            setFont("Roboto");
            const newEquipped = { ...equippedItems, font: null };
            setEquippedItems(newEquipped);
            localStorage.removeItem("userFont");
            localStorage.setItem("equippedItems", JSON.stringify(newEquipped));
        } else if (category === "backgroundColors") {
            setBackgroundColor(null);
            const newEquipped = { ...equippedItems, backgroundColor: null };
            setEquippedItems(newEquipped);
            localStorage.removeItem("userBackgroundColor");
            localStorage.setItem("equippedItems", JSON.stringify(newEquipped));
        } else if (category === "fontColors") {
            setFontColor(null);
            const newEquipped = { ...equippedItems, fontColor: null };
            setEquippedItems(newEquipped);
            localStorage.removeItem("userFontColor");
            localStorage.setItem("equippedItems", JSON.stringify(newEquipped));
        } else if (category === "statusColors" && status) {
            const newStatusColors = { ...statusColors };
            delete newStatusColors[status];
            setStatusColors(newStatusColors);
            const newEquippedStatus = { ...equippedItems.statusColors };
            delete newEquippedStatus[status];
            const newEquipped = { ...equippedItems, statusColors: newEquippedStatus };
            setEquippedItems(newEquipped);
            localStorage.setItem("userStatusColors", JSON.stringify(newStatusColors));
            localStorage.setItem("equippedItems", JSON.stringify(newEquipped));
        }
    };

    const value = {
        font,
        backgroundColor,
        statusColors,
        equippedItems,
        equipItem,
        unequipItem,
    };

    return (
        <UserPreferencesContext.Provider value={value}>
            {children}
        </UserPreferencesContext.Provider>
    );
};

UserPreferencesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
