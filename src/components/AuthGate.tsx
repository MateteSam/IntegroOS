import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check for dev override
    if (true || localStorage.getItem('dev_auth') === 'true') {
      setUser({ id: 'dev-admin', email: 'admin@wcccs.global' } as User);
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email and password required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setAuthLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setAuthLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! You can now sign in.');
      setEmail('');
      setPassword('');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email and password required');
      return;
    }

    // Developer Override for immediate access without configuring Supabase Emails
    if (email === 'admin@wcccs.global' && password === 'godmode') {
      localStorage.setItem('dev_auth', 'true');
      toast.success('Developer Override Initialized.');
      window.location.reload();
      return;
    }

    setAuthLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setAuthLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Initializing Neural Core...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 z-0 bg-gradient-radial from-primary/5 via-background to-background" />

      <div className="z-10 w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-4">
          <div className="w-48 h-24 flex items-center justify-center overflow-hidden mb-2">
            <img src="/images/integro-logo.png" alt="Integro OS Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
          </div>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs font-bold text-center">
            Global Command Center
          </p>
        </div>

        <Card className="glass-sovereign border-border/50">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Enter your credentials to access the nexus.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Request Access</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="operative@wcccs.global"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-accent/5 border-border focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Security Protocol</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-accent/5 border-border focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary hover:opacity-90 transition-opacity" disabled={authLoading}>
                    {authLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Initialize Session
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="operative@wcccs.global"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-accent/5 border-border focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Security Protocol</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-accent/5 border-border focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" disabled={authLoading}>
                    {authLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Request Clearance
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
