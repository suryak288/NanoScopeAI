import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { Check, Star, Shield, Zap, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const plans = [
    {
        id: 'trial',
        name: 'Trial Plan',
        price: 'Free',
        limit: 100,
        limitText: '100 analyses',
        icon: Star,
        features: [
            'Basic image analysis',
            'Standard processing speed',
            'Community support'
        ]
    },
    {
        id: 'student',
        name: 'Student Plan',
        price: '₹100',
        limit: 1000,
        limitText: '1000 analyses',
        icon: Zap,
        features: [
            'Advanced AI models',
            'Faster processing speed',
            'Email support',
            'Data export'
        ]
    },
    {
        id: 'research',
        name: 'Research Plan',
        price: '₹300',
        limit: null,
        limitText: 'Unlimited analyses',
        icon: Shield,
        features: [
            'Premium AI models',
            'Priority processing',
            '24/7 dedicated support',
            'Bulk analysis API',
            'Custom insight reports'
        ]
    }
];

export default function Packages() {
    const { token } = useAuth();
    const [userPlan, setUserPlan] = useState<string>('trial');
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${API_URL}/api/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUserPlan(data.data.plan || 'trial');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleUpgrade = async (planId: string) => {
        if (!token) return;
        setUpgrading(planId);
        try {
            const res = await fetch(`${API_URL}/api/user/upgrade`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan: planId })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully upgraded to ${planId.toUpperCase()} plan!`);
                await fetchUser();
            } else {
                alert('Failed to upgrade plan: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while upgrading.');
        } finally {
            setUpgrading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Choose Your Plan</h2>
                <p className="text-emerald-50 font-medium drop-shadow-sm max-w-2xl mx-auto">
                    Select the package that best fits your scientific analysis workflow. Upgrade at any time.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const isCurrent = userPlan === plan.id;
                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                "glass-panel flex flex-col relative transition-all duration-300 border",
                                isCurrent ? "border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105 z-10" : "border-white/10 hover:border-white/30 hover:-translate-y-2 hover:shadow-2xl"
                            )}
                        >
                            {isCurrent && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-lg border border-white/30">
                                    Current Plan
                                </div>
                            )}

                            <div className="p-8 pb-0">
                                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-inner border border-white/10", isCurrent ? "bg-white/20" : "bg-white/5")}>
                                    <plan.icon className={cn("w-7 h-7", isCurrent ? "text-white drop-shadow-md" : "text-white/60")} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                </div>
                                <p className="text-sm font-semibold text-emerald-100 mb-6">{plan.limitText}</p>
                            </div>

                            <div className="p-8 pt-0 flex flex-col flex-1">
                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-white/90 font-medium">
                                            <Check className="w-5 h-5 text-emerald-400 shrink-0 drop-shadow-sm" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={isCurrent || upgrading !== null}
                                    className={cn(
                                        "w-full py-4 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                                        isCurrent
                                            ? "bg-white/10 text-white/50 cursor-not-allowed border border-white/20 box-border"
                                            : "bg-white text-emerald-900 hover:bg-emerald-50 shadow-xl hover:scale-[1.02]",
                                        plan.id === 'research' && !isCurrent ? "bg-[var(--color-button-primary)] text-white border border-white/30 hover:bg-[var(--color-button-hover)] shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]" : ""
                                    )}
                                >
                                    {upgrading === plan.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        isCurrent ? 'Current Plan' : 'Upgrade Plan'
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
