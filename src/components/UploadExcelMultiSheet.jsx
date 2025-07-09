// src/components/UploadExcelMultiSheet.jsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function UploadExcelMultiSheet() {
    const [parsedData, setParsedData] = useState([]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (evt) => {
            const binaryStr = evt.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });

            const papers = [];

            workbook.SheetNames.forEach((sheetName) => {
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const sections = [];
                let currentSection = null;

                rows.forEach((row, idx) => {
                    const colA = row[0]?.toString().trim();
                    const colB = row[1]?.toString().trim();
                    const colC = row[2]?.toString().trim();

                    if (colA?.startsWith("Q-")) {
                        // New section header
                        if (currentSection) sections.push(currentSection);
                        currentSection = {
                            sectionTitle: colB || colA,
                            questions: []
                        };
                    } else if (!isNaN(parseInt(colA)) && colB) {
                        // Question row
                        currentSection?.questions.push({
                            number: colA,
                            question: colB,
                            answer: colC || "",
                        });
                    }
                });

                if (currentSection) sections.push(currentSection);
                papers.push({ sheetName, sections });
            });

            setParsedData(papers);
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Upload Excel File with 6 Papers</h2>
            <input type="file" accept=".xlsx" onChange={handleFileUpload} />
            <br /><br />

            {parsedData.map((paper, idx) => (
                <div key={idx} style={{ marginBottom: 40 }}>
                    <h3>📘 {paper.sheetName}</h3>
                    {paper.sections.map((sec, sidx) => (
                        <div key={sidx}>
                            <h4 style={{ color: "#005" }}>{sec.sectionTitle}</h4>
                            <ol>
                                {sec.questions.map((q, qidx) => (
                                    <li key={qidx}>
                                        {q.question} {q.answer && <strong>(Answer: {q.answer})</strong>}
                                        </li>
                                        ))}
                                    </ol>
                                    </div>
                                    ))}
                        </div>
                    ))}
                </div>
            );
            }

export default UploadExcelMultiSheet;
