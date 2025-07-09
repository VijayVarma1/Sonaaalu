import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const AdminPanel = () => {
    const [config, setConfig] = useState({
        fillBlanks: { marks: '', count: '' },
        objective: { marks: '', count: '' },
        trueFalse: { marks: '', count: '' },
        descriptive: { marks: '', count: '' },
    });
    const [numPapers, setNumPapers] = useState(1);
    const [excelData, setExcelData] = useState({});
    const [generatedPapers, setGeneratedPapers] = useState([]);

    const handleConfigChange = (e, section, field) => {
        const value = parseInt(e.target.value) || '';
        setConfig((prev) => ({
            ...prev,
            [section]: { ...prev[section], [field]: value },
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheets = workbook.SheetNames.reduce((acc, name) => {
                acc[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
                return acc;
            }, {});
            setExcelData(sheets);
        };
        reader.readAsBinaryString(file);
    };

    const getRandomItems = (arr, count) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const handleGeneratePaper = () => {
        const papers = [];
        for (let i = 0; i < numPapers; i++) {
            const code = `RIL-${uuidv4().slice(0, 6).toUpperCase()}`;
            const fillBlanks = getRandomItems(excelData['Sheet1'] || [], config.fillBlanks.count);
            const objective = getRandomItems(excelData['Sheet2'] || [], config.objective.count);
            const trueFalse = getRandomItems(excelData['Sheet3'] || [], config.trueFalse.count);
            const descriptive = getRandomItems(excelData['Sheet4'] || [], config.descriptive.count);
            papers.push({ code, fillBlanks, objective, trueFalse, descriptive });
        }
        setGeneratedPapers(papers);
    };

    const getTotalMarks = () =>
        ['fillBlanks', 'objective', 'trueFalse', 'descriptive'].reduce(
            (sum, section) => sum + (config[section].marks || 0) * (config[section].count || 0),
            0
        );

    const generatePDFBlob = async (element) => {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        return pdf.output('blob');
    };

    const downloadAllAsZip = async () => {
        const zip = new JSZip();
        for (let i = 0; i < generatedPapers.length; i++) {
            const el = document.getElementById(`paper-${i}`);
            const blob = await generatePDFBlob(el);
            zip.file(`${generatedPapers[i].code}.pdf`, blob);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'SONAAALU_Question_Papers.zip');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Segoe UI' }}>
            <h2>SONAAALU – Admin Control Panel</h2>

            <p><strong>Step 1: Configure Questions and Marks</strong></p>
            <table border="1" cellPadding="10">
                <thead>
                <tr>
                    <th>Section</th>
                    <th>Marks per Question</th>
                    <th>Number of Questions</th>
                </tr>
                </thead>
                <tbody>
                {['fillBlanks', 'objective', 'trueFalse', 'descriptive'].map((section) => (
                    <tr key={section}>
                        <td style={{ textTransform: 'capitalize' }}>{section.replace(/([A-Z])/g, ' $1')}</td>
                        <td>
                            <input
                                type="number"
                                value={config[section].marks}
                                onChange={(e) => handleConfigChange(e, section, 'marks')}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                value={config[section].count}
                                onChange={(e) => handleConfigChange(e, section, 'count')}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <p><strong>Total Marks: {getTotalMarks()} / 50</strong></p>

            <p style={{ marginTop: '20px' }}><strong>Number of Papers to Generate</strong></p>
            <input
                type="number"
                min="1"
                value={numPapers}
                onChange={(e) => setNumPapers(parseInt(e.target.value) || 1)}
            />

            <p style={{ marginTop: '20px' }}><strong>Step 2: Upload Excel File (with 4 sheets)</strong></p>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />

            <p style={{ marginTop: '20px' }}><strong>Step 3: Generate Question Paper</strong></p>
            <button onClick={handleGeneratePaper}>🎲 Generate Random Paper(s)</button>

            {generatedPapers.length > 0 && (
                <button onClick={downloadAllAsZip} style={{ marginLeft: '20px' }}>📦 Download All as ZIP</button>
            )}

            {generatedPapers.map((paper, index) => (
                <div key={index} id={`paper-${index}`} style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                    <h3>🆔 Paper Code: {paper.code}</h3>
                    <h4>📄 Question Paper</h4>
                    <ol>
                        <li><strong>Fill in the Blanks</strong>
                            <ol>{paper.fillBlanks.map((q, i) => (
                                <li key={i}>{q.Question || q.question}
                                    <div style={{ borderBottom: '1px solid #aaa', marginTop: '10px', height: '25px' }}></div>
                                </li>
                            ))}</ol>
                        </li>
                        <li><strong>Objective Type Questions</strong>
                            <ol>{paper.objective.map((q, i) => (
                                <li key={i}>{q.Question || q.question}
                                    <div style={{ borderBottom: '1px dotted #aaa', marginTop: '10px', height: '15px', width: '50%' }}></div>
                                </li>
                            ))}</ol>
                        </li>
                        <li><strong>True / False</strong>
                            <ol>{paper.trueFalse.map((q, i) => (
                                <li key={i}>{q.Question || q.question}
                                    <div style={{ borderBottom: '1px dashed #aaa', marginTop: '10px', height: '15px', width: '30%' }}></div>
                                </li>
                            ))}</ol>
                        </li>
                        <li><strong>Descriptive Type Questions</strong>
                            <ol>{paper.descriptive.map((q, i) => (
                                <li key={i}>{q.Question || q.question}
                                    <div style={{ border: '1px solid #aaa', marginTop: '10px', height: '80px' }}></div>
                                </li>
                            ))}</ol>
                        </li>
                    </ol>

                    <h4>✅ Answer Key</h4>
                    <ul>
                        {[...paper.fillBlanks, ...paper.objective, ...paper.trueFalse, ...paper.descriptive].map((q, i) => (
                            <li key={i}><strong>Q{i + 1}:</strong> {q.Answer || q.answer || '⚠️ Missing Answer'}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default AdminPanel;
