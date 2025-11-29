import React from "react";
import "../styles/table.css";

export default function DataTable() {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Column A</th>
            <th>Column B</th>
            <th>Column C</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>---</td>
            <td>---</td>
            <td>---</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
