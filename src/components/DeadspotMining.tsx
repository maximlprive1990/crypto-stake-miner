import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface GameState {
  deadspotCoins: number;
  experience: number;
  level: number;
  energy: number;
  maxEnergy: number;
  clickPower: number;
  miningRate: number;
  prestige: number;
  prestigeCoins: number;
  lastFaucetClaim: number;
  
  // Upgrades
  doubleClick: number;
  extraClickPower: number;
  experienceMultiplier: number;
  energyRegenSpeed: number;
}

const initialGameState: GameState = {
  deadspotCoins: 0,
  experience: 0,
  level: 1,
  energy: 1000,
  maxEnergy: 1000,
  clickPower: 1,
  miningRate: 0,
  prestige: 0,
  prestigeCoins: 0,
  lastFaucetClaim: 0,
  
  doubleClick: 0,
  extraClickPower: 0,
  experienceMultiplier: 0,
  energyRegenSpeed: 0
};

export const DeadspotMining = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [lastEnergyRegen, setLastEnergyRegen] = useState(Date.now());
  const { toast } = useToast();

  // Charger le state depuis localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('deadspotGame');
    if (savedState) {
      setGameState(JSON.parse(savedState));
    }
  }, []);

  // Sauvegarder le state
  useEffect(() => {
    localStorage.setItem('deadspotGame', JSON.stringify(gameState));
  }, [gameState]);

  // Régénération d'énergie et mining automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        const timeDiff = now - lastEnergyRegen;
        const energyToRegen = Math.floor(timeDiff / 1000) * (1 + prev.energyRegenSpeed);
        const newEnergy = Math.min(prev.energy + energyToRegen, prev.maxEnergy);
        
        // Mining automatique
        const miningGain = prev.miningRate * (timeDiff / 1000);
        
        setLastEnergyRegen(now);
        
        return {
          ...prev,
          energy: newEnergy,
          deadspotCoins: prev.deadspotCoins + miningGain
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastEnergyRegen]);

  const handleClick = useCallback(() => {
    if (gameState.energy <= 0) {
      toast({
        title: "Énergie insuffisante",
        description: "Attendez que votre énergie se régénère",
        variant: "destructive"
      });
      return;
    }

    setGameState(prev => {
      const clickMultiplier = prev.doubleClick > 0 ? 2 : 1;
      const totalClickPower = (prev.clickPower + prev.extraClickPower) * clickMultiplier;
      const prestigeMultiplier = 1 + (prev.prestige * 0.07);
      
      const coinsGained = 0.00001 * totalClickPower * prestigeMultiplier;
      const expGained = 0.10 * (1 + prev.experienceMultiplier) * prestigeMultiplier;
      const miningGained = 0.000001 * totalClickPower * prestigeMultiplier; // Chaque click augmente le mining h/s
      
      const newExp = prev.experience + expGained;
      const newLevel = Math.floor(newExp / (100 * prev.level)) + prev.level;
      const levelUps = newLevel - prev.level;
      
      return {
        ...prev,
        deadspotCoins: prev.deadspotCoins + coinsGained,
        experience: newExp,
        level: newLevel,
        energy: Math.max(0, prev.energy - 1),
        maxEnergy: prev.maxEnergy + (levelUps * (30 + prev.level)),
        clickPower: prev.clickPower + (levelUps * 4 * prestigeMultiplier),
        miningRate: prev.miningRate + miningGained // Augmente le taux de mining automatique
      };
    });
  }, [gameState.energy, toast]);

  const claimFaucet = () => {
    const now = Date.now();
    const timeSinceLastClaim = now - gameState.lastFaucetClaim;
    const cooldown = 30 * 60 * 1000; // 30 minutes

    if (timeSinceLastClaim < cooldown) {
      const remainingTime = Math.ceil((cooldown - timeSinceLastClaim) / (60 * 1000));
      toast({
        title: "Faucet en cooldown",
        description: `Attendez encore ${remainingTime} minutes`,
        variant: "destructive"
      });
      return;
    }

    const reward = Math.random() * (0.23 - 0.001) + 0.001;
    
    setGameState(prev => ({
      ...prev,
      deadspotCoins: prev.deadspotCoins + reward,
      miningRate: prev.miningRate + (reward / 1000), // Augmente le taux de mining
      lastFaucetClaim: now
    }));

    toast({
      title: "Faucet réclamé !",
      description: `Vous avez reçu ${reward.toFixed(6)} DEADSPOT`
    });
  };

  const attemptPrestige = () => {
    if (gameState.deadspotCoins < 500000) {
      toast({
        title: "Prestige impossible",
        description: "Il vous faut 500,000 DEADSPOT pour le prestige",
        variant: "destructive"
      });
      return;
    }

    setGameState(prev => ({
      ...initialGameState,
      prestige: prev.prestige + 1,
      prestigeCoins: prev.prestigeCoins + prev.deadspotCoins
    }));

    toast({
      title: "Prestige réussi !",
      description: `Niveau de prestige: ${gameState.prestige + 1}`
    });
  };

  const buyUpgrade = (upgradeType: keyof GameState, cost: number) => {
    if (gameState.deadspotCoins < cost) {
      toast({
        title: "Fonds insuffisants",
        description: `Il vous faut ${cost.toFixed(6)} DEADSPOT`,
        variant: "destructive"
      });
      return;
    }

    setGameState(prev => ({
      ...prev,
      deadspotCoins: prev.deadspotCoins - cost,
      [upgradeType]: (prev[upgradeType] as number) + 1
    }));
  };

  const resetGame = () => {
    setGameState(initialGameState);
    localStorage.removeItem('deadspotGame');
    toast({
      title: "Jeu réinitialisé",
      description: "Tous les progrès ont été effacés"
    });
  };

  const getUpgradeCost = (level: number, baseCost: number) => {
    return baseCost * Math.pow(1.5, level);
  };

  return (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="crypto-card p-4 neon-border">
          <h3 className="text-sm font-semibold text-primary">DEADSPOT</h3>
          <p className="text-xl font-bold scrolling-numbers">{gameState.deadspotCoins.toFixed(8)}</p>
        </Card>
        
        <Card className="crypto-card p-4 neon-border">
          <h3 className="text-sm font-semibold text-secondary">Niveau</h3>
          <p className="text-xl font-bold">{gameState.level}</p>
          <p className="text-xs">EXP: {gameState.experience.toFixed(2)}</p>
        </Card>
        
        <Card className="crypto-card p-4 neon-border">
          <h3 className="text-sm font-semibold text-accent">Prestige</h3>
          <p className="text-xl font-bold">{gameState.prestige}</p>
          <p className="text-xs">+{(gameState.prestige * 7).toFixed(1)}% bonus</p>
        </Card>
        
        <Card className="crypto-card p-4 neon-border">
          <h3 className="text-sm font-semibold text-green-400">Mining</h3>
          <p className="text-xl font-bold">{gameState.miningRate.toFixed(8)}/s</p>
        </Card>
      </div>

      {/* Interface de mining */}
      <Card className="crypto-card p-6 neon-border text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary">⛏️ DEADSPOT MINER</h2>
        
        {/* Barre d'énergie */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Énergie</span>
            <span>{gameState.energy}/{gameState.maxEnergy}</span>
          </div>
          <Progress 
            value={(gameState.energy / gameState.maxEnergy) * 100} 
            className="h-4 neon-border"
          />
        </div>

        {/* Bouton de mining */}
        <div className="mb-6">
          <Button
            onClick={handleClick}
            disabled={gameState.energy <= 0}
            className="mining-button mx-auto flex items-center justify-center"
            size="lg"
          >
            <span className="text-2xl">⚡</span>
          </Button>
          <p className="mt-2 text-sm">
            Cliquez pour miner! (+{((gameState.clickPower + gameState.extraClickPower) * (gameState.doubleClick > 0 ? 2 : 1)).toFixed(2)} power)
          </p>
        </div>

        {/* Faucet */}
        <Button 
          onClick={claimFaucet}
          variant="outline"
          className="neon-glow mb-4"
        >
          🚰 Claim Faucet (30min cooldown)
        </Button>

        {/* Prestige */}
        <div className="mt-4">
          <Button 
            onClick={attemptPrestige}
            variant="outline"
            disabled={gameState.deadspotCoins < 500000}
            className="neon-glow"
          >
            ⭐ Prestige (500,000 DEADSPOT)
          </Button>
        </div>
      </Card>

      {/* Upgrades */}
      <Card className="crypto-card p-6 neon-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-primary">🔧 Améliorations</h3>
          <Button 
            onClick={() => setShowUpgrades(!showUpgrades)}
            variant="outline"
          >
            {showUpgrades ? 'Cacher' : 'Afficher'}
          </Button>
        </div>
        
        {showUpgrades && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded neon-border">
              <h4 className="font-semibold">Double Click</h4>
              <p className="text-sm text-muted-foreground">Niveau: {gameState.doubleClick}</p>
              <Button 
                onClick={() => buyUpgrade('doubleClick', getUpgradeCost(gameState.doubleClick, 100))}
                size="sm"
                className="mt-2"
              >
                Acheter ({getUpgradeCost(gameState.doubleClick, 100).toFixed(2)})
              </Button>
            </div>
            
            <div className="p-4 border rounded neon-border">
              <h4 className="font-semibold">+2 Force Click</h4>
              <p className="text-sm text-muted-foreground">Niveau: {gameState.extraClickPower}</p>
              <Button 
                onClick={() => buyUpgrade('extraClickPower', getUpgradeCost(gameState.extraClickPower, 50))}
                size="sm"
                className="mt-2"
              >
                Acheter ({getUpgradeCost(gameState.extraClickPower, 50).toFixed(2)})
              </Button>
            </div>
            
            <div className="p-4 border rounded neon-border">
              <h4 className="font-semibold">Doubleur EXP</h4>
              <p className="text-sm text-muted-foreground">Niveau: {gameState.experienceMultiplier}</p>
              <Button 
                onClick={() => buyUpgrade('experienceMultiplier', getUpgradeCost(gameState.experienceMultiplier, 200))}
                size="sm"
                className="mt-2"
              >
                Acheter ({getUpgradeCost(gameState.experienceMultiplier, 200).toFixed(2)})
              </Button>
            </div>
            
            <div className="p-4 border rounded neon-border">
              <h4 className="font-semibold">Régén Énergie</h4>
              <p className="text-sm text-muted-foreground">Niveau: {gameState.energyRegenSpeed}</p>
              <Button 
                onClick={() => buyUpgrade('energyRegenSpeed', getUpgradeCost(gameState.energyRegenSpeed, 300))}
                size="sm"
                className="mt-2"
              >
                Acheter ({getUpgradeCost(gameState.energyRegenSpeed, 300).toFixed(2)})
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Reset */}
      <Card className="crypto-card p-4 neon-border">
        <Button 
          onClick={resetGame}
          variant="destructive"
          className="w-full"
        >
          🔄 Réinitialiser le jeu
        </Button>
      </Card>
    </div>
  );
};