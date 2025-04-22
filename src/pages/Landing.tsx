
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BookText, Sparkles, PenLine, FileText, Star } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-accent rounded-md p-1">
              <BookText className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">AI Notes</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link to="/features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  AI-Powered Notes for Effortless Productivity
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl">
                  Take smarter notes with advanced AI summarization, organize with tags, and access from anywhere.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button asChild size="lg" className="gap-2">
                    <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                      <PenLine className="h-4 w-4" />
                      {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg" 
                  alt="AI Notes App" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-muted/50 py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">Key Features</h2>
              <p className="text-muted-foreground mt-2">
                Why AI Notes is your perfect note-taking companion
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col">
                <div className="bg-accent/10 self-start p-2 rounded-lg mb-4">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">AI Summarization</h3>
                <p className="text-muted-foreground mt-2">
                  Transform long notes into concise summaries with our AI assistant.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col">
                <div className="bg-accent/10 self-start p-2 rounded-lg mb-4">
                  <PenLine className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Rich Editing</h3>
                <p className="text-muted-foreground mt-2">
                  Create beautiful notes with formatting, lists, and more.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col">
                <div className="bg-accent/10 self-start p-2 rounded-lg mb-4">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Organization</h3>
                <p className="text-muted-foreground mt-2">
                  Keep everything organized with tags and favorites for easy access.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Start taking smarter notes today</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Join thousands of users who have transformed their note-taking experience with AI Notes.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                <Star className="h-4 w-4" />
                {isAuthenticated ? "Go to Your Notes" : "Sign Up for Free"}
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <BookText className="h-5 w-5" />
              <span className="font-semibold">AI Notes</span>
            </div>
            <div className="text-center md:text-right text-sm text-muted-foreground">
              © 2025 AI Notes. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
