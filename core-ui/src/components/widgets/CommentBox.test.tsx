import CommentBox from "@/components/widgets/CommentBox";
import { render, screen } from "@testing-library/react";

jest.mock("moment", () => {
  const originalMoment = jest.requireActual("moment");
  return {
    ...originalMoment,
    fromNow: jest.fn(() => "a few seconds ago")
  };
});

describe("CommentBox", () => {
  const mockNodeData = {
    comments: [
      {
        author: "Jane Doe",
        color: "#ff5733",
        text: "This is a comment.",
        created_at: "2024-12-03T12:00:00Z"
      }
    ]
  };

  it("does not show comment details when input is true", () => {
    render(<CommentBox nodeData={mockNodeData} input={true} />);

    expect(screen.queryByTestId("comment-details")).not.toBeInTheDocument();
  });
});
