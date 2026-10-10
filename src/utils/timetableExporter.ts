import * as XLSX from 'xlsx';

export interface TimetableSlotExportItem {
  day: string;
  periodNumber: number;
  periodRoman?: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  room: string;
  section: string;
}

export interface TimetableExportData {
  title: string;
  department: string;
  year?: number | string;
  sectionOrStudent: string;
  generatedDate?: string;
  periods: Array<{ period: string; periodNumber: number; timeRange: string }>;
  days: string[];
  matrix: Record<string, Array<TimetableSlotExportItem | null>>;
  rawSlots?: TimetableSlotExportItem[];
}

/**
 * Generates and downloads an Excel workbook (.xlsx) formatted for institutional academic timetables.
 */
export function exportTimetableToExcel(data: TimetableExportData, filenamePrefix = 'Academic_Timetable'): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Weekly Matrix View
  const matrixRows: any[][] = [];

  // Header Block
  matrixRows.push(['INSTITUTIONAL ACADEMIC TIMETABLE']);
  matrixRows.push([data.title]);
  matrixRows.push([`Department: ${data.department}`, '', `Cohort / Section: ${data.sectionOrStudent}`, '', `Generated: ${data.generatedDate || new Date().toLocaleDateString()}`]);
  matrixRows.push([]); // blank separator

  // Table Column Headers: Day, Period I (time), Period II (time), ...
  const tableHeader = ['Day / Period', ...data.periods.map(p => `Period ${p.period}\n(${p.timeRange})`)];
  matrixRows.push(tableHeader);

  // Rows per Day
  data.days.forEach(day => {
    const daySlots = data.matrix[day] || [];
    const row = [day.toUpperCase()];
    for (let pIdx = 0; pIdx < data.periods.length; pIdx++) {
      const slot = daySlots[pIdx];
      if (slot) {
        row.push(`${slot.courseCode} - ${slot.courseName}\nFac: ${slot.facultyName}\nRoom: [${slot.room}]`);
      } else {
        row.push('---');
      }
    }
    matrixRows.push(row);
  });

  const matrixWs = XLSX.utils.aoa_to_sheet(matrixRows);

  // Column widths
  matrixWs['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 32 },
    { wch: 32 },
    { wch: 32 },
    { wch: 32 },
    { wch: 32 },
  ];

  XLSX.utils.book_append_sheet(wb, matrixWs, 'Weekly Matrix');

  // Sheet 2: Tabular Slot List
  if (data.rawSlots && data.rawSlots.length > 0) {
    const listRows: any[][] = [];
    listRows.push(['Day', 'Period', 'Time Slot', 'Course Code', 'Course Name', 'Faculty Name', 'Classroom / Lab', 'Section']);
    data.rawSlots.forEach(s => {
      listRows.push([
        s.day,
        s.periodRoman || `Period ${s.periodNumber}`,
        s.timeRange,
        s.courseCode,
        s.courseName,
        s.facultyName,
        s.room,
        s.section,
      ]);
    });
    const listWs = XLSX.utils.aoa_to_sheet(listRows);
    listWs['!cols'] = [
      { wch: 10 },
      { wch: 12 },
      { wch: 22 },
      { wch: 14 },
      { wch: 36 },
      { wch: 24 },
      { wch: 16 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, listWs, 'Detailed Schedule');
  }

  const safeName = `${filenamePrefix}_${data.sectionOrStudent.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, safeName);
}

/**
 * Triggers a browser print dialog with styled printable layout suitable for Saving as PDF.
 */
export function exportTimetableToPdf(data: TimetableExportData): void {
  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    alert('Please allow popups to generate and print the timetable document.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.title} - ${data.sectionOrStudent}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .inst-name {
      font-size: 20px;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin: 0;
    }
    .sub-title {
      font-size: 15px;
      font-weight: 600;
      color: #334155;
      margin: 4px 0;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-top: 8px;
      padding: 6px 12px;
      background: #f1f5f9;
      border-radius: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 6px;
      vertical-align: top;
    }
    th {
      background-color: #0f766e;
      color: white;
      font-weight: 700;
      text-align: center;
      line-height: 1.3;
    }
    th.day-col {
      width: 85px;
      background-color: #042f2e;
    }
    .day-cell {
      background-color: #f8fafc;
      font-weight: 700;
      text-align: center;
      color: #0f766e;
      font-size: 13px;
    }
    .slot-cell {
      background-color: #ffffff;
      height: 65px;
    }
    .slot-cell:nth-child(even) {
      background-color: #fcfdfe;
    }
    .code-badge {
      display: inline-block;
      font-weight: 800;
      color: #0f766e;
      font-size: 10.5px;
      margin-bottom: 2px;
    }
    .course-title {
      font-weight: 600;
      color: #0f172a;
      line-height: 1.2;
      margin-bottom: 4px;
      font-size: 10px;
    }
    .fac-name {
      font-size: 9.5px;
      color: #475569;
      font-style: italic;
    }
    .room-badge {
      display: inline-block;
      margin-top: 4px;
      padding: 1px 5px;
      background: #e2e8f0;
      color: #1e293b;
      font-weight: 700;
      border-radius: 3px;
      font-size: 9px;
    }
    .empty-slot {
      color: #94a3b8;
      text-align: center;
      font-style: italic;
      padding-top: 20px;
      font-size: 10px;
    }
    .footer {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
      padding-top: 16px;
    }
    .sig-box {
      border-top: 1px dashed #94a3b8;
      width: 180px;
      text-align: center;
      padding-top: 6px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="inst-name">Bannari Amman Institute of Technology</div>
    <div class="sub-title">${data.title} - Weekly Timetable Matrix</div>
    <div class="meta-bar">
      <span><strong>Department:</strong> ${data.department}</span>
      <span><strong>Target / Cohort:</strong> ${data.sectionOrStudent}</span>
      <span><strong>Generated:</strong> ${data.generatedDate || new Date().toLocaleString()}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="day-col">Day / Period</th>
        ${data.periods.map(p => `
          <th>
            <div>Period ${p.period}</div>
            <div style="font-size: 9.5px; font-weight: 500; opacity: 0.9;">${p.timeRange}</div>
          </th>
        `).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.days.map(day => {
        const slots = data.matrix[day] || [];
        return `
          <tr>
            <td class="day-cell">${day.toUpperCase()}</td>
            ${data.periods.map((_, pIdx) => {
              const slot = slots[pIdx];
              if (!slot) {
                return '<td class="slot-cell empty-slot">Free Period</td>';
              }
              return `
                <td class="slot-cell">
                  <div class="code-badge">${slot.courseCode}</div>
                  <div class="course-title">${slot.courseName}</div>
                  <div class="fac-name">👨‍🏫 ${slot.facultyName}</div>
                  <div class="room-badge">📍 ${slot.room}</div>
                </td>
              `;
            }).join('')}
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div class="sig-box">Class Advisor / Timetable Coordinator</div>
    <div class="sig-box">Head of Department (HoD)</div>
    <div class="sig-box">Dean / Principal</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
