import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CryptoStaking } from '@/components/CryptoStaking';
import { DeadspotMining } from '@/components/DeadspotMining';
import { LiveTransactions } from '@/components/LiveTransactions';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            🚀 CRYPTO STAKING & DEADSPOT MINING 🚀
          </h1>
          <p className="text-xl text-muted-foreground">
            Stakez vos cryptos et minez du DEADSPOT-COIN du futur !
          </p>
          <div className="mt-4 p-4 neon-border rounded-lg bg-card/50">
            <p className="text-sm text-primary">
              ⚡ Plateforme futuriste de staking et mining ⚡
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              DEADSPOT-COIN - Listing prévu: 2027-03-29
            </p>
          </div>
        </div>

        {/* Historique Live des Transactions */}
        <LiveTransactions />

        <Tabs defaultValue="staking" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 neon-border">
            <TabsTrigger value="staking" className="text-lg">
              💎 Crypto Staking
            </TabsTrigger>
            <TabsTrigger value="mining" className="text-lg">
              ⛏️ DEADSPOT Mining
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="staking">
            <CryptoStaking />
          </TabsContent>
          
          <TabsContent value="mining">
            <DeadspotMining />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
