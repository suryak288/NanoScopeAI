import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
            const res = await fetch('http://localhost:3001/api/user/me', {
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
    }, [token]);

    const handleUpgrade = async (planId: string) => {
        if (!token) return;
        setUpgrading(planId);
        try {
            const res = await fetch('http://localhost:3001/api/user/upgrade', {
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
                <p className="text-gray-400 max-w-2xl mx-auto">
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
                                isCurrent ? "border-brand-cyan shadow-[0_0_30px_rgba(6,182,212,0.2)] scale-105 z-10" : "border-white/5 hover:border-white/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-indigo/10"
                            )}
                        >
                            {isCurrent && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-indigo to-brand-cyan px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                                    Current Plan
                                </div>
                            )}

                            <div className="p-8 pb-0">
                                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6", isCurrent ? "bg-brand-cyan/10" : "bg-white/5")}>
                                    <plan.icon className={cn("w-7 h-7", isCurrent ? "text-brand-cyan" : "text-gray-400")} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                </div>
                                <p className="text-sm font-medium text-brand-purple mb-6">{plan.limitText}</p>
                            </div>

                            <div className="p-8 pt-0 flex flex-col flex-1">
                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                            <Check className="w-5 h-5 text-green-400 shrink-0" />
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
                                            ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
                                            : "bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:scale-[1.02]",
                                        plan.id === 'research' && !isCurrent ? "bg-gradient-to-r from-brand-indigo to-brand-cyan text-white border-0 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]" : ""
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
