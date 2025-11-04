import React from "react";
import { Calendar as MiniCal  } from "react-big-calendar";
import PropTypes from "prop-types";

export const QuarterView = ({ date, events, localizer }) => {
    const months = [0, 1, 2].map(i =>
        new Date(date.getFullYear(), date.getMonth() + i, 1)
    );
    const DayWrapper = ({ children }) => (
        <div style={{ position: "relative" }}>{children}</div>
    );

    DayWrapper.propTypes = {
        children: PropTypes.node
    };

    return (
        <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
            {months.map((monthDate, index) => {
                const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
                const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

                const filteredEvents = events.filter(
                    e =>
                        new Date(e.start) >= start &&
                        new Date(e.start) <= end
                );

                return (
                    <div
                        key={index}
                        style={{
                            flex: 1,
                            border: "1px solid #333",
                            borderRadius: "8px",
                            padding: "5px",
                            backgroundColor: "#1e1e1e",
                            color: "#fff",
                        }}
                    >
                        <h3 style={{ textAlign: "center" }}>
                            {monthDate.toLocaleString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </h3>

                        <MiniCal
                            localizer={localizer}
                            views={["month"]}
                            events={filteredEvents}
                            viewAccessor="quarter"
                            getNow={() => new Date()}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 350 }}
                            toolbar={false}
                            selectable={false}
                            popup={false}
                            onSelectSlot={() => {}}
                            onSelectEvent={() => {}}
                            components={{ dateCellWrapper: DayWrapper }}
                        />

                    </div>
                );
            })}
        </div>
    );
};
QuarterView.title = (date,  {localizer}) => `Quarter: ${localizer.format(date, "MMMM yyyy")}`;
QuarterView.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    events: PropTypes.array.isRequired,
    localizer: PropTypes.object.isRequired,
};
