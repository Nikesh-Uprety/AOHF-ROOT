import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, Edit, Trash2, Users, Trophy, Target, Network, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import TerminalWindow from "@/components/terminal-window";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Challenge, User } from "../../../shared/schema";

const asciiWarning = `
⚠️  RESTRICTED AREA  ⚠️
╔═══════════════════════════════════════╗
║  AUTHORIZED PERSONNEL ONLY            ║
║  UNAUTHORIZED ACCESS IS PROHIBITED    ║
║  ALL ACTIVITIES ARE LOGGED            ║
╚═══════════════════════════════════════╝
`;

interface ChallengeFormData {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  flag: string;
  category: string;
  challengeUrl: string;
  driveAttachment: string;
  author: string;
}

const FIXED_CATEGORIES = [
  "WEB",
  "CRYPTO", 
  "REVERSE",
  "PWNING",
  "FORENSICS",
  "NETWORK",
  "MISC"
];

export default function Admin() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false
  });
  const [challengeForm, setChallengeForm] = useState<ChallengeFormData>({
    title: "",
    description: "",
    difficulty: "EASY",
    points: 100,
    flag: "",
    category: "WEB",
    challengeUrl: "",
    driveAttachment: "",
    author: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: challenges = [] } = useQuery<Challenge[]>({
    queryKey: ["/api/admin/challenges"],
    enabled: !!user?.isAdmin,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data: ChallengeFormData) => {
      const transformedData = {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        points: data.points,
        flag: data.flag,
        category: data.category,
        attachment: data.challengeUrl,
        downloadUrl: data.driveAttachment,
        author: data.author
      };
      const response = await apiRequest("POST", "/api/admin/challenges", transformedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Challenge Created",
        description: "New challenge has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create challenge.",
        variant: "destructive",
      });
    },
  });

  const updateChallengeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ChallengeFormData }) => {
      const transformedData = {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        points: data.points,
        flag: data.flag,
        category: data.category,
        attachment: data.challengeUrl,
        downloadUrl: data.driveAttachment,
        author: data.author
      };
      const response = await apiRequest("PUT", `/api/admin/challenges/${id}`, transformedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      setEditingChallenge(null);
      resetForm();
      toast({
        title: "Challenge Updated",
        description: "Challenge has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update challenge.",
        variant: "destructive",
      });
    },
  });

  const deleteChallengeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/challenges/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({
        title: "Challenge Deleted",
        description: "Challenge has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete challenge.",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsUserDialogOpen(false);
      resetUserForm();
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      resetUserForm();
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setChallengeForm({
      title: "",
      description: "",
      difficulty: "EASY",
      points: 100,
      flag: "",
      category: "WEB",
      challengeUrl: "",
      driveAttachment: "",
      author: ""
    });
  };

  const resetUserForm = () => {
    setUserForm({
      username: "",
      email: "",
      password: "",
      isAdmin: false
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await response.json();
      
      if (data.user.isAdmin) {
        localStorage.setItem("sessionId", data.sessionId);
        toast({
          title: "Access Granted",
          description: "Welcome, Administrator.",
        });
        // Refresh page to update auth state
        window.location.reload();
      } else {
        toast({
          title: "Access Denied",
          description: "Administrator privileges required.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials or insufficient privileges.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChallenge) {
      updateChallengeMutation.mutate({ id: editingChallenge.id, data: challengeForm });
    } else {
      createChallengeMutation.mutate(challengeForm);
    }
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setChallengeForm({
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty as "EASY" | "MEDIUM" | "HARD",
      points: challenge.points,
      flag: challenge.flag,
      category: challenge.category,
      challengeUrl: challenge.attachment || "",
      driveAttachment: challenge.downloadUrl || "",
      author: challenge.author || ""
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteChallenge = (id: number) => {
    if (confirm("Are you sure you want to delete this challenge?")) {
      deleteChallengeMutation.mutate(id);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: userForm });
    } else {
      createUserMutation.mutate(userForm);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: "",
      isAdmin: user.isAdmin || false
    });
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  if (user?.isAdmin) {
    return (
      <section className="min-h-screen p-4">
        <div className="container mx-auto max-w-6xl">
          <TerminalWindow title="admin@ctf-platform:~">
            <div className="mb-6">
              <div className="text-sm mb-4">
                <span className="text-primary">root@ctf:~$</span>{" "}
                <span className="text-foreground">sudo access admin_panel</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Administration Panel</h2>
              <p className="text-muted-foreground">Welcome, {user.username}</p>
            </div>
            
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{users.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{challenges.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Top Score</CardTitle>
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {Math.max(...users.map(u => u.score || 0), 0)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Challenge Management</h3>
                  <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                    setIsCreateDialogOpen(open);
                    if (!open) {
                      setEditingChallenge(null);
                      resetForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Challenge
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="pb-6">
                        <DialogTitle className="text-2xl font-bold text-primary">
                          {editingChallenge ? "Edit Challenge" : "Create New Challenge"}
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                          {editingChallenge ? "Modify the challenge details below." : "Fill in the details to create a new challenge."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[65vh] overflow-y-auto pr-2">
                        <form onSubmit={handleCreateChallenge} className="space-y-6 p-6 bg-card/50 rounded-lg border">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                              <div>
                                <Label htmlFor="title" className="text-sm font-medium mb-2 block">Challenge Title</Label>
                                <Input
                                  id="title"
                                  value={challengeForm.title}
                                  onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                                  className="h-11"
                                  placeholder="Enter challenge title"
                                  required
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="description" className="text-sm font-medium mb-2 block">Description</Label>
                                <Textarea
                                  id="description"
                                  value={challengeForm.description}
                                  onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                                  className="min-h-[120px] resize-y"
                                  placeholder="Enter challenge description. Use \n for line breaks."
                                  required
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="difficulty" className="text-sm font-medium mb-2 block">Difficulty</Label>
                                  <Select value={challengeForm.difficulty} onValueChange={(value: "EASY" | "MEDIUM" | "HARD") => setChallengeForm({...challengeForm, difficulty: value})}>
                                    <SelectTrigger className="h-11">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="EASY">Easy</SelectItem>
                                      <SelectItem value="MEDIUM">Medium</SelectItem>
                                      <SelectItem value="HARD">Hard</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="points" className="text-sm font-medium mb-2 block">Points</Label>
                                  <Input
                                    id="points"
                                    type="number"
                                    value={challengeForm.points}
                                    onChange={(e) => setChallengeForm({...challengeForm, points: parseInt(e.target.value)})}
                                    className="h-11"
                                    placeholder="100"
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="category" className="text-sm font-medium mb-2 block">Category</Label>
                                <Select value={challengeForm.category} onValueChange={(value) => setChallengeForm({...challengeForm, category: value})}>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FIXED_CATEGORIES.map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-6">
                              <div>
                                <Label htmlFor="challengeUrl" className="text-sm font-medium mb-2 block">Challenge URL</Label>
                                <Input
                                  id="challengeUrl"
                                  value={challengeForm.challengeUrl}
                                  onChange={(e) => setChallengeForm({...challengeForm, challengeUrl: e.target.value})}
                                  className="h-11"
                                  placeholder="https://ctf.example.com/challenge"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Optional: Link to external challenge site</p>
                              </div>
                              
                              <div>
                                <Label htmlFor="driveAttachment" className="text-sm font-medium mb-2 block">Attachment URL</Label>
                                <Input
                                  id="driveAttachment"
                                  value={challengeForm.driveAttachment}
                                  onChange={(e) => setChallengeForm({...challengeForm, driveAttachment: e.target.value})}
                                  className="h-11"
                                  placeholder="https://drive.google.com/file/d/xxx"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Optional: Google Drive or external file link</p>
                              </div>
                              
                              <div>
                                <Label htmlFor="author" className="text-sm font-medium mb-2 block">Author</Label>
                                <Input
                                  id="author"
                                  value={challengeForm.author}
                                  onChange={(e) => setChallengeForm({...challengeForm, author: e.target.value})}
                                  className="h-11"
                                  placeholder="Challenge author name"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Optional: Author or creator name</p>
                              </div>
                              
                              <div>
                                <Label htmlFor="flag" className="text-sm font-medium mb-2 block">Flag</Label>
                                <Input
                                  id="flag"
                                  value={challengeForm.flag}
                                  onChange={(e) => setChallengeForm({...challengeForm, flag: e.target.value})}
                                  className="h-11 font-mono"
                                  placeholder="CTF{example_flag}"
                                  required
                                />
                                <p className="text-xs text-muted-foreground mt-1">The correct flag that users must submit</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Single column for full-width elements */}
                          <div className="col-span-full pt-4 border-t border-border/50">
                            <div className="flex gap-4 pt-6">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                                className="flex-1 h-11"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={createChallengeMutation.isPending || updateChallengeMutation.isPending}
                                className="flex-1 h-11 bg-primary hover:bg-primary/90"
                              >
                                {(createChallengeMutation.isPending || updateChallengeMutation.isPending) 
                                  ? "Saving..." 
                                  : editingChallenge ? "Update Challenge" : "Create Challenge"}
                              </Button>
                            </div>
                          </div>
                      </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant={selectedCategory === "ALL" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("ALL")}
                  >
                    All Categories
                  </Button>
                  {FIXED_CATEGORIES.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                
                <div className="grid gap-4">
                  {challenges
                    .filter(challenge => selectedCategory === "ALL" || challenge.category === selectedCategory)
                    .map((challenge) => {
                    const maxDescriptionLength = 120;
                    const truncatedDescription = challenge.description.length > maxDescriptionLength
                      ? challenge.description.substring(0, maxDescriptionLength) + "..."
                      : challenge.description;
                    
                    return (
                      <Card key={challenge.id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-primary">{challenge.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                {truncatedDescription}
                              </p>
                              <div className="flex gap-4 mt-2 text-xs">
                                <span className="text-primary">Category: {challenge.category}</span>
                                <span className="text-primary">Difficulty: {challenge.difficulty}</span>
                                <span className="text-primary">Points: {challenge.points}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Flag: <span className="font-mono">{challenge.flag}</span>
                              </div>
                              {(challenge.attachment || challenge.downloadUrl) && (
                                <div className="flex gap-2 mt-2">
                                  {challenge.attachment && (
                                    <a 
                                      href={challenge.attachment} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                      <Network className="w-3 h-3" />
                                      Challenge Site
                                    </a>
                                  )}
                                  {challenge.downloadUrl && (
                                    <a 
                                      href={challenge.downloadUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                      <Download className="w-3 h-3" />
                                      Download
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditChallenge(challenge)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-destructive"
                                onClick={() => handleDeleteChallenge(challenge.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">User Management</h3>
                  <Dialog open={isUserDialogOpen} onOpenChange={(open) => {
                    setIsUserDialogOpen(open);
                    if (!open) {
                      setEditingUser(null);
                      resetUserForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader className="pb-6">
                        <DialogTitle className="text-2xl font-bold text-primary">
                          {editingUser ? "Edit User" : "Create New User"}
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                          {editingUser ? "Modify user account details." : "Add a new user to the platform."}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateUser} className="space-y-6 p-6 bg-card/50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="username" className="text-sm font-medium mb-2 block">Username</Label>
                            <Input
                              id="username"
                              value={userForm.username}
                              onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                              className="h-11"
                              placeholder="Enter username"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={userForm.email}
                              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                              className="h-11"
                              placeholder="user@example.com"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="password" className="text-sm font-medium mb-2 block">
                            {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={userForm.password}
                            onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                            className="h-11"
                            placeholder="Enter secure password"
                            required={!editingUser}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {editingUser ? "Leave blank to keep current password" : "Minimum 8 characters recommended"}
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t border-border/50">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="isAdmin"
                              checked={userForm.isAdmin}
                              onChange={(e) => setUserForm({...userForm, isAdmin: e.target.checked})}
                              className="w-4 h-4 rounded border-border"
                            />
                            <Label htmlFor="isAdmin" className="text-sm font-medium">
                              Grant admin privileges
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ml-7">
                            Admin users can manage challenges, users, and platform settings
                          </p>
                        </div>
                        
                        <div className="flex gap-4 pt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsUserDialogOpen(false)}
                            className="flex-1 h-11"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createUserMutation.isPending || updateUserMutation.isPending}
                            className="flex-1 h-11 bg-primary hover:bg-primary/90"
                          >
                            {(createUserMutation.isPending || updateUserMutation.isPending) 
                              ? "Saving..." 
                              : editingUser ? "Update User" : "Create User"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="grid gap-4">
                  {users.filter(user => !user.isAdmin).map((user) => (
                    <Card key={user.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-primary">{user.username}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-primary">{user.score || 0} points</div>
                              <div className="text-xs text-muted-foreground">
                                {user.challengesSolved || 0} challenges solved
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <h3 className="text-xl font-semibold">Platform Analytics</h3>
                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 CTF Competitors (Points Distribution)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex items-end justify-center gap-2 p-4">
                      {users.filter(u => !u.isAdmin).slice(0, 10).map((user, index) => {
                        const maxScore = Math.max(...users.filter(u => !u.isAdmin).map(u => u.score || 0), 1);
                        const height = ((user.score || 0) / maxScore) * 300;
                        const colors = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];
                        const color = colors[Math.floor(index / 2)] || '#064e3b';
                        
                        return (
                          <div key={user.id} className="flex flex-col items-center">
                            <div className="text-xs text-primary mb-1 font-semibold">
                              {user.score || 0}
                            </div>
                            <div
                              className="bg-primary rounded-t-sm transition-all duration-1000 ease-out"
                              style={{ 
                                height: `${Math.max(height, 10)}px`, 
                                width: '30px',
                                backgroundColor: color
                              }}
                            />
                            <div className="text-xs text-center mt-2 max-w-[40px] transform -rotate-45 origin-center">
                              {user.username}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TerminalWindow>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        <TerminalWindow title="admin@ctf-platform:~">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-sm mb-4">
                <span className="text-primary">root@ctf:~$</span>{" "}
                <span className="text-foreground">sudo access admin_panel</span>
              </div>
            </div>
            
            {/* Error Display */}
            <motion.div
              className="terminal-window rounded-lg p-8 mb-8 bg-destructive/10 border-destructive"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-6xl font-bold text-destructive mb-4">404</div>
              <h2 className="text-2xl font-bold text-destructive mb-4">ACCESS DENIED</h2>
              <p className="text-muted-foreground mb-6">You do not have sufficient privileges to access this area.</p>
              
              <pre className="text-destructive text-xs mb-6 font-mono whitespace-pre">
                {asciiWarning}
              </pre>
            </motion.div>
            
            {/* Login Form */}
            <motion.div
              className="terminal-window rounded-lg p-6 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Administrator Login
              </h3>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="block text-sm font-medium mb-2">
                    Username
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">$</span>
                    <Input
                      id="username"
                      type="text"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="pl-8 bg-secondary border-border text-primary font-mono focus:border-primary"
                      placeholder="admin"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-sm">#</span>
                    <Input
                      id="password"
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="pl-8 bg-secondary border-border text-primary font-mono focus:border-primary"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 animate-pulse-green"
                >
                  {isSubmitting ? "AUTHENTICATING..." : "AUTHENTICATE"}
                </Button>
              </form>
              
              <div className="mt-4 text-xs text-muted-foreground text-center">
                <p>Attempting unauthorized access will result in IP logging and possible prosecution.</p>
                <p className="mt-2 text-primary">Demo: admin / admin</p>
              </div>
            </motion.div>
          </div>
        </TerminalWindow>
      </div>
    </section>
  );
}