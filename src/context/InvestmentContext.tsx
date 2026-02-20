import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Investment {
    id: string;
    date: string;
    amount: number;
    ticker: string;
    broker: string;
    type: string;
    // Price per nominal (or per 100 nominals)
    price?: number;
    nominals?: number;
    // Financial metrics calculated by AI
    tem?: string;    // Tasa Efectiva Mensual
    tir?: string;    // Tasa Interna de Retorno
    tna?: string;    // Tasa Nominal Anual
    tae?: string;    // Tasa Anual Efectiva
    rate?: string;   // Generic rate display
    maturityDate?: string;
    maturityValue?: number;  // Estimated value at maturity
    currentValue?: number;
    aiExplanation?: string;  // AI reasoning
}

interface InvestmentContextType {
    investments: Investment[];
    addInvestment: (investment: Omit<Investment, 'id'>) => void;
    removeInvestment: (id: string) => void;
    totalCapital: number;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const InvestmentProvider = ({ children }: { children: ReactNode }) => {
    const [investments, setInvestments] = useState<Investment[]>([]);

    const addInvestment = (investment: Omit<Investment, 'id'>) => {
        const newInvestment = {
            ...investment,
            id: Math.random().toString(36).substr(2, 9),
        };
        setInvestments((prev) => [...prev, newInvestment]);
    };

    const removeInvestment = (id: string) => {
        setInvestments((prev) => prev.filter((inv) => inv.id !== id));
    };

    const totalCapital = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);

    return (
        <InvestmentContext.Provider value={{ investments, addInvestment, removeInvestment, totalCapital }}>
            {children}
        </InvestmentContext.Provider>
    );
};

export const useInvestments = () => {
    const context = useContext(InvestmentContext);
    if (context === undefined) {
        throw new Error('useInvestments must be used within an InvestmentProvider');
    }
    return context;
};
