'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getAuth, onIdTokenChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  role: string | null;
  displayName: string | null; // Add displayName to the context type
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null); // Add state for displayName
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        
        const token = await user.getIdToken();
        try {
          const response = await fetch('/api/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userProfile = await response.json();
            setRole(userProfile.role || null);
            setDisplayName(userProfile.displayName || null); // Set the displayName
          } else {
            console.error("Failed to fetch user profile, signing out.");
            setRole(null);
            setDisplayName(null); // Clear the displayName
            auth.signOut();
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setRole(null);
          setDisplayName(null); // Clear the displayName
          auth.signOut();
        }
      } else {
        setUser(null);
        setRole(null);
        setDisplayName(null); // Clear the displayName
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    // Add displayName to the provider value
    <AuthContext.Provider value={{ user, role, displayName, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function ProtectedRoute({ children, requiredRole }: { children: ReactNode, requiredRole: string }) {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push(`/login?redirect=${pathname}`); 
            return;
        }

        if (role !== requiredRole) {
            router.push('/login');
            return;
        }

    }, [user, role, loading, router, requiredRole, pathname]);

    if (loading || !user || role !== requiredRole) {
        return (
             <div className="flex min-h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}