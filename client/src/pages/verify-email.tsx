import { useEffect } from "react";
import { Link } from "wouter";
import TerminalWindow from "../components/terminal-window";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function VerifyEmail() {
  useEffect(() => {
    document.title = "Verify Email - Attack on Hash Function";
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto px-4 py-8">
        <TerminalWindow title="email_verification">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md bg-black border-green-400">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="h-16 w-16 text-green-400" />
                </div>
                <CardTitle className="text-green-400 text-2xl">
                  📧 Check Your Gmail
                </CardTitle>
                <CardDescription className="text-green-300">
                  We've sent a verification link to your email address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-green-400 font-semibold">Step 1: Check your inbox</p>
                      <p className="text-green-300 text-sm">
                        Look for an email from Attack on Hash Function CTF
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-green-400 font-semibold">Step 2: Click the verification link</p>
                      <p className="text-green-300 text-sm">
                        This will verify your email and activate your account
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-green-400 font-semibold">Step 3: Return to login</p>
                      <p className="text-green-300 text-sm">
                        Once verified, you can log in and start hacking!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-green-400 rounded p-4 bg-green-950 bg-opacity-20">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <p className="text-yellow-400 font-semibold text-sm">Important Notes:</p>
                  </div>
                  <ul className="text-green-300 text-sm space-y-1">
                    <li>• Check your spam/junk folder if you don't see the email</li>
                    <li>• The verification link expires in 24 hours</li>
                    <li>• You cannot log in until your email is verified</li>
                  </ul>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button 
                    asChild 
                    className="bg-green-600 hover:bg-green-700 text-black font-bold"
                  >
                    <Link href="/auth">
                      Return to Login
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-green-400 text-green-400 hover:bg-green-950"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}