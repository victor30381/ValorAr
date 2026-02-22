import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Investment, Withdrawal } from '../context/InvestmentContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtARS = (value: number) =>
    `$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (dateStr: string) => {
    try {
        const [y, m, d] = dateStr.split('-');
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
    } catch {
        return dateStr;
    }
};

const today = () => {
    const now = new Date();
    return now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ─── Colors ──────────────────────────────────────────────────────────────────
const COLOR_PRIMARY = [16, 185, 129] as [number, number, number]; // emerald-500
const COLOR_DARK = [15, 23, 42] as [number, number, number]; // slate-900
const COLOR_LIGHT_BG = [241, 245, 249] as [number, number, number]; // slate-100
const COLOR_GREEN = [16, 185, 129] as [number, number, number];
const COLOR_RED = [239, 68, 68] as [number, number, number];
const COLOR_MUTED = [100, 116, 139] as [number, number, number]; // slate-500
const COLOR_WHITE = [255, 255, 255] as [number, number, number];
const COLOR_BORDER = [226, 232, 240] as [number, number, number]; // slate-200

// ─── Main export ─────────────────────────────────────────────────────────────

// ─── Main export ─────────────────────────────────────────────────────────────

const loadLogoAsBase64 = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

export async function generatePortfolioPDF(
    investments: Investment[],
    withdrawals: Withdrawal[],
    userName?: string
) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 0;

    // ── METRICS ────────────────────────────────────────────────────────────
    const totalCapital = investments.reduce((s, i) => s + Number(i.amount), 0);
    const totalWithdrawals = withdrawals.reduce((s, w) => s + Number(w.amount), 0);
    const netCapital = totalCapital - totalWithdrawals;
    const totalGain = investments.reduce((s, i) => i.maturityValue ? s + (i.maturityValue - i.amount) : s, 0);
    const maturityTotal = netCapital + totalGain;

    const weightedTae = investments.reduce((s, i) => {
        if (i.tae && i.amount) {
            const n = parseFloat(i.tae.replace('%', '').replace(',', '.'));
            return isNaN(n) ? s : s + n * i.amount;
        }
        return s;
    }, 0);
    const avgTae = totalCapital > 0 ? weightedTae / totalCapital : 0;

    // ══════════════════════════════════════════════════════════════════════
    //  HEADER
    // ══════════════════════════════════════════════════════════════════════
    // Green top bar
    doc.setFillColor(...COLOR_DARK);
    doc.rect(0, 0, pageW, 28, 'F');

    // Logo
    const logoBase64 = await loadLogoAsBase64('/logo.png');
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin + 3, 7, 14, 14);
    } else {
        // Fallback Logo circle
        doc.setFillColor(...COLOR_PRIMARY);
        doc.circle(margin + 7, 14, 7, 'F');
        doc.setTextColor(...COLOR_WHITE);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('VA', margin + 7, 14 + 3, { align: 'center' });
    }

    // App name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_WHITE);
    doc.text('ValorAr', margin + 18, 12);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_PRIMARY);
    doc.text('Portafolio de Inversiones', margin + 18, 18);

    // Date & user on the right
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    const headerRight = `Generado: ${today()}`;
    doc.text(headerRight, pageW - margin, 11, { align: 'right' });
    if (userName) {
        doc.setTextColor(...COLOR_WHITE);
        doc.text(userName, pageW - margin, 18, { align: 'right' });
    }

    y = 34;

    // ══════════════════════════════════════════════════════════════════════
    //  KPI CARDS (4 cards in a row)
    // ══════════════════════════════════════════════════════════════════════
    const cardW = (pageW - margin * 2 - 9) / 4;
    const cardH = 22;

    const kpis = [
        { label: 'Capital Invertido', value: fmtARS(netCapital), sub: 'Inv - Retiros', color: COLOR_MUTED },
        { label: 'Ganancia Est.', value: fmtARS(totalGain), sub: 'Al vencimiento', color: COLOR_GREEN },
        { label: 'Capital al Vto.', value: fmtARS(maturityTotal), sub: 'Invertido + Gan.', color: COLOR_PRIMARY },
        { label: 'Tasa Promedio', value: `${avgTae.toFixed(1)}%`, sub: 'TAE ponderada', color: COLOR_PRIMARY },
    ];

    kpis.forEach((kpi, i) => {
        const x = margin + i * (cardW + 3);
        // Card background
        doc.setFillColor(...COLOR_LIGHT_BG);
        doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
        // Accent left bar
        doc.setFillColor(...kpi.color);
        doc.roundedRect(x, y, 3, cardH, 1.5, 1.5, 'F');

        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLOR_MUTED);
        doc.text(kpi.label.toUpperCase(), x + 6, y + 6);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...kpi.color);
        doc.text(kpi.value, x + 6, y + 13);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLOR_MUTED);
        doc.text(kpi.sub, x + 6, y + 19);
    });

    y += cardH + 8;

    // ══════════════════════════════════════════════════════════════════════
    //  POSICIONES ACTIVAS
    // ══════════════════════════════════════════════════════════════════════
    if (investments.length > 0) {
        // Section title
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLOR_DARK);
        doc.text('Posiciones Activas', margin, y);
        doc.setDrawColor(...COLOR_PRIMARY);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 1.5, margin + 40, y + 1.5);
        y += 5;

        const posHeaders = [['Fecha', 'Instrumento', 'Ticker', 'Broker', 'Invertido', 'Nominales', 'Vto.', 'Val.Vto.', 'Ganancia', 'TAE']];
        const posRows = investments.map(inv => {
            const gain = inv.maturityValue ? inv.maturityValue - inv.amount : 0;
            return [
                fmtDate(inv.date),
                inv.type,
                inv.ticker || '-',
                inv.broker || '-',
                fmtARS(Number(inv.amount)),
                inv.nominals ? inv.nominals.toLocaleString('es-AR', { maximumFractionDigits: 2 }) : '-',
                inv.maturityDate || '-',
                inv.maturityValue ? fmtARS(inv.maturityValue) : '-',
                gain > 0 ? `+${fmtARS(gain)}` : '-',
                inv.tae || '-',
            ];
        });

        autoTable(doc, {
            startY: y,
            head: posHeaders,
            body: posRows,
            theme: 'plain',
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 6.5,
                cellPadding: 2,
                textColor: COLOR_DARK,
                lineColor: COLOR_BORDER,
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: COLOR_DARK,
                textColor: COLOR_WHITE,
                fontStyle: 'bold',
                fontSize: 6.5,
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            columnStyles: {
                8: { textColor: COLOR_GREEN, fontStyle: 'bold' }, // Ganancia
                9: { textColor: COLOR_PRIMARY, fontStyle: 'bold' }, // TAE
            },
            didParseCell: (data) => {
                // Highlight gain column in green
                if (data.column.index === 8 && data.section === 'body') {
                    data.cell.styles.textColor = COLOR_GREEN;
                }
            },
        });

        y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  HISTORIAL DE MOVIMIENTOS
    // ══════════════════════════════════════════════════════════════════════
    // Sort all movements by date desc
    type MovRow = { date: string; tipo: string; descripcion: string; monto: number; };
    const allMovements: MovRow[] = [
        ...investments.map(i => ({
            date: i.date,
            tipo: 'Inversión',
            descripcion: i.ticker ? `${i.type} — ${i.ticker}` : i.type,
            monto: Number(i.amount),
        })),
        ...withdrawals.map(w => ({
            date: w.date,
            tipo: 'Retiro',
            descripcion: w.description || 'Retiro de fondos',
            monto: Number(w.amount),
        })),
    ].sort((a, b) => (a.date > b.date ? -1 : 1));

    // Check if we need a new page
    if (y > pageH - 60) {
        doc.addPage();
        y = 14;
    }

    // Section title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_DARK);
    doc.text('Historial de Movimientos', margin, y);
    doc.setDrawColor(...COLOR_PRIMARY);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 1.5, margin + 55, y + 1.5);
    y += 5;

    const movHeaders = [['Fecha', 'Tipo', 'Descripción', 'Monto']];
    const movRows = allMovements.map(m => [
        fmtDate(m.date),
        m.tipo,
        m.descripcion,
        `${m.tipo === 'Inversión' ? '+' : '-'} ${fmtARS(m.monto)}`,
    ]);

    autoTable(doc, {
        startY: y,
        head: movHeaders,
        body: movRows,
        theme: 'plain',
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 7,
            cellPadding: 2.5,
            textColor: COLOR_DARK,
            lineColor: COLOR_BORDER,
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: COLOR_DARK,
            textColor: COLOR_WHITE,
            fontStyle: 'bold',
            fontSize: 7,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            1: { fontStyle: 'bold', cellWidth: 22 },
            3: { fontStyle: 'bold', halign: 'right', cellWidth: 42 },
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
                data.cell.styles.textColor =
                    data.cell.raw === 'Inversión' ? COLOR_GREEN : COLOR_RED;
            }
            if (data.section === 'body' && data.column.index === 3) {
                const raw = String(data.cell.raw);
                data.cell.styles.textColor =
                    raw.startsWith('+') ? COLOR_GREEN : COLOR_RED;
            }
        },
    });

    // ══════════════════════════════════════════════════════════════════════
    //  FOOTER on every page
    // ══════════════════════════════════════════════════════════════════════
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(...COLOR_DARK);
        doc.rect(0, pageH - 10, pageW, 10, 'F');
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('ValorAr — Portafolio de Inversiones', margin, pageH - 3.5);
        doc.text(
            `Página ${p} de ${totalPages}  •  ${today()}`,
            pageW - margin,
            pageH - 3.5,
            { align: 'right' }
        );
    }

    // ── Save ────────────────────────────────────────────────────────────
    doc.save(`valorar-reporte-${new Date().toISOString().slice(0, 10)}.pdf`);
}
