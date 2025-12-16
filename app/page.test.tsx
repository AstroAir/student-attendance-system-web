import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home Page", () => {
  it("renders the dashboard heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { name: "仪表盘" });
    expect(heading).toBeInTheDocument();
  });

  it("renders navigation cards", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: /学生管理/ })).toHaveAttribute(
      "href",
      "/students"
    );
    expect(screen.getByRole("link", { name: /考勤记录/ })).toHaveAttribute(
      "href",
      "/attendances"
    );
    expect(screen.getByRole("link", { name: /统计报表/ })).toHaveAttribute(
      "href",
      "/reports"
    );
    expect(screen.getByRole("link", { name: /班级管理/ })).toHaveAttribute(
      "href",
      "/classes"
    );
    expect(screen.getByRole("link", { name: /数据导入导出/ })).toHaveAttribute(
      "href",
      "/data"
    );
  });
});
