import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface StakeDeposit {
  id: string;
  crypto: string;
  amount: number;
  percentage: number;
  duration: number; // en jours
  transactionId: string;
  timestamp: number;
  verified: boolean;
}

interface CryptoInfo {
  name: string;
  address: string;
  percentage: number;
}

const cryptoAddresses: Record<string, CryptoInfo> = {
  dogs: { 
    name: 'DOGS (TON)', 
    address: 'UQArqoMhUHIsfq9xsATWfZ_zj7nPJTiShe6LSjqbrJFow9rI',
    percentage: 2.5
  },
  dogecoin: { 
    name: 'Dogecoin', 
    address: 'DDVYeK8MiizfsnzLtigSAWfx6PH24puQze',
    percentage: 3.2
  },
  trx: { 
    name: 'TRX', 
    address: 'TY4o9UKBz32xi8hexbv6XhccqGBqSk8oJ7',
    percentage: 2.8
  },
  matic: { 
    name: 'MATIC (Polygon)', 
    address: '0x380060e81A820a1691fA58C84ba27c23ed1Eff77',
    percentage: 3.0
  },
  litecoin: { 
    name: 'Litecoin', 
    address: 'M9NRbJWHaM6Ry7SaG1tjj6qE4XXeYS7mVr',
    percentage: 2.7
  },
  solana: { 
    name: 'Solana', 
    address: 'CWnduVqeRQrxqhGPNDnHTqHWM1dJLqCnojhMQS8FEUFB',
    percentage: 3.5
  },
  pepe: { 
    name: 'PEPE', 
    address: '0x9af5CEd5b30a94794d9C070a78F77b65eb357e12',
    percentage: 4.0
  }
};

