import React, { useState } from 'react';
import Streamgraph from './Streamgraph';
import * as d3 from "d3";

function App() {
  const [data, setData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        const parsedData = d3.csvParse(csvData, (d) => ({
          Date: d.Date,
          "GPT-4": +d["GPT-4"],
          Gemini: +d.Gemini,
          "PaLM-2": +d["PaLM-2"],
          Claude: +d.Claude,
          "LLaMA-3.1": +d["LLaMA-3.1"],
        }));
        setData(parsedData);
      };
      reader.readAsText(file);
    }
  };
  
  

  return (
    <div>
      <h1>Upload a CSV File</h1>
      <input type="file" onChange={handleFileUpload} />
      {data && <Streamgraph data={data} />}
    </div>
  );
}

export default App;
