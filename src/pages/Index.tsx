import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CryptoStaking } from '@/components/CryptoStaking';
import { DeadspotMining } from '@/components/DeadspotMining';
import { LiveTransactions } from '@/components/LiveTransactions';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Settings } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check current user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user?.email === 'maximlprive90@gmail.com') {
        setIsAdmin(true);
      }
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsAdmin(session?.user?.email === 'maximlprive90@gmail.com');
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Auth buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
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
          
          <div className="flex flex-col gap-2 ml-4">
            {user ? (
              <>
                <div className="text-sm text-muted-foreground">
                  Connecté: {user.email}
                </div>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Inscription
                  </Button>
                </Link>
              </>
            )}
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
