import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Gift, Star, Crown, Sparkles, ShoppingBag, Trophy, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RewardData {
  points: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  totalSpent: number;
  ordersCount: number;
}

export default function RewardsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [rewards, setRewards] = useState<RewardData>({
    points: 0,
    tier: "bronze",
    totalSpent: 0,
    ordersCount: 0,
  });

  useEffect(() => {
    // Load rewards from localStorage
    const saved = localStorage.getItem("rewards");
    if (saved) {
      setRewards(JSON.parse(saved));
    }
  }, []);

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case "bronze":
        return { color: "text-orange-600", bg: "bg-orange-500/10", next: "silver", pointsNeeded: 500 };
      case "silver":
        return { color: "text-gray-500", bg: "bg-gray-500/10", next: "gold", pointsNeeded: 2000 };
      case "gold":
        return { color: "text-yellow-600", bg: "bg-yellow-500/10", next: "platinum", pointsNeeded: 5000 };
      case "platinum":
        return { color: "text-purple-600", bg: "bg-purple-500/10", next: null, pointsNeeded: null };
      default:
        return { color: "text-orange-600", bg: "bg-orange-500/10", next: "silver", pointsNeeded: 500 };
    }
  };

  const tierInfo = getTierInfo(rewards.tier);
  const progress = tierInfo.pointsNeeded ? (rewards.points / tierInfo.pointsNeeded) * 100 : 100;

  const availableRewards = [
    { id: 1, name: "₹100 Off", points: 100, icon: Gift },
    { id: 2, name: "₹250 Off", points: 250, icon: Gift },
    { id: 3, name: "Free Shipping", points: 150, icon: ShoppingBag },
    { id: 4, name: "₹500 Off", points: 500, icon: Crown },
    { id: 5, name: "Exclusive Access", points: 1000, icon: Star },
  ];

  const handleRedeem = (reward: typeof availableRewards[0]) => {
    if (rewards.points >= reward.points) {
      const updated = { ...rewards, points: rewards.points - reward.points };
      setRewards(updated);
      localStorage.setItem("rewards", JSON.stringify(updated));
      toast({
        title: "Reward Redeemed! 🎉",
        description: `You've redeemed ${reward.name}. Check your email for the coupon code.`,
      });
    } else {
      toast({
        title: "Not Enough Points",
        description: `You need ${reward.points - rewards.points} more points to redeem this reward.`,
        variant: "destructive",
      });
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen py-12 md:py-20 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover-elevate">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-light">My Rewards</h1>
            <p className="text-muted-foreground">Earn points and unlock exclusive benefits</p>
          </div>
        </div>

        {/* Points Overview */}
        <Card className="mb-8 overflow-hidden">
          <div className={`${tierInfo.bg} p-8`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className={`h-6 w-6 ${tierInfo.color}`} />
                  <span className={`font-medium capitalize ${tierInfo.color}`}>{rewards.tier} Member</span>
                </div>
                <div className="text-4xl font-bold">{rewards.points}</div>
                <div className="text-muted-foreground">Available Points</div>
              </div>
              <div className="text-right">
                <Sparkles className={`h-16 w-16 ${tierInfo.color} opacity-50`} />
              </div>
            </div>
          </div>
          {tierInfo.next && (
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress to {tierInfo.next}</span>
                <span className="text-sm font-medium">{rewards.points} / {tierInfo.pointsNeeded}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Earn {tierInfo.pointsNeeded! - rewards.points} more points to reach {tierInfo.next} tier
              </p>
            </CardContent>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <div className="text-2xl font-bold">{rewards.ordersCount}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold">₹{rewards.totalSpent}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* How to Earn */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <span>Every ₹100 spent</span>
                <span className="font-medium text-primary">+10 points</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <span>Write a product review</span>
                <span className="font-medium text-primary">+25 points</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <span>Refer a friend</span>
                <span className="font-medium text-primary">+100 points</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <span>Birthday bonus</span>
                <span className="font-medium text-primary">+200 points</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Redeem Rewards
            </CardTitle>
            <CardDescription>Use your points for exclusive discounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <reward.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{reward.name}</p>
                      <p className="text-sm text-muted-foreground">{reward.points} points</p>
                    </div>
                  </div>
                  <Button
                    variant={rewards.points >= reward.points ? "default" : "outline"}
                    disabled={rewards.points < reward.points}
                    onClick={() => handleRedeem(reward)}
                    className="hover-elevate"
                  >
                    Redeem
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
