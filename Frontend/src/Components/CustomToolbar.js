import React, { useState } from "react";
import PropTypes from "prop-types";
import TaskList from "./TaskList";

export const CustomToolbar = ({
    label,
    onNavigate,
    onView,
    currentView,
    setCurrentView,
}) => {
    const [showTaskMenu, setShowTaskMenu] = useState(false);
    const [listMode, setListMode] = useState(null);

    return (
        <div
            className="rbc-toolbar"
            style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                position: "relative",
            }}
        >
            <div>
                <button 
                    onClick={() => setShowTaskMenu(prev => !prev)}
                    style={{
                        backgroundColor: "#b8860b",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    Tasks ▼
                </button>
            </div>

            <span className="rbc-toolbar-label" style={{ fontWeight: "bold" }}>
                {label}
            </span>

            <div style={{ display: "flex", alignItems: "center" }}>
                {["quarter", "month", "week", "day", "agenda"].map((view) => (
                    <button
                        key={view}
                        onClick={() => {
                            onView(view);
                            setCurrentView(view);
                        }}
                        style={{
                            marginLeft: "5px",
                            backgroundColor: currentView === view ? "#007bff" : "#f0f0f0",
                            color: currentView === view ? "white" : "black",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            padding: "5px 10px",
                        }}
                    >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                ))}

                {showTaskMenu && (
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: "110%",
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                            zIndex: 999,
                            width: "140px",
                        }}
                    >
                        <button
                            style={{ width: "100%", padding: "8px" }}
                            onClick={() => {
                                setListMode("active");
                                setShowTaskMenu(false);
                            }}
                        >
                            Active
                        </button>
                        <button
                            style={{ width: "100%", padding: "8px" }}
                            onClick={() => {
                                setListMode("done");
                                setShowTaskMenu(false);
                            }}
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>

            {listMode && (
                <TaskList
                    mode={listMode}
                    onClose={() => setListMode(null)}
                />
            )}
        </div>
    );
};

CustomToolbar.propTypes = {
    label: PropTypes.string.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
    currentView: PropTypes.string.isRequired,
    setCurrentView: PropTypes.func.isRequired,
};