import React from 'react';
import { Calendar, Views } from 'react-big-calendar';

export const QuarterView = ({ date, localizer, events, components, ...rest }) => {
    const theme = rest.quarterViewTheme || 'dark';
    const months = [0, 1, 2].map(i => new Date(date.getFullYear(), date.getMonth() + i, 1));

    return (
      <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
        {months.map((monthDate, index) => {
          const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

          const filteredEvents = events.filter(
            e => e.start >= start && e.start <= end
          );

          return (
            <div key={index} style={{
              flex: 1,
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "5px",
              backgroundColor: theme === 'dark' ? "#1e1e1e" : "#fff",
              color: theme === 'dark' ? "#fff" : "#000"
            }}>
              <h3 style={{ textAlign: "center" }}>
                {monthDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <Calendar
                {...rest}
                localizer={localizer}
                events={filteredEvents}
                date={monthDate}
                view={Views.MONTH}
                toolbar={false}
                style={{ height: 500 }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  QuarterView.range = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 3, 0);
    return [start, end];
  };
  QuarterView.navigate = (date, action) => {
    switch (action) {
      case "PREV":
        return new Date(date.getFullYear(), date.getMonth() - 3, 1);
      case "NEXT":
        return new Date(date.getFullYear(), date.getMonth() + 3, 1);
      default:
        return date;
    }
  };
  QuarterView.title = (date) => {
    const startMonth = date.toLocaleString("en-US", { month: "long", year: "numeric" });
    const endMonth = new Date(date.getFullYear(), date.getMonth() + 2)
      .toLocaleString("en-US", { month: "long", year: "numeric" });
    return `${startMonth} - ${endMonth}`;
  };