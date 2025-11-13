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
        expect(screen.getByLabelText(/Title:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Priority:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Category:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Reminder Date/i)).toBeInTheDocument();
    });

    test("allows user to select category", () => {
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const categorySelect = screen.getByLabelText(/Category:/i);
        expect(categorySelect).toHaveValue("private");
        
        fireEvent.change(categorySelect, { target: { value: "work" } });
        expect(categorySelect).toHaveValue("work");
        
        fireEvent.change(categorySelect, { target: { value: "school" } });
        expect(categorySelect).toHaveValue("school");
    });

    test("allows user to enter location", () => {
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const locationInput = screen.getByLabelText(/Location/i);
        fireEvent.change(locationInput, { target: { value: "Office Building" } });
        expect(locationInput).toHaveValue("Office Building");
    });

    test("allows user to set reminder date", () => {
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const reminderInput = screen.getByLabelText(/Reminder Date/i);
        const reminderDate = "2024-12-31T10:00";
        fireEvent.change(reminderInput, { target: { value: reminderDate } });
        expect(reminderInput).toHaveValue(reminderDate);
    });

    test("shows reminder message when reminder date is set", () => {
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const reminderInput = screen.getByLabelText(/Reminder Date/i);
        fireEvent.change(reminderInput, { target: { value: "2024-12-31T10:00" } });
        
        expect(screen.getByText(/You will receive a reminder/i)).toBeInTheDocument();
    });

    test("submits form with category, location, and reminder_date", async () => {
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} />);
        
        const titleInput = screen.getByLabelText(/Title:/i);
        const categorySelect = screen.getByLabelText(/Category:/i);
        const locationInput = screen.getByLabelText(/Location/i);
        const reminderInput = screen.getByLabelText(/Reminder Date/i);
        const endDateInput = screen.getByLabelText(/End Date:/i);
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
            reminder_date: "2024-12-31T10:00"
        };
        
        render(<AddTask onSubmit={mockOnSubmit} onClose={mockOnClose} defaultValues={defaultValues} />);
        
        expect(screen.getByLabelText(/Title:/i)).toHaveValue("Default Title");
        expect(screen.getByLabelText(/Category:/i)).toHaveValue("school");
        expect(screen.getByLabelText(/Location/i)).toHaveValue("Library");
        expect(screen.getByLabelText(/Reminder Date/i)).toHaveValue("2024-12-31T10:00");
    });
});

