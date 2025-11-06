import React from "react";
import { Calendar as MiniCal, Views } from "react-big-calendar";
import PropTypes from "prop-types";

function QuarterViewComponent({ date, events, localizer, onSelectSlot, onSelectEvent }) {
    const months = [0, 1, 2].map(i =>
        new Date(date.getFullYear(), date.getMonth() + i, 1)
    );

    return (
        <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", height: "100%" }}>
            {months.map((monthDate, index) => {
                const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
                const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

                const filteredEvents = events.filter(
                    (e) => new Date(e.start) >= start && new Date(e.start) <= end
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
                            {monthDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                        </h3>

                        <MiniCal
                            localizer={localizer}
                            selectable
                            events={filteredEvents}
                            startAccessor="start"
                            endAccessor="end"
                            onSelectEvent={onSelectEvent}
                            onSelectSlot={onSelectSlot}
                            toolbar={false}
                            style={{ height: 350 }}
                            eventPropGetter={(event) => {
                                let backgroundColor = "#777";
                                switch (event.status) {
                                case "pending": backgroundColor = "#fda80bb6"; break;
                                case "in progress": backgroundColor = "#b007ffff"; break;
                                case "completed": backgroundColor = "#14fff3ff"; break;
                                case "overdue": backgroundColor = "#f70073"; break;
                                case "done": backgroundColor = "#00ff22"; break;
                                }
                                return { style: { backgroundColor, color: "#fff" } };
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export const QuarterView = Object.assign(QuarterViewComponent, {
    range(date) {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 3, 0);

        const days = [];
        let cur = new Date(start);
        while (cur <= end) {
            days.push(cur);
            cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
        }
        return days;
    },

    navigate(date, action) {
        const newDate = new Date(date);
        if (action === "NEXT") newDate.setMonth(newDate.getMonth() + 3);
        else if (action === "PREV") newDate.setMonth(newDate.getMonth() - 3);
        return newDate;
    },

    title(date) {
        const start = date.toLocaleString("en-US", { month: "long" });
        const end = new Date(date.getFullYear(), date.getMonth() + 2)
            .toLocaleString("en-US", { month: "long", year: "numeric" });

        return `${start} - ${end}`;
    },

    dateType: Views.MONTH,
});

QuarterViewComponent.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    events: PropTypes.arrayOf(
        PropTypes.shape({
            start: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.instanceOf(Date)
            ]).isRequired,
            end: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.instanceOf(Date)
            ]).isRequired,
            status: PropTypes.string,
        })
    ).isRequired,
    localizer: PropTypes.object.isRequired,
    onSelectSlot: PropTypes.func,
    onSelectEvent: PropTypes.func,
};
