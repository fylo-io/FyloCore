import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import BackButton from "./BackButton";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn()
}));

describe("BackButton", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  test("renders the Back button correctly", () => {
    render(<BackButton />);

    const button = screen.getByText("Back");
    expect(button).toBeInTheDocument();

    expect(button).toHaveClass(
      "fixed left-20 bottom-5 z-50 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 transition-colors"
    );
  });

  test("navigates to the /dashboard route when clicked", () => {
    render(<BackButton />);

    const button = screen.getByText("Back");
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
