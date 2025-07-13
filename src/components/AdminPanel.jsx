import React, { useState, useContext } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import MiniDashboard from './MiniDashboard';
import { ThemeContext } from '../ThemeContext';

const AdminPanel = ({ onPaperGenerated }) => {
    const { theme, toggle } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [config, setConfig] = useState({
        fillBlanks: { marks: '', count: '' },
        objective: { marks: '', count: '' },
        trueFalse: { marks: '', count: '' },
        descriptive: { marks: '', count: '' },
    });

    const [numPapers, setNumPapers] = useState(1);
    const [excelData, setExcelData] = useState({});
    const [generatedPapers, setGeneratedPapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastStats, setLastStats] = useState(null);

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
        if (!Array.isArray(arr) || arr.length < count) return [];
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const getTotalMarks = () =>
        ['fillBlanks', 'objective', 'trueFalse', 'descriptive'].reduce(
            (sum, section) => sum + (config[section].marks || 0) * (config[section].count || 0),
            0
        );

    const generatePDFBlob = async (element) => {
        const opt = {
            margin: 10,
            filename: 'temp.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        return html2pdf().from(element).set(opt).outputPdf('blob');
    };

    const downloadAllAsZip = async () => {
        setLoading(true);
        const zip = new JSZip();
        let totalStats = { fillBlanks: 0, objective: 0, trueFalse: 0, descriptive: 0 };

        for (let i = 0; i < generatedPapers.length; i++) {
            const code = generatedPapers[i].code;
            const questionEl = document.getElementById(`question-${code}`);
            const answerEl = document.getElementById(`answer-${code}`);

            // 👉 Temporarily show answer element if hidden
            const originalDisplay = answerEl.style.display;
            answerEl.style.display = 'block';

            const questionBlob = await generatePDFBlob(questionEl);
            const answerBlob = await generatePDFBlob(answerEl);

            // 👉 Re-hide it after generating PDF
            answerEl.style.display = originalDisplay;

            zip.file(`${code}.pdf`, questionBlob);
            zip.file(`${code}-ANSWER.pdf`, answerBlob);

            totalStats.fillBlanks += generatedPapers[i].fillBlanks.length;
            totalStats.objective += generatedPapers[i].objective.length;
            totalStats.trueFalse += generatedPapers[i].trueFalse.length;
            totalStats.descriptive += generatedPapers[i].descriptive.length;
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(content);
        saveAs(content, 'PRAJNA_Question_Papers.zip');
        setLoading(false);

        setLastStats(totalStats);

        if (onPaperGenerated) {
            onPaperGenerated({
                zipData: zipUrl,
                numPapers: generatedPapers.length,
                config,
            });
        }
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

    return (
        <div className={isDark ? 'dark-theme' : 'light-theme'} style={{ padding: '20px', fontFamily: 'Segoe UI' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>🧠 PRAJNA Admin Panel</h2>
                <button onClick={toggle}>
                    {isDark ? '🌞 Light Mode' : '🌙 Dark Mode'}
                </button>
            </header>

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
                <>
                    <button onClick={downloadAllAsZip} style={{ marginLeft: '20px' }}>
                        📦 Download All as ZIP
                    </button>
                    {loading && <span style={{ marginLeft: '10px' }}>⏳ Preparing ZIP...</span>}
                </>
            )}

            {lastStats && (
                <div style={{ marginTop: '30px' }}>
                    <MiniDashboard stats={lastStats} />
                </div>
            )}

            {generatedPapers.map((paper, index) => {
                const allQuestions = [
                    ...paper.fillBlanks,
                    ...paper.objective,
                    ...paper.trueFalse,
                    ...paper.descriptive
                ];
                return (
                    <div key={index}>
                        <div id={`question-${paper.code}`} style={{ marginTop: '30px', padding: '15px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                            <h3>🆔 Paper Code: {paper.code}</h3>
                            <h4>📄 Question Paper</h4>
                            <ol>
                                <li><strong>Fill in the Blanks</strong>
                                    <ol>{paper.fillBlanks.map((q, i) => (
                                        <li key={i}>{q.Question || q.question}<div style={{ borderBottom: '1px solid #aaa', marginTop: '10px', height: '25px' }}></div></li>
                                    ))}</ol>
                                </li>
                                <li><strong>Objective Type Questions</strong>
                                    <ol>{paper.objective.map((q, i) => (
                                        <li key={i}>{q.Question || q.question}<div style={{ borderBottom: '1px dotted #aaa', marginTop: '10px', height: '15px', width: '50%' }}></div></li>
                                    ))}</ol>
                                </li>
                                <li><strong>True / False</strong>
                                    <ol>{paper.trueFalse.map((q, i) => (
                                        <li key={i}>{q.Question || q.question}<div style={{ borderBottom: '1px dashed #aaa', marginTop: '10px', height: '15px', width: '30%' }}></div></li>
                                    ))}</ol>
                                </li>
                                <li><strong>Descriptive Type Questions</strong>
                                    <ol>{paper.descriptive.map((q, i) => (
                                        <li key={i}>{q.Question || q.question}<div style={{ border: '1px solid #aaa', marginTop: '10px', height: '80px' }}></div></li>
                                    ))}</ol>
                                </li>
                            </ol>
                        </div>

                        <div id={`answer-${paper.code}`} style={{ display: 'none' }}>
                            <h3>🆔 Answer Sheet: {paper.code}</h3>
                            <h4>✅ Answer Key</h4>
                            <ol>
                                {allQuestions.map((q, i) => (
                                    <li key={i}><strong>Q{i + 1}:</strong> {q.Answer || q.answer || '⚠️ Missing Answer'}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AdminPanel;
