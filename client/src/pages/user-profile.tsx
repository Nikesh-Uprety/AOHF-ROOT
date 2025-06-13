import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  score: number;
  challengesSolved: number;
  totalChallenges: number;
  solvedChallenges: number;
  totalSubmissions: number;
  correctSubmissions: number;
  successRate: number;
  categoryProgress: Array<{
    category: string;
    solved: number;
    total: number;
    percentage: number;
  }>;
  solvedChallengesList: Array<{
    challengeId: number;
    challengeTitle: string;
    submittedAt: string;
  }>;
}

export default function UserProfile() {
  const [match, params] = useRoute("/user/:id");
  const userId = params?.id;

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile', userId],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-muted-foreground">The requested user profile could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">{profile.username}'s Profile</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
              Total Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.score.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-green-500" />
              Challenges Solved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.challengesSolved}</div>
            <p className="text-xs text-muted-foreground">
              out of {profile.totalChallenges} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {profile.correctSubmissions} / {profile.totalSubmissions} submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((profile.challengesSolved / profile.totalChallenges) * 100).toFixed(1)}%
            </div>
            <Progress 
              value={(profile.challengesSolved / profile.totalChallenges) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Category Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.categoryProgress.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium uppercase text-sm">{category.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.solved}/{category.total}
                  </span>
                </div>
                <Progress value={category.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {category.percentage.toFixed(1)}% completed
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Solves */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Solves
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.solvedChallengesList.length > 0 ? (
            <div className="space-y-3">
              {profile.solvedChallengesList
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .slice(0, 10)
                .map((solve) => (
                  <div key={`${solve.challengeId}-${solve.submittedAt}`} 
                       className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium">{solve.challengeTitle}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(solve.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No challenges solved yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}