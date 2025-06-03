import { fireEvent, render, screen } from "@testing-library/react";
import GraphModeToggle from "./GraphModeToggle";

describe("GraphModeToggle", () => {
  const setMode = jest.fn();
  const onModeChange = jest.fn();
  const options = ["OPTION_1", "OPTION_2", "OPTION_3"];

  it("should render the correct buttons", () => {
    render(
      <GraphModeToggle
        mode="DEFAULT"
        setMode={setMode}
        onModeChange={onModeChange}
        options={options}
      />
    );

    expect(screen.getByText("DEFAULT")).toBeInTheDocument();

    options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it("should call setMode and onModeChange with correct mode when a button is clicked", () => {
    render(
      <GraphModeToggle
        mode="DEFAULT"
        setMode={setMode}
        onModeChange={onModeChange}
        options={options}
      />
    );

    fireEvent.click(screen.getByText("OPTION_1"));

    expect(setMode).toHaveBeenCalledWith("OPTION_1");
    expect(onModeChange).toHaveBeenCalledWith("OPTION_1");
  });

  it("should apply the correct styles for the active mode", () => {
    render(
      <GraphModeToggle
        mode="OPTION_2"
        setMode={setMode}
        onModeChange={onModeChange}
        options={options}
      />
    );

    const activeButton = screen.getByText("OPTION_2");
    expect(activeButton).toHaveClass("bg-black text-white");

    options.forEach(option => {
      if (option !== "OPTION_2") {
        const button = screen.getByText(option);
        expect(button).toHaveClass("bg-gray-300 text-black");
      }
    });
  });

  it("should call setMode and onModeChange with 'DEFAULT' when the 'DEFAULT' button is clicked", () => {
    render(
      <GraphModeToggle
        mode="OPTION_1"
        setMode={setMode}
        onModeChange={onModeChange}
        options={options}
      />
    );

    fireEvent.click(screen.getByText("DEFAULT"));

    expect(setMode).toHaveBeenCalledWith("DEFAULT");
    expect(onModeChange).toHaveBeenCalledWith("DEFAULT");
  });
});
