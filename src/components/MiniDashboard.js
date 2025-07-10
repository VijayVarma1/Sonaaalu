import React, { useContext, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ThemeContext } from '../ThemeContext';

const MiniDashboard = ({ stats }) => {
    const chartRef = useRef();
    const { theme } = useContext(ThemeContext);
    const colors = theme === 'dark' ? ['#557', '#7a7', '#aa7', '#77a'] : ['#8884d8','#82ca9d','#ffc658','#ff8042'];

    const handleExport = async () => {
        const canvas = await html2canvas(chartRef.current, { backgroundColor: theme === 'dark'? '#222' : '#fff' });
        const pdf = new jsPDF();
        pdf.addImage(canvas.toDataURL(), 'PNG', 10, 10, 180, 100);
        pdf.save('MiniDashboard.pdf');
    };

    const data = [
        { name: 'FillBlanks', count: stats.fillBlanks },
        { name: 'Objective', count: stats.objective },
        { name: 'TrueFalse', count: stats.trueFalse },
        { name: 'Descriptive', count: stats.descriptive },
    ];

    return (
        <div className="mini-dashboard-box">
            <div>Mini Dashboard</div>
            <button onClick={handleExport}>Export PDF</button>
            <div ref={chartRef}>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={colors[0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MiniDashboard;
