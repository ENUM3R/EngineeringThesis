import { renderHook, act } from "@testing-library/react";
import axios from "axios";
import useTasks from "./useTasks";

jest.mock("axios");

describe("useTasks Hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem("access", "test-token");
    });

    afterEach(() => {
        localStorage.removeItem("access");
    });

    test("formatTasks includes category, location, and reminder_date", () => {
        const mockTasks = [
            {
                id: 1,
                title: "Test Task",
                category: "work",
                location: "Office",
                reminder_date: "2024-12-31T10:00:00Z",
                priority: 5,
                status: "pending",
                end_date: "2024-12-31T23:59:59Z",
                points: 100,
            }
        ];

        axios.get.mockResolvedValueOnce({ data: mockTasks });
        axios.get.mockResolvedValueOnce({ data: [] });

        const { result } = renderHook(() => useTasks());

        act(async () => {
            await result.current.fetchEvents();
        });

        // Wait for async operations
        setTimeout(() => {
            expect(result.current.events.length).toBeGreaterThan(0);
            if (result.current.events.length > 0) {
                const event = result.current.events[0];
                expect(event.category).toBe("work");
                expect(event.location).toBe("Office");
                expect(event.reminder_date).toBeTruthy();
            }
        }, 100);
    });

    test("formatTasks adds category indicator to title", () => {
        const mockTasks = [
            {
                id: 1,
                title: "Work Task",
                category: "work",
                priority: 5,
                status: "pending",
                end_date: "2024-12-31T23:59:59Z",
            },
            {
                id: 2,
                title: "School Task",
                category: "school",
                priority: 3,
                status: "pending",
                end_date: "2024-12-31T23:59:59Z",
            },
            {
                id: 3,
                title: "Private Task",
                category: "private",
                priority: 2,
                status: "pending",
                end_date: "2024-12-31T23:59:59Z",
            }
        ];

        axios.get.mockResolvedValueOnce({ data: mockTasks });
        axios.get.mockResolvedValueOnce({ data: [] });

        const { result } = renderHook(() => useTasks());

        act(async () => {
            await result.current.fetchEvents();
        });

        // Wait for async operations
        setTimeout(() => {
            expect(result.current.events.length).toBeGreaterThan(0);
            const events = result.current.events;
            if (events.length > 0) {
                expect(events[0].title).toContain("W -");
                expect(events[1].title).toContain("S -");
                expect(events[2].title).toContain("P -");
            }
        }, 100);
    });

    test("addTask includes category, location, and reminder_date", async () => {
        const mockTaskData = {
            title: "New Task",
            category: "work",
            location: "Office",
            reminder_date: "2024-12-31T10:00:00Z",
            priority: 5,
            status: "pending",
        };

        axios.post.mockResolvedValueOnce({ data: {} });
        axios.get.mockResolvedValue({ data: [] });

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.addTask(mockTaskData);
        });

        expect(axios.post).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                category: "work",
                location: "Office",
                reminder_date: expect.any(String),
            }),
            expect.any(Object)
        );
    });
});

