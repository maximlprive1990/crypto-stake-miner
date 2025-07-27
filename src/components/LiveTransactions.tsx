import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  user: string;
  crypto: string;
  amount: number;
  timestamp: number;
}

const cryptoNames = ['DOGS', 'Dogecoin', 'TRX', 'MATIC', 'Litecoin', 'Solana', 'PEPE'];

const generateRandomUser = () => {
  const prefixes = ['User', 'Trader', 'Investor', 'Miner', 'Holder'];
  const numbers = Math.floor(Math.random() * 9999) + 1;
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${numbers}`;
};

const generateRandomAmount = (crypto: string) => {
  const amounts = {
    'DOGS': [50, 500],
    'Dogecoin': [10, 100],
    'TRX': [100, 1000],
    'MATIC': [5, 50],
    'Litecoin': [0.1, 2],
    'Solana': [0.5, 5],
    'PEPE': [1000000, 10000000]
  };
  
  const [min, max] = amounts[crypto as keyof typeof amounts] || [1, 100];
  return parseFloat((Math.random() * (max - min) + min).toFixed(crypto === 'PEPE' ? 0 : 6));
};

export const LiveTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const generateTransaction = () => {
      const crypto = cryptoNames[Math.floor(Math.random() * cryptoNames.length)];
      const type = Math.random() > 0.6 ? 'deposit' : 'withdraw';
      
      const newTransaction: Transaction = {
        id: Date.now().toString() + Math.random(),
        type,
        user: generateRandomUser(),
        crypto,
        amount: generateRandomAmount(crypto),
        timestamp: Date.now()
      };

      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]); // Garder seulement les 10 dernières
    };

    // Générer une transaction initiale
    generateTransaction();

    // Générer une nouvelle transaction toutes les 3-8 secondes
    const interval = setInterval(() => {
      generateTransaction();
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number, crypto: string) => {
    if (crypto === 'PEPE') {
      return amount.toLocaleString();
    }
    return amount.toFixed(6);
  };

  return (
    <Card className="crypto-card p-6 neon-border mb-8">
      <h3 className="text-xl font-bold mb-4 text-center">
        📊 Transactions Live - Activité en Temps Réel
      </h3>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {transactions.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            En attente de transactions...
          </div>
        )}
        
        {transactions.map(transaction => (
          <div 
            key={transaction.id} 
            className={`flex justify-between items-center p-3 rounded-lg transition-all duration-500 ${
              transaction.type === 'deposit' 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            } animate-pulse`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg ${
                transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.type === 'deposit' ? '📥' : '📤'}
              </span>
              <div>
                <p className="font-semibold text-sm">
                  {transaction.user}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-bold ${
                transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount, transaction.crypto)} {transaction.crypto}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          🔄 Mise à jour automatique toutes les 3-8 secondes
        </p>
      </div>
    </Card>
  );
};