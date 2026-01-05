import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Clock, Users, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContestInfo {
  id: string;
  start_date: string;
  end_date: string;
  first_prize: number;
  second_prize: number;
  third_prize: number;
  min_referrals: number;
  days_remaining: number;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  referral_count: number;
  rank: number;
}

export default function ReferralContestSection() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [contest, setContest] = useState<ContestInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userReferrals, setUserReferrals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestData();
  }, [user]);

  const fetchContestData = async () => {
    try {
      // Fetch active contest
      const { data: contestData } = await supabase
        .rpc('get_active_contest');
      
      if (contestData && contestData.length > 0) {
        setContest(contestData[0]);
      }

      // Fetch leaderboard
      const { data: leaderboardData } = await supabase
        .rpc('get_referral_leaderboard');
      
      if (leaderboardData) {
        setLeaderboard(leaderboardData);
        
        // Find user's position
        if (user) {
          const userEntry = leaderboardData.find((e: LeaderboardEntry) => e.user_id === user.id);
          if (userEntry) {
            setUserReferrals(userEntry.referral_count);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching contest data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30";
      default:
        return "bg-card/50 border-border/50";
    }
  };

  const getPrize = (rank: number) => {
    if (!contest) return 0;
    switch (rank) {
      case 1: return contest.first_prize;
      case 2: return contest.second_prize;
      case 3: return contest.third_prize;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">Cargando concurso...</div>
        </div>
      </section>
    );
  }

  if (!contest) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">No hay concurso activo en este momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Concurso Mensual</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            🏆 Concurso de Referidos
          </h2>
          <p className="text-muted-foreground">
            ¡Invita amigos y gana DOGE! Los 3 mejores referidores del mes se llevan premios.
          </p>
        </div>

        {/* Contest Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Time Remaining */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo restante</p>
                  <p className="text-2xl font-bold">{contest.days_remaining} días</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Min Referrals */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mínimo requerido</p>
                  <p className="text-2xl font-bold">{contest.min_referrals} referidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Referrals */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tus referidos</p>
                  <p className="text-2xl font-bold">{userReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prizes */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">🎁 Premios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">1er Lugar</p>
                <p className="text-2xl font-bold text-yellow-500">{contest.first_prize} DOGE</p>
              </div>
              <div className="p-4">
                <Medal className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">2do Lugar</p>
                <p className="text-2xl font-bold text-gray-400">{contest.second_prize} DOGE</p>
              </div>
              <div className="p-4">
                <Medal className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">3er Lugar</p>
                <p className="text-2xl font-bold text-amber-600">{contest.third_prize} DOGE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Clasificación Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aún no hay participantes.</p>
                <p className="text-sm">¡Sé el primero en referir amigos!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${getRankBg(entry.rank)} ${
                      user?.id === entry.user_id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <div>
                        <p className="font-semibold">
                          {entry.username || "Usuario Anónimo"}
                          {user?.id === entry.user_id && (
                            <Badge variant="secondary" className="ml-2 text-xs">Tú</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.referral_count} referidos
                        </p>
                      </div>
                    </div>
                    {entry.rank <= 3 && entry.referral_count >= contest.min_referrals && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        +{getPrize(entry.rank)} DOGE
                      </Badge>
                    )}
                    {entry.rank <= 3 && entry.referral_count < contest.min_referrals && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Mín. {contest.min_referrals} ref.
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rules */}
        <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border/50">
          <h4 className="font-semibold mb-2">📋 Reglas del Concurso</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Solo cuentan los referidos registrados durante el período del concurso.</li>
            <li>• Se requiere un mínimo de {contest.min_referrals} referidos para optar a premios.</li>
            <li>• Los referidos deben verificar su cuenta para ser contados.</li>
            <li>• Los premios se acreditarán automáticamente al finalizar el concurso.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
