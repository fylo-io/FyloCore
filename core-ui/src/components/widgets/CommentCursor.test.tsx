import { render, screen } from "@testing-library/react";
import CommentCursor from "./CommentCursor";

describe("CommentCursor", () => {
  it('does not render any icon when type starts with "hover"', () => {
    render(<CommentCursor />);
    expect(screen.queryByTestId("active-note-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("active-comment-icon")).not.toBeInTheDocument();
  });

  it("does not render any icon when type is an unknown value", () => {
    render(<CommentCursor />);
    expect(screen.queryByTestId("active-note-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("active-comment-icon")).not.toBeInTheDocument();
  });
});
