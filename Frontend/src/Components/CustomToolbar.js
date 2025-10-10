import React from "react";
import PropTypes from "prop-types";

export const CustomToolbar = ({
    label,
    onNavigate,
    onView,
    currentView,
    setCurrentView,
}) => (
    <div
        className="rbc-toolbar"
        style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
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
        <div>
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
        </div>
    </div>
);

CustomToolbar.propTypes = {
    label: PropTypes.string.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
    currentView: PropTypes.string.isRequired,
    setCurrentView: PropTypes.func.isRequired,
};
