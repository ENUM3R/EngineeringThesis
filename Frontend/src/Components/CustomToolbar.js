import React, { useState } from "react";
import PropTypes from "prop-types";

export const CustomToolbar = ({
    label,
    onNavigate,
    onView,
    currentView,
    setCurrentView,
    onOpenTaskList,
}) => {
    const [showTaskMenu, setShowTaskMenu] = useState(false);

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
                <button onClick={() => onNavigate("TODAY")}>Today</button>
                <button onClick={() => onNavigate("PREV")}>Back</button>
                <button onClick={() => onNavigate("NEXT")}>Next</button>
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
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowTaskMenu(!showTaskMenu)}
                        style={{
                            marginLeft: "10px",
                            padding: "5px 12px",
                            backgroundColor: "#4a4a4a",
                            color: "white",
                            borderRadius: "4px",
                            border: "1px solid #333",
                        }}
                    >
                        Tasks
                    </button>
                    {showTaskMenu && (
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
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
                                style={{ width: "100%", padding: "8px", borderBottom: "1px solid #ccc" }}
                                onClick={() => {
                                    onOpenTaskList("active");
                                    setShowTaskMenu(false);
                                }}
                            >
                                Default
                            </button>

                            <button
                                style={{ width: "100%", padding: "8px" }}
                                onClick={() => {
                                    onOpenTaskList("done");
                                    setShowTaskMenu(false);
                                }}
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

CustomToolbar.propTypes = {
    label: PropTypes.string.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
    currentView: PropTypes.string.isRequired,
    setCurrentView: PropTypes.func.isRequired,
    onOpenTaskList: PropTypes.func,
};
