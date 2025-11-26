import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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

        // Check if title input has correct value
        expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument();
        
        // Check if the "Private" option exists in the select
        expect(screen.getByText("Private")).toBeInTheDocument();
    });

    test("allows user to change category", () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        // Find all selects and get the first one (category)
        const selects = screen.getAllByRole("combobox");
        const categorySelect = selects[0];
        
        fireEvent.change(categorySelect, { target: { value: "work" } });

        expect(categorySelect).toHaveValue("work");
    });

    test("allows user to enter location", () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        const locationInput = screen.getByPlaceholderText("Enter location");
        fireEvent.change(locationInput, { target: { value: "Office" } });

        expect(locationInput).toHaveValue("Office");
    });

    test("allows user to set reminder date", () => {
        const { container } = render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        // Find datetime-local input specifically
        const reminderInput = container.querySelector('input[type="datetime-local"]');
        
        const reminderDate = "2024-12-15T10:00";
        fireEvent.change(reminderInput, { target: { value: reminderDate } });

        expect(reminderInput).toHaveValue(reminderDate);
    });

    test("shows reminder message when reminder date is set", () => {
        const { container } = render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        const reminderInput = container.querySelector('input[type="datetime-local"]');

        fireEvent.change(reminderInput, { target: { value: "2024-12-15T10:00" } });

        expect(
            screen.getByText(/You will receive a reminder/i)
        ).toBeInTheDocument();
    });

    test("submits form with updated category, location, and reminder_date", async () => {
        const { container } = render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        // Find category select
        const selects = screen.getAllByRole("combobox");
        const categorySelect = selects[0];
        fireEvent.change(categorySelect, { target: { value: "work" } });

        // Find location input
        const locationInput = screen.getByPlaceholderText("Enter location");
        fireEvent.change(locationInput, { target: { value: "Office" } });

        // Find reminder date input
        const reminderInput = container.querySelector('input[type="datetime-local"]');
        fireEvent.change(reminderInput, { target: { value: "2024-12-15T10:00" } });

        // Click Save button
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledTimes(1);

            const submitted = mockOnSubmit.mock.calls[0][0];

            expect(submitted).toMatchObject({
                task_id: 1,
                category: "work",
                location: "Office",
            });

            expect(submitted.reminder_date).toBeTruthy();
        });
    });

    test("displays existing task location", () => {
        const taskWithLocation = {
            ...mockTask,
            location: "Existing Location",
        };

        render(<EditTask task={taskWithLocation} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        expect(screen.getByDisplayValue("Existing Location")).toBeInTheDocument();
    });

    test("displays existing task reminder_date", () => {
        const taskWithReminder = {
            ...mockTask,
            reminder_date: "2024-12-15T10:00:00Z",
        };

        const { container } = render(<EditTask task={taskWithReminder} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        const reminderInput = container.querySelector('input[type="datetime-local"]');

        expect(reminderInput).toHaveValue("2024-12-15T10:00");
    });

    test("calls onClose when cancel button is clicked", () => {
        render(<EditTask task={mockTask} onSubmit={mockOnSubmit} onClose={mockOnClose} />);

        fireEvent.click(screen.getByText("Cancel"));

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});