// import React from "react";
// import "../styles/sidebar.css";

// export default function Sidebar() {
//   return (
//     <div className="sidebar">
//       <h3>Lables</h3>

//       <select className="droppers">
//         <option>___</option>
//         <option>سیب</option>
//         <option>گردو</option>
//         <option>نخل</option>
//         <option>مرکبات</option>
//       </select>

//       <select className="droppers">
//         <option>___</option>
//         <option>سیب</option>
//         <option>گردو</option>
//         <option>نخل</option>
//         <option>مرکبات</option>
//       </select>

//       <select className="droppers">
//         <option>___</option>
//         <option>سیب</option>
//         <option>گردو</option>
//         <option>نخل</option>
//         <option>مرکبات</option>
//       </select>

//       <select className="droppers">
//         <option>___</option>
//         <option>سیب</option>
//         <option>گردو</option>
//         <option>نخل</option>
//         <option>مرکبات</option>
//       </select>

//       <button className="apply-btn">Apply</button>

//       <h3>استان ها</h3>

//       <select className="droppers">
//         <option>___</option>
//         <option>فارس</option>
//         <option>کهکیلویه و بویراحمد</option>
//         <option>یزد</option>
//         <option>کرمان</option>
//       </select>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import "../styles/sidebar.css";

// export default function Sidebar() {
//   const [extraSelects, setExtraSelects] = useState([]);

//   const options = ["___", "سیب", "گردو", "نخل", "مرکبات"];

//   function addSelect() {
//     setExtraSelects([...extraSelects, { id: Date.now() }]);
//   }

//   function removeSelect(id) {
//     setExtraSelects(extraSelects.filter((item) => item.id !== id));
//   }

//   return (
//     <div className="sidebar">
//       <h3>Lables</h3>

//       {/* Your fixed original dropdowns */}
//       <select className="droppers">
//         {options.map((o) => (
//           <option key={o}>{o}</option>
//         ))}
//       </select>

//       <select className="droppers">
//         {options.map((o) => (
//           <option key={o}>{o}</option>
//         ))}
//       </select>

//       <select className="droppers">
//         {options.map((o) => (
//           <option key={o}>{o}</option>
//         ))}
//       </select>

//       <select className="droppers">
//         {options.map((o) => (
//           <option key={o}>{o}</option>
//         ))}
//       </select>

//       {/* Dynamically added dropdowns */}
//       {extraSelects.map((item) => (
//         <div key={item.id} className="dynamic-row">
//           <select>
//             {options.map((o) => (
//               <option key={o}>{o}</option>
//             ))}
//           </select>

//           <button className="trash-btn" onClick={() => removeSelect(item.id)}>
//             🗑️
//           </button>
//         </div>
//       ))}

//       {/* + button */}
//       <button className="add-btn" onClick={addSelect}>
//         +
//       </button>

//       <button className="apply-btn">Apply</button>

//       <h3>استان ها</h3>

//       <select className="droppers">
//         <option>___</option>
//         <option>فارس</option>
//         <option>کهکیلویه و بویراحمد</option>
//         <option>یزد</option>
//         <option>کرمان</option>
//       </select>
//     </div>
//   );
// }

import React, { useState } from "react";
import "../styles/sidebar.css";

export default function Sidebar() {
  const [provinceSelects, setProvinceSelects] = useState([]);

  const options = ["___", "سیب", "گردو", "نخل", "مرکبات"];
  const provinceOptions = [
    "___",
    "فارس",
    "کهکیلویه و بویراحمد",
    "یزد",
    "کرمان",
  ];

  function addProvinceSelect() {
    setProvinceSelects([...provinceSelects, { id: Date.now() }]);
  }

  function removeProvinceSelect(id) {
    setProvinceSelects(provinceSelects.filter((item) => item.id !== id));
  }

  return (
    <div className="sidebar">
      <h3>Lables</h3>

      {/* FIXED TOP DROPDOWNS */}
      <select className="droppers">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      <select className="droppers">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      <select className="droppers">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      <select className="droppers">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      {/* ------- ONLY THIS SECTION IS DYNAMIC ------- */}
      <h3>استان ها</h3>

      {/* STATIC FIRST DROPPER */}
      <select className="droppers">
        {provinceOptions.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>

      {provinceSelects.map((item) => (
        <div key={item.id} className="dynamic-row">
          <select className="droppers">
            {provinceOptions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <button
            className="trash-btn"
            onClick={() => removeProvinceSelect(item.id)}
          >
            🗑️
          </button>
        </div>
      ))}

      {/* + BUTTON ONLY FOR PROVINCE SECTION */}
      <button className="add-btn" onClick={addProvinceSelect}>
        +
      </button>

      <button className="apply-btn">Apply</button>
    </div>
  );
}
