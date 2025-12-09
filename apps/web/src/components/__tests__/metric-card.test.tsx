import { render, screen } from "@testing-library/react";
import { MetricCard } from "@/components/metric-card";
import MiniSparkline from "@/components/mini-sparkline";

function renderMetricCard() {
  return render(
    <MetricCard label="Points" value="12,450 pts" delta="Up" tone="positive">
      <MiniSparkline data={[1, 2, 3]} />
    </MetricCard>,
  );
}

describe("MetricCard", () => {
  it("renders label, value, delta, and children", () => {
    renderMetricCard();

    expect(screen.getByText("Points")).toBeInTheDocument();
    expect(screen.getByText("12,450 pts")).toBeInTheDocument();
    expect(screen.getByText("Up")).toHaveClass("text-emerald-600");
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });
});
