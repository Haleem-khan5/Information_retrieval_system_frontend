import React from "react";

/**
 * Recursively renders data in a dynamic table or nested tables.
 * @param {any} data - The data to render (object, array, or primitive)
 * @returns {JSX.Element} Table or text representation of the data
 */
export function renderDynamicTable(data) {
  // null/undefined check
  if (data === null || data === undefined) return <span>N/A</span>;

  // If data is a primitive (string, number, boolean, etc.)
  if (typeof data !== "object") {
    return <span>{String(data)}</span>;
  }

  // If data is an Array
  if (Array.isArray(data)) {
    // Check if array of objects or array of primitives
    const allObjects = data.every((item) => typeof item === "object" && !Array.isArray(item));
    const allPrimitives = data.every((item) => typeof item !== "object");

    // If array of primitives
    if (allPrimitives) {
      return (
        <table className="result-table fade-in">
          <tbody>
            {data.map((value, idx) => (
              <tr key={idx}>
                <td>{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // If array of objects (e.g., Related Components)
    if (allObjects && data.length > 0) {
      // Gather all unique keys from all objects
      const allKeys = new Set();
      data.forEach((obj) => {
        Object.keys(obj).forEach((k) => allKeys.add(k));
      });
      const headerKeys = Array.from(allKeys);

      return (
        <table className="result-table fade-in">
          <thead>
            <tr>
              {headerKeys.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((obj, rowIdx) => (
              <tr key={rowIdx}>
                {headerKeys.map((k) => (
                  <td key={k}>
                    {typeof obj[k] === "object" ? renderDynamicTable(obj[k]) : String(obj[k] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // Mixed array or array of arrays/objects: map each entry in a row
    return (
      <table className="result-table fade-in">
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{renderDynamicTable(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Otherwise, data is a plain Object
  // We make a 2-col table: Key | Value (recursively)
  const entries = Object.entries(data);
  return (
    <table className="result-table fade-in">
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td style={{ fontWeight: "bold", width: "150px" }}>{key}</td>
            <td>{renderDynamicTable(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
