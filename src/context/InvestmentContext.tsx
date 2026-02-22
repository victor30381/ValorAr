import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

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

export interface Withdrawal {
    id: string;
    date: string;
    amount: number;
    description?: string;
}

interface InvestmentContextType {
    investments: Investment[];
    withdrawals: Withdrawal[];
    addInvestment: (investment: Omit<Investment, 'id'>) => Promise<void>;
    removeInvestment: (id: string) => Promise<void>;
    addWithdrawal: (withdrawal: Omit<Withdrawal, 'id'>) => Promise<void>;
    removeWithdrawal: (id: string) => Promise<void>;
    totalCapital: number;
    totalWithdrawals: number;
    netCapital: number;
    loading: boolean;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const InvestmentProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to investments collection in real-time
    useEffect(() => {
        if (!user) {
            setInvestments([]);
            setWithdrawals([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Listen to investments
        const investmentsRef = collection(db, 'users', user.uid, 'investments');
        const investmentsQuery = query(investmentsRef, orderBy('date', 'desc'));
        const unsubInvestments = onSnapshot(investmentsQuery, (snapshot) => {
            const invData = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            })) as Investment[];
            setInvestments(invData);
            setLoading(false);
        }, (error) => {
            console.error('Error listening to investments:', error);
            setLoading(false);
        });

        // Listen to withdrawals
        const withdrawalsRef = collection(db, 'users', user.uid, 'withdrawals');
        const withdrawalsQuery = query(withdrawalsRef, orderBy('date', 'desc'));
        const unsubWithdrawals = onSnapshot(withdrawalsQuery, (snapshot) => {
            const wData = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            })) as Withdrawal[];
            setWithdrawals(wData);
        }, (error) => {
            console.error('Error listening to withdrawals:', error);
        });

        return () => {
            unsubInvestments();
            unsubWithdrawals();
        };
    }, [user]);

    const addInvestment = async (investment: Omit<Investment, 'id'>) => {
        if (!user) return;
        try {
            const investmentsRef = collection(db, 'users', user.uid, 'investments');
            await addDoc(investmentsRef, investment);
        } catch (error) {
            console.error('Error adding investment:', error);
            throw error;
        }
    };

    const removeInvestment = async (id: string) => {
        if (!user) return;
        try {
            const docRef = doc(db, 'users', user.uid, 'investments', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error removing investment:', error);
            throw error;
        }
    };

    const addWithdrawal = async (withdrawal: Omit<Withdrawal, 'id'>) => {
        if (!user) return;
        try {
            const withdrawalsRef = collection(db, 'users', user.uid, 'withdrawals');
            await addDoc(withdrawalsRef, withdrawal);
        } catch (error) {
            console.error('Error adding withdrawal:', error);
            throw error;
        }
    };

    const removeWithdrawal = async (id: string) => {
        if (!user) return;
        try {
            const docRef = doc(db, 'users', user.uid, 'withdrawals', id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error removing withdrawal:', error);
            throw error;
        }
    };

    const totalCapital = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
    const netCapital = totalCapital - totalWithdrawals;

    return (
        <InvestmentContext.Provider value={{
            investments,
            withdrawals,
            addInvestment,
            removeInvestment,
            addWithdrawal,
            removeWithdrawal,
            totalCapital,
            totalWithdrawals,
            netCapital,
            loading,
        }}>
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
