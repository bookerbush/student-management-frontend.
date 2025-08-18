import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const data = [
  { class: 'PP0', students: 20 },
  { class: 'PP1', students: 25 },
  { class: 'PP2', students: 30 },
  { class: 'Grd1', students: 27 },
  { class: 'Grd2', students: 23 },
  { class: 'Grd3', students: 26 },
  { class: 'Grd4', students: 22 },
  { class: 'Grd5', students: 28 },
  { class: 'Grd6', students: 24 },
];

const barColors = [
  '#ff6b6b', // PP0 - Cool Sunset
  '#ffa36c', // PP1
  '#ffd93d', // PP2
  '#6bc5d2', // Grd1
  '#48bfe3', // Grd2
  '#0096c7', // Grd3 - Cool Science
  '#0077b6', // Grd4
  '#023e8a', // Grd5
  '#03045e', // Grd6
];

export const StudentsChart = () => {
  return (
    <div style={{ marginLeft: "10px" }}>
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Number of Students per Class</h3>
      <ResponsiveContainer width="95%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="class" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="students" barSize={30}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
