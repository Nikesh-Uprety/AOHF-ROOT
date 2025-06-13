import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings as SettingsIcon, User } from "lucide-react";
import type { User as UserType } from "../../../shared/schema";

export default function Settings() {
  const [newUsername, setNewUsername] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const updateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("PUT", "/api/user/username", { username });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update username");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Username updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setNewUsername("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUsernameUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim().length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }
    updateUsernameMutation.mutate(newUsername.trim());
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Please log in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">User Settings</h1>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Username</Label>
              <div className="p-2 bg-muted rounded border">
                {user.username}
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="p-2 bg-muted rounded border">
                {user.email}
              </div>
            </div>
            <div>
              <Label>Score</Label>
              <div className="p-2 bg-muted rounded border">
                {user.score?.toLocaleString() || 0} points
              </div>
            </div>
            <div>
              <Label>Challenges Solved</Label>
              <div className="p-2 bg-muted rounded border">
                {user.challengesSolved || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Username */}
      <Card>
        <CardHeader>
          <CardTitle>Change Username</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameUpdate} className="space-y-4">
            <div>
              <Label htmlFor="newUsername">New Username</Label>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                minLength={3}
                maxLength={20}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Username must be 3-20 characters long
              </p>
            </div>
            <Button
              type="submit"
              disabled={updateUsernameMutation.isPending || !newUsername.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {updateUsernameMutation.isPending ? "Updating..." : "Update Username"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}