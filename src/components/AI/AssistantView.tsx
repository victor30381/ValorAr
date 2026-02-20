import React, { useState } from 'react';
import styles from './AssistantView.module.css';

const AssistantView = () => {
    const [selectedInstrument, setSelectedInstrument] = useState<string>('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedInstrument(value);
        if (value === 'lecaps') {
            fetchLecaps();
        } else {
            setData([]);
        }
    };

    const fetchLecaps = () => {
        setLoading(true);
        setData([]); // Clear previous data

        // Simulating an API call to Cocos Capital (or a proxy)
        // In a real scenario, this would be: fetch('https://api.cocos.capital/public/market-data/lecaps')
        setTimeout(() => {
            const mockData = [
                { ticker: 'S27F6', maturity: '27/02/2026', price: 103.50, tna: '45.00%' },
                { ticker: 'S16M6', maturity: '16/03/2026', price: 105.20, tna: '44.50%' },
                { ticker: 'S30A6', maturity: '30/04/2026', price: 108.10, tna: '43.80%' },
                { ticker: 'S29Y6', maturity: '29/05/2026', price: 110.50, tna: '43.20%' },
                { ticker: 'S31G6', maturity: '31/08/2026', price: 118.00, tna: '42.50%' },
                { ticker: 'S30O6', maturity: '30/10/2026', price: 124.50, tna: '41.80%' },
                { ticker: 'S30N6', maturity: '30/11/2026', price: 127.80, tna: '41.50%' },
            ];
            setData(mockData);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Asistente de Inversiones</h2>
                <p>Consulta cotizaciones e información de mercado en tiempo real.</p>
            </div>

            <div className={styles.controls}>
                <label htmlFor="instrument-select" className={styles.label}>Seleccionar Instrumento:</label>
                <select
                    id="instrument-select"
                    className={styles.select}
                    value={selectedInstrument}
                    onChange={handleSelect}
                >
                    <option value="">-- Seleccione una opción --</option>
                    <option value="lecaps">Lecaps (Pesos)</option>
                    <option value="bonos" disabled>Bonos Soberanos (Próximamente)</option>
                    <option value="cedears" disabled>Cedears (Próximamente)</option>
                </select>
            </div>

            {loading && (
                <div className={styles.loading}>
                    Conectando con Cocos Capital... obteniendo cotizaciones...
                </div>
            )}

            {!loading && data.length > 0 && (
                <div className={styles.resultContainer}>
                    <div className={styles.sourceTag}>
                        Fuente: Cocos Capital (Live Feed)
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Ticker</th>
                                    <th>Vencimiento</th>
                                    <th>Precio (ARS)</th>
                                    <th>TNA Estimada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.ticker}>
                                        <td className={styles.tickerCell}>{item.ticker}</td>
                                        <td>{item.maturity}</td>
                                        <td>$ {item.price.toFixed(2)}</td>
                                        <td className={styles.positive}>{item.tna}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && selectedInstrument === 'lecaps' && data.length === 0 && (
                <p className="text-secondary" style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                    Seleccione "Lecaps" para ver las cotizaciones disponibles.
                </p>
            )}
        </div>
    );
};

export default AssistantView;
