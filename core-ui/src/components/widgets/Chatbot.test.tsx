import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Chatbot from "./Chatbot";

const sendMessages = jest.fn();

describe("Chatbot", () => {
  beforeEach(() => {
    sendMessages.mockClear();
  });

  test("renders the Chatbot component correctly", () => {
    render(<Chatbot sendMessages={sendMessages} />);

    const inputField = screen.getByPlaceholderText("Enter a prompt here");
    expect(inputField).toBeInTheDocument();

    const attachButton = screen.getByRole("button", { name: /Attach file/i });
    expect(attachButton).toBeInTheDocument();

    const sendButton = screen.getByRole("button", { name: /Send prompt/i });
    expect(sendButton).toBeInTheDocument();
  });

  test("adds pasted items when user pastes content", async () => {
    render(<Chatbot sendMessages={sendMessages} />);

    const inputField = screen.getByPlaceholderText("Enter a prompt here");
    const pastedContent = "This is a long text content that exceeds fifty characters for testing";
    fireEvent.paste(inputField, {
      clipboardData: { getData: () => pastedContent }
    });

    await waitFor(() => {
      expect(screen.getByText(pastedContent)).toBeInTheDocument();
    });

    expect(inputField).toHaveValue("");
  });

  test("removes pasted item when remove button is clicked", async () => {
    render(<Chatbot sendMessages={sendMessages} />);

    const pastedContent = "This is a long text content that exceeds fifty characters for testing";
    const inputField = screen.getByPlaceholderText("Enter a prompt here");
    fireEvent.paste(inputField, {
      clipboardData: { getData: () => pastedContent }
    });

    await waitFor(() => {
      expect(screen.getByText(pastedContent)).toBeInTheDocument();
    });

    const removeButton = screen.getByRole("button", {
      name: /Remove pasted text/i
    });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText(pastedContent)).not.toBeInTheDocument();
    });
  });

  test("toggles expanded state when input is clicked", () => {
    render(<Chatbot sendMessages={sendMessages} />);

    const inputField = screen.getByPlaceholderText("Enter a prompt here");
    expect(inputField).toHaveClass("opacity-0");

    const expandButton = screen.getByRole("button", {
      name: /Expand prompt bar/i
    });
    fireEvent.click(expandButton);

    expect(inputField).toHaveClass("opacity-100");
  });
});
