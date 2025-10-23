import React from "react";
import PropTypes from "prop-types";

export default function TaskOptions({position, onAdd, onDelete, onEdit}){
    if(!position) return null;

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                position: "absolute",
                top: position.y,
                left: position.x,
                backgroundColor: "#2b2b2b",
                color: "white",
                borderRadius: "8px",
                padding: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                zIndex: 1000,
                width: "150px",
            }}
        >
            <div
                style = {{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                }}
            ><button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd();
                    }}
                    style={buttonStyle}
                >➕  Add new task</button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    style={buttonStyle}
                >❌ Delete task</button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    style={buttonStyle}
                >✏️ Edit task</button>
            </div>
        </div>
    );
}

const buttonStyle = {
    backgroundColor: "#444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "5px",
    cursor: "pointer",
    textAlign: "left",
};

TaskOptions.propTypes = {
    position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }),
    onAdd: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};