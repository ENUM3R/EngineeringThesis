import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditTask from "./EditTask";

describe("EditTask Component", () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();
    const mockTask = {
        task_id: 1,
        title: "Test Task",
        description: "Test Description",
        priority: 5,
        status: "pending",
        category: "private",
        location: "",
        reminder_date: null,
        points: 100,
        start: "2024-12-01T00:00:00Z",
        end: "2024-12-31T23:59:59Z",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders EditTask form with task data", () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        expect(screen.getByText("Edit Task")).toBeInTheDocument();
        expect(screen.getByLabelText(/Title:/i)).toHaveValue("Test Task");
        expect(screen.getByLabelText(/Category:/i)).toHaveValue("private");
    });

    test("allows user to change category", () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const categorySelect = screen.getByLabelText(/Category:/i);
        fireEvent.change(categorySelect, { target: { value: "work" } });
        expect(categorySelect).toHaveValue("work");
    });

    test("allows user to enter location", () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const locationInput = screen.getByLabelText(/Location/i);
        fireEvent.change(locationInput, { target: { value: "Office" } });
        expect(locationInput).toHaveValue("Office");
    });

    test("allows user to set reminder date", () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const reminderInput = screen.getByLabelText(/Reminder Date/i);
        const reminderDate = "2024-12-15T10:00";
        fireEvent.change(reminderInput, { target: { value: reminderDate } });
        expect(reminderInput).toHaveValue(reminderDate);
    });

    test("shows reminder message when reminder date is set", () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const reminderInput = screen.getByLabelText(/Reminder Date/i);
        fireEvent.change(reminderInput, { target: { value: "2024-12-15T10:00" } });
        
        expect(screen.getByText(/You will receive a reminder/i)).toBeInTheDocument();
    });

    test("submits form with updated category, location, and reminder_date", async () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const categorySelect = screen.getByLabelText(/Category:/i);
        const locationInput = screen.getByLabelText(/Location/i);
        const reminderInput = screen.getByLabelText(/Reminder Date/i);
        const submitButton = screen.getByText("Save");
        
        fireEvent.change(categorySelect, { target: { value: "work" } });
        fireEvent.change(locationInput, { target: { value: "Office" } });
        fireEvent.change(reminderInput, { target: { value: "2024-12-15T10:00" } });
        
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledTimes(1);
            const callArgs = mockOnSubmit.mock.calls[0];
            expect(callArgs[0]).toMatchObject({
                task_id: 1,
                category: "work",
                location: "Office",
            });
            expect(callArgs[0].reminder_date).toBeTruthy();
        });
    });

    test("displays existing task location", () => {
        const taskWithLocation = {
            ...mockTask,
            location: "Existing Location"
        };
        
        render(<EditTask task={taskWithLocation} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        expect(screen.getByLabelText(/Location/i)).toHaveValue("Existing Location");
    });

    test("displays existing task reminder_date", () => {
        const taskWithReminder = {
            ...mockTask,
            reminder_date: "2024-12-15T10:00:00Z"
        };
        
        render(<EditTask task={taskWithReminder} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const reminderInput = screen.getByLabelText(/Reminder Date/i);
        expect(reminderInput).toHaveValue("2024-12-15T10:00");
    });

    test("calls onClose when cancel button is clicked", () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});

