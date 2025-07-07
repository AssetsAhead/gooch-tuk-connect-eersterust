import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Award, Heart, Shield, Zap } from "lucide-react";

interface ReputationSystemProps {
  userType: "driver" | "passenger";
  currentPoints: number;
  currentLevel: number;
  badges: string[];
}

export const ReputationSystem = ({ userType, currentPoints, currentLevel, badges }: ReputationSystemProps) => {
  const levels = [
    { name: "Rookie", min: 0, max: 100, color: "text-muted-foreground", icon: Star },
    { name: "Helper", min: 100, max: 250, color: "text-tuk-blue", icon: Heart },
    { name: "Guardian", min: 250, max: 500, color: "text-success", icon: Shield },
    { name: "Champion", min: 500, max: 1000, color: "text-warning", icon: Trophy },
    { name: "Legend", min: 1000, max: 9999, color: "text-primary", icon: Award }
  ];

  const currentLevelData = levels[currentLevel] || levels[0];
  const nextLevelData = levels[currentLevel + 1];
  const progressToNext = nextLevelData ? 
    ((currentPoints - currentLevelData.min) / (nextLevelData.min - currentLevelData.min)) * 100 : 100;

  const weeklyLeaderboard = [
    { name: "Sipho M.", points: 1250, level: "Legend", badge: "🏆" },
    { name: "Nomsa D.", points: 890, level: "Champion", badge: "⭐" },
    { name: "Thabo N.", points: 650, level: "Guardian", badge: "🛡️" },
    { name: "Sarah K.", points: 480, level: "Helper", badge: "❤️" },
    { name: "You", points: currentPoints, level: currentLevelData.name, badge: "🚀" }
  ].sort((a, b) => b.points - a.points);

  const availableBadges = [
    { name: "Lost & Found Hero", icon: "🔍", description: "Returned 5+ lost items", earned: badges.includes("lost_found") },
    { name: "Safety Champion", icon: "🛡️", description: "Reported 10+ safety issues", earned: badges.includes("safety") },
    { name: "Community Guardian", icon: "👮", description: "Helped during emergencies", earned: badges.includes("guardian") },
    { name: "Elder Helper", icon: "👴", description: "Assisted 50+ elderly passengers", earned: badges.includes("elder") },
    { name: "Crime Fighter", icon: "🚨", description: "Prevented crime incidents", earned: badges.includes("crime_fighter") },
    { name: "Perfect Week", icon: "💯", description: "7 days without complaints", earned: badges.includes("perfect_week") }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Status */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <currentLevelData.icon className={`h-6 w-6 mr-2 ${currentLevelData.color}`} />
            Your Reputation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${currentLevelData.color}`}>
              {currentPoints}
            </div>
            <div className="text-lg font-medium">{currentLevelData.name}</div>
            <p className="text-sm text-muted-foreground">Community Points</p>
          </div>

          {nextLevelData && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {nextLevelData.name}</span>
                <span className="font-medium">{Math.round(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">
                {nextLevelData.min - currentPoints} points to next level
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="text-xl font-bold text-success">4.8</div>
              <p className="text-xs text-muted-foreground">Star Rating</p>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-lg">
              <div className="text-xl font-bold text-warning">#{weeklyLeaderboard.findIndex(u => u.name === "You") + 1}</div>
              <p className="text-xs text-muted-foreground">Weekly Rank</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-6 w-6 mr-2 text-warning" />
            Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {availableBadges.map((badge) => (
              <div 
                key={badge.name}
                className={`p-3 rounded-lg border text-center ${
                  badge.earned 
                    ? "bg-success/10 border-success/20" 
                    : "bg-muted/10 border-muted/20 opacity-60"
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium">{badge.name}</div>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                {badge.earned && (
                  <Badge className="bg-success text-white text-xs mt-1">Earned</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Leaderboard */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-warning" />
            🔥 Weekly Community Champions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyLeaderboard.slice(0, 5).map((user, index) => (
              <div 
                key={user.name}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.name === "You" ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${index === 0 ? "animate-pulse" : ""}`}>
                    {index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : user.badge}
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {user.name}
                      {user.name === "You" && <Badge className="ml-2 bg-primary text-white text-xs">You</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{user.points}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <Zap className="h-4 w-4 text-warning" />
              <span className="font-medium">Weekly Challenge:</span>
              <span className="text-sm">Help 3 elderly passengers - Bonus 100 points!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};