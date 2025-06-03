import { render, screen } from "@testing-library/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

describe("Tabs Component", () => {
  test("applies custom className to TabsList", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
      </Tabs>
    );

    const tabsList = screen.getByText("Tab 1").parentElement;
    expect(tabsList).toHaveClass("custom-tabs-list");
  });

  test("applies custom className to TabsTrigger", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" className="custom-tab-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
      </Tabs>
    );

    const tabTrigger = screen.getByText("Tab 1");
    expect(tabTrigger).toHaveClass("custom-tab-trigger");
  });

  test("applies custom className to TabsContent", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-tab-content">
          Content for Tab 1
        </TabsContent>
      </Tabs>
    );

    const tabContent = screen.getByText("Content for Tab 1");
    expect(tabContent).toHaveClass("custom-tab-content");
  });
});
