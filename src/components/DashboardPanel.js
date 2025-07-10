import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DashboardPanel = ({ onClose }) => {
    const [records, setRecords] = useState([]);
    const [filter, setFilter] = useState('All');
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const raw = JSON.parse(localStorage.getItem('paperRecords') || '[]');
        setRecords(raw);
    }, []);

    const getFilteredRecords = () => {
        if (filter === 'All') return records;
        const now = new Date();
        return records.filter((r) => {
            const recDate = new Date(r.timestamp);
            if (filter === 'Month') return recDate.getMonth() === now.getMonth() && recDate.getFullYear() === now.getFullYear();
            if (filter === 'Quarter') return Math.floor(recDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) && recDate.getFullYear() === now.getFullYear();
            if (filter === 'Year') return recDate.getFullYear() === now.getFullYear();
            return true;
        });
    };

    const filtered = getFilteredRecords();

    const aggregateData = () => {
        const data = {
            fillBlanks: [],
            objective: [],
            trueFalse: [],
            descriptive: [],
            total: []
        };

        filtered.forEach((rec) => {
            const label = rec.timestamp.split(',')[0];
            data.fillBlanks.push({ date: label, count: rec.stats.fillBlanks });
            data.objective.push({ date: label, count: rec.stats.objective });
            data.trueFalse.push({ date: label, count: rec.stats.trueFalse });
            data.descriptive.push({ date: label, count: rec.stats.descriptive });
            data.total.push({
                date: label,
                fillBlanks: rec.stats.fillBlanks,
                objective: rec.stats.objective,
                trueFalse: rec.stats.trueFalse,
                descriptive: rec.stats.descriptive
            });
        });

        return data;
    };

    const data = aggregateData();

    const exportToPDF = () => {
        const input = document.getElementById('dashboard-content');
        html2canvas(input, { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff' }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            pdf.save(`Dashboard_${new Date().toISOString().slice(0, 10)}.pdf`);
        });
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            overflowY: 'scroll', zIndex: 9999, padding: 20
        }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10 }}>❌</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>📊 Dashboard Panel</h2>
                <div>
                    <label>📆 Filter: </label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Month">This Month</option>
                        <option value="Quarter">This Quarter</option>
                        <option value="Year">This Year</option>
                    </select>

                    <label style={{ marginLeft: '20px' }}>🌓 Theme: </label>
                    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>

                    <button onClick={exportToPDF} style={{ marginLeft: '20px' }}>📄 Export PDF</button>
                </div>
            </div>

            <div id="dashboard-content">
                <h3>📈 Total Questions by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.total}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="fillBlanks" stackId="a" fill="#8884d8" />
                        <Bar dataKey="objective" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="trueFalse" stackId="a" fill="#ffc658" />
                        <Bar dataKey="descriptive" stackId="a" fill="#ff7300" />
                    </BarChart>
                </ResponsiveContainer>

                <h3>📊 Section-wise Trends</h3>
                {['fillBlanks', 'objective', 'trueFalse', 'descriptive'].map((section, idx) => (
                    <div key={section}>
                        <h4>📌 {section.replace(/([A-Z])/g, ' $1')}</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={data[section]}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ))}

                <h3>🍩 Distribution (Pie)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            dataKey="value"
                            data={[
                                { name: 'FillBlanks', value: data.fillBlanks.reduce((sum, d) => sum + d.count, 0) },
                                { name: 'Objective', value: data.objective.reduce((sum, d) => sum + d.count, 0) },
                                { name: 'TrueFalse', value: data.trueFalse.reduce((sum, d) => sum + d.count, 0) },
                                { name: 'Descriptive', value: data.descriptive.reduce((sum, d) => sum + d.count, 0) }
                            ]}
                            cx="50%" cy="50%" outerRadius={100}
                            label
                        >
                            {COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardPanel;