export const CryptoStaking = () => {
  const [deposits, setDeposits] = useState<StakeDeposit[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawCrypto, setWithdrawCrypto] = useState<string>('');
  const [withdrawWallet, setWithdrawWallet] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const savedDeposits = localStorage.getItem('cryptoDeposits');
    if (savedDeposits) {
      setDeposits(JSON.parse(savedDeposits));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cryptoDeposits', JSON.stringify(deposits));
    
    // Calculer le solde total
    const now = Date.now();
    let total = 0;
    
    deposits.forEach(deposit => {
      if (deposit.verified) {
        const daysPassed = (now - deposit.timestamp) / (1000 * 60 * 60 * 24);
        const dailyRate = deposit.percentage / 100 / deposit.duration;
        const earnedAmount = deposit.amount * dailyRate * Math.min(daysPassed, deposit.duration);
        total += deposit.amount + earnedAmount;
      }
    });
    
    setTotalBalance(total);
  }, [deposits]);

  const submitDeposit = () => {
    if (!selectedCrypto || !amount || !duration || !transactionId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const newDeposit: StakeDeposit = {
      id: Date.now().toString(),
      crypto: selectedCrypto,
      amount: parseFloat(amount),
      percentage: cryptoAddresses[selectedCrypto].percentage,
      duration: parseInt(duration),
      transactionId,
      timestamp: Date.now(),
      verified: false
    };

    setDeposits(prev => [...prev, newDeposit]);
    
    // Simulation de vérification après 2 minutes (pour demo, on vérifie immédiatement)
    setTimeout(() => {
      setDeposits(prev => prev.map(dep => 
        dep.id === newDeposit.id ? { ...dep, verified: true } : dep
      ));
      toast({
        title: "Dépôt vérifié !",
        description: `Votre dépôt de ${amount} ${cryptoAddresses[selectedCrypto].name} a été vérifié.`
      });
    }, 2000);

    // Reset form
    setSelectedCrypto('');
    setAmount('');
    setDuration('');
    setTransactionId('');

    toast({
      title: "Dépôt soumis",
      description: "Votre dépôt est en cours de vérification (2h max)"
    });
  };

  const handleWithdraw = () => {
    const withdrawValue = parseFloat(withdrawAmount);
    
    if (!withdrawCrypto || !withdrawWallet || !withdrawAmount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs de retrait",
        variant: "destructive"
      });
      return;
    }
    
    if (withdrawValue > totalBalance) {
      toast({
        title: "Erreur",
        description: "Montant insuffisant",
        variant: "destructive"
      });
      return;
    }

    // Générer un délai aléatoire entre 10h et 48h
    const minHours = 10;
    const maxHours = 48;
    const randomHours = Math.floor(Math.random() * (maxHours - minHours + 1)) + minHours;
    
    // Simuler le retrait avec délai
    toast({
      title: "Retrait en cours",
      description: `Retrait de ${withdrawValue} ${cryptoAddresses[withdrawCrypto].name} vers votre wallet. Délai estimé: ${randomHours}h. Vous recevrez une notification dès que le transfert sera terminé.`,
    });
    
    // Reset form
    setWithdrawAmount('');
    setWithdrawCrypto('');
    setWithdrawWallet('');
  };

  const getTotalEarnings = () => {
    const now = Date.now();
    let totalEarnings = 0;
    
    deposits.forEach(deposit => {
      if (deposit.verified) {
        const daysPassed = (now - deposit.timestamp) / (1000 * 60 * 60 * 24);
        const dailyRate = deposit.percentage / 100 / deposit.duration;
        const earnedAmount = deposit.amount * dailyRate * Math.min(daysPassed, deposit.duration);
        totalEarnings += earnedAmount;
      }
    });
    
    return totalEarnings;
  };

  return (
    <div className="space-y-6">
      <Card className="crypto-card p-6 neon-border">
        <h2 className="text-2xl font-bold mb-4 text-primary">💎 Crypto Staking</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Crypto-monnaie</Label>
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger className="neon-border">
                <SelectValue placeholder="Sélectionner une crypto" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(cryptoAddresses).map(([key, crypto]) => (
                  <SelectItem key={key} value={key}>
                    {crypto.name} ({crypto.percentage}% APY)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCrypto && (
              <div className="mt-2 p-3 bg-card/80 rounded-lg neon-border">
                <p className="text-lg font-bold text-primary mb-1">
                  🏦 ADRESSE DE DÉPÔT:
                </p>
                <p className="text-sm font-mono text-secondary break-all bg-muted p-2 rounded">
                  {cryptoAddresses[selectedCrypto].address}
                </p>
                <p className="text-xs text-destructive mt-1 font-semibold">
                  ⚠️ ATTENTION: Vérifiez bien l'adresse pour éviter la perte de vos cryptos!
                </p>
              </div>
            )}
          </div>
          
          <div>
            <Label>Montant</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant à staker"
              className="neon-border"
            />
          </div>
          
          <div>
            <Label>Durée (jours)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 90 jours"
              className="neon-border"
            />
          </div>
          
          <div>
            <Label>ID Transaction</Label>
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="ID de la transaction"
              className="neon-border"
            />
          </div>
        </div>
        
        <Button onClick={submitDeposit} className="w-full neon-glow">
          Soumettre le dépôt
        </Button>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="crypto-card p-4 neon-border">
          <h3 className="text-lg font-semibold text-primary">Solde Total</h3>
          <p className="text-2xl font-bold scrolling-numbers">{totalBalance.toFixed(6)}</p>
        </Card>
        
        <Card className="crypto-card p-4 neon-border">
          <h3 className="text-lg font-semibold text-secondary">Revenus Générés</h3>
          <p className="text-2xl font-bold scrolling-numbers">{getTotalEarnings().toFixed(6)}</p>
        </Card>
        
        <Card className="crypto-card p-4 neon-border">
          <h3 className="text-lg font-semibold text-accent">Dépôts Actifs</h3>
          <p className="text-2xl font-bold scrolling-numbers">{deposits.filter(d => d.verified).length}</p>
        </Card>
      </div>

      {/* Historique des dépôts */}
      <Card className="crypto-card p-6 neon-border">
        <h3 className="text-xl font-bold mb-4">Historique des dépôts</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {deposits.map(deposit => (
            <div key={deposit.id} className="flex justify-between items-center p-2 bg-muted rounded flashing-border">
              <span>{cryptoAddresses[deposit.crypto].name}: {deposit.amount}</span>
              <span className={deposit.verified ? 'text-green-400' : 'text-yellow-400'}>
                {deposit.verified ? '✅ Vérifié' : '⏳ En attente'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Retrait */}
      <Card className="crypto-card p-6 neon-border">
        <h3 className="text-xl font-bold mb-4">💸 Retrait de Crypto</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Crypto-monnaie à retirer</Label>
              <Select value={withdrawCrypto} onValueChange={setWithdrawCrypto}>
                <SelectTrigger className="neon-border">
                  <SelectValue placeholder="Sélectionner crypto" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cryptoAddresses).map(([key, crypto]) => (
                    <SelectItem key={key} value={key}>
                      {crypto.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Montant à retirer</Label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Montant"
                className="neon-border"
              />
            </div>
          </div>
          
          <div>
            <Label>Votre adresse wallet {withdrawCrypto && `(${cryptoAddresses[withdrawCrypto].name})`}</Label>
            <Input
              value={withdrawWallet}
              onChange={(e) => setWithdrawWallet(e.target.value)}
              placeholder="Entrez votre adresse de wallet de destination"
              className="neon-border font-mono"
            />
            {withdrawCrypto && (
              <div className="mt-2 p-3 bg-card/80 rounded-lg neon-border">
                <p className="text-sm font-bold text-primary mb-1">
                  📋 Mode {cryptoAddresses[withdrawCrypto].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Assurez-vous que l'adresse correspond au réseau {cryptoAddresses[withdrawCrypto].name}
                </p>
                <p className="text-xs text-destructive mt-1 font-semibold">
                  ⚠️ Délai de traitement: 10-48h après validation
                </p>
              </div>
            )}
          </div>
          
          <Button onClick={handleWithdraw} className="w-full neon-glow">
            Demander le retrait
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            💰 Solde disponible: {totalBalance.toFixed(6)}
          </p>
        </div>
      </Card>
    </div>
  );
};