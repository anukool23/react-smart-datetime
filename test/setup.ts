import "@testing-library/react";

// jsdom doesn't implement scrollIntoView; stub it for the time columns.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
