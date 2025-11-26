import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddTask from "./AddTask";

describe("AddTask Component", () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders AddTask form with all fields", () => {
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        expect(screen.getByText("Create Task")).toBeInTheDocument();
        expect(screen.getByText("Title:")).toBeInTheDocument();
        expect(screen.getByText("Description:")).toBeInTheDocument();
        expect(screen.getByText(/Priority:/)).toBeInTheDocument();
        expect(screen.getByText("Category:")).toBeInTheDocument();
        expect(screen.getByText("Location (Optional):")).toBeInTheDocument();
        expect(screen.getByText("Reminder Date (Optional):")).toBeInTheDocument();
    });

    test("allows user to select category", () => {
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        // Get all selects and find category (first select)
        const selects = screen.getAllByRole("combobox");
        const categorySelect = selects[0];
        
        expect(categorySelect).toHaveValue("private");
        
        fireEvent.change(categorySelect, { target: { value: "work" } });
        expect(categorySelect).toHaveValue("work");
        
        fireEvent.change(categorySelect, { target: { value: "school" } });
        expect(categorySelect).toHaveValue("school");
    });

    test("allows user to enter location", () => {
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const locationInput = screen.getByPlaceholderText("Enter location");
        fireEvent.change(locationInput, { target: { value: "Office Building" } });
        expect(locationInput).toHaveValue("Office Building");
    });

    test("allows user to set reminder date", () => {
        const { container } = render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        // Get all datetime-local inputs - reminder is the third one (index 2)
        const dateTimeInputs = container.querySelectorAll('input[type="datetime-local"]');
        const reminderInput = dateTimeInputs[2];
        
        const reminderDate = "2024-12-31T10:00";
        fireEvent.change(reminderInput, { target: { value: reminderDate } });
        expect(reminderInput).toHaveValue(reminderDate);
    });

    test("shows reminder message when reminder date is set", () => {
        const { container } = render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const dateTimeInputs = container.querySelectorAll('input[type="datetime-local"]');
        const reminderInput = dateTimeInputs[2];
        
        fireEvent.change(reminderInput, { target: { value: "2024-12-31T10:00" } });
        
        expect(screen.getByText(/You will receive a reminder/i)).toBeInTheDocument();
    });

    test("submits form with category, location, and reminder_date", async () => {
        const { container } = render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        // Get inputs by type to avoid multiple matches
        const titleInput = container.querySelector('input[type="text"]');
        const selects = screen.getAllByRole("combobox");
        const categorySelect = selects[0];
        const locationInput = screen.getByPlaceholderText("Enter location");
        const dateTimeInputs = container.querySelectorAll('input[type="datetime-local"]');
        const endDateInput = dateTimeInputs[1]; // Second datetime-local is end date
        const reminderInput = dateTimeInputs[2]; // Third datetime-local is reminder
        const submitButton = screen.getByText("Add");
        
        fireEvent.change(titleInput, { target: { value: "Test Task" } });
        fireEvent.change(categorySelect, { target: { value: "work" } });
        fireEvent.change(locationInput, { target: { value: "Office" } });
        fireEvent.change(reminderInput, { target: { value: "2024-12-31T10:00" } });
        fireEvent.change(endDateInput, { target: { value: "2024-12-31T23:59" } });
        
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledTimes(1);
            const callArgs = mockOnSubmit.mock.calls[0];
            expect(callArgs[0]).toMatchObject({
                title: "Test Task",
                category: "work",
                location: "Office",
            });
            expect(callArgs[0].reminder_date).toBeTruthy();
        });
    });

    test("calls onClose when cancel button is clicked", () => {
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);
        
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("initializes with default values", () => {
        const defaultValues = {
            title: "Default Title",
            category: "school",
            location: "Library",
            reminder_date: "2024-12-31T10:00:00Z"
        };
        
        const { container } = render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} defaultValues={defaultValues} />);
        
        // Title
        expect(screen.getByDisplayValue("Default Title")).toBeInTheDocument();
        
        // Category - first select
        const selects = screen.getAllByRole("combobox");
        expect(selects[0]).toHaveValue("school");
        
        // Location
        expect(screen.getByDisplayValue("Library")).toBeInTheDocument();
        
        // Reminder Date - third datetime-local input
        // The component converts ISO string to local datetime format
        // We just check that it has a value, not the exact time (due to timezone conversion)
        const dateTimeInputs = container.querySelectorAll('input[type="datetime-local"]');
        expect(dateTimeInputs[2].value).toBeTruthy();
        expect(dateTimeInputs[2].value).toContain("2024-12-31");
    });
});