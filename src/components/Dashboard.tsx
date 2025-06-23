
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Settings, BookOpen, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ApiKeyManager from './ApiKeyManager';
import ContentPreview from './ContentPreview';
import ScheduleManager from './ScheduleManager';
import PostHistory from './PostHistory';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledTime?: string;
  publishedTime?: string;
  createdAt: string;
}

const Dashboard = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [schedulerActive, setSchedulerActive] = useState(false);

  // Load posts from localStorage on component mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }

    // Check if scheduler is active
    const schedulerStatus = localStorage.getItem('schedulerActive');
    if (schedulerStatus === 'true') {
      setSchedulerActive(true);
      initializeScheduler();
    }
  }, []);

  // Save posts to localStorage whenever posts change
  useEffect(() => {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
  }, [posts]);

  const initializeScheduler = () => {
    // Set up daily scheduling at 9 AM
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(9, 0, 0, 0);
    
    // If it's already past 9 AM today, schedule for tomorrow
    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilScheduled = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
      generateAndPublishPost();
      // Set up recurring daily execution
      setInterval(generateAndPublishPost, 24 * 60 * 60 * 1000);
    }, timeUntilScheduled);

    console.log(`Next automated post scheduled for: ${scheduledTime.toLocaleString()}`);
  };

  const generateContent = async (topic?: string) => {
    const geminiApiKey = localStorage.getItem('geminiApiKey');
    if (!geminiApiKey) {
      toast({
        title: "Missing API Key",
        description: "Please configure your Gemini API key first.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const prompt = topic || "Create an engaging blog post about current technology trends, including practical insights and actionable advice for readers.";
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Extract title from the first line or create one
      const lines = content.split('\n').filter(line => line.trim());
      const title = lines[0].replace(/^#+\s*/, '') || "Generated Blog Post";
      
      return { title, content };
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  };

  const publishToBlogger = async (title: string, content: string) => {
    const bloggerApiKey = localStorage.getItem('bloggerApiKey');
    const blogId = localStorage.getItem('blogId');
    
    if (!bloggerApiKey || !blogId) {
      throw new Error('Missing Blogger API credentials');
    }

    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?key=${bloggerApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bloggerApiKey}`,
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to publish to Blogger');
    }

    return await response.json();
  };

  const generateAndPublishPost = async () => {
    setIsGenerating(true);
    
    try {
      const generatedContent = await generateContent();
      if (!generatedContent) return;

      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: generatedContent.title,
        content: generatedContent.content,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };

      // Try to publish immediately
      try {
        await publishToBlogger(newPost.title, newPost.content);
        newPost.status = 'published';
        newPost.publishedTime = new Date().toISOString();
        
        toast({
          title: "Post Published",
          description: `"${newPost.title}" has been successfully published to your blog.`,
        });
      } catch (publishError) {
        newPost.status = 'failed';
        console.error('Publishing failed:', publishError);
        
        toast({
          title: "Publishing Failed",
          description: "Content generated but failed to publish. Check your Blogger API settings.",
          variant: "destructive",
        });
      }

      setPosts(prev => [newPost, ...prev]);
      setCurrentPost(newPost);
    } catch (error) {
      console.error('Error in automated posting:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Check your API settings.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleScheduler = () => {
    const newStatus = !schedulerActive;
    setSchedulerActive(newStatus);
    localStorage.setItem('schedulerActive', newStatus.toString());
    
    if (newStatus) {
      initializeScheduler();
      toast({
        title: "Scheduler Activated",
        description: "Daily automated posting is now enabled for 9:00 AM.",
      });
    } else {
      toast({
        title: "Scheduler Deactivated",
        description: "Automated posting has been disabled.",
      });
    }
  };

  const publishedCount = posts.filter(p => p.status === 'published').length;
  const failedCount = posts.filter(p => p.status === 'failed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            AutoBlog Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Automated blog posting with AI-generated content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{posts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Scheduler</p>
                  <Badge variant={schedulerActive ? "default" : "secondary"}>
                    {schedulerActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>
                Generate and publish content manually or manage automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateAndPublishPost} 
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? "Generating..." : "Generate & Publish Now"}
              </Button>
              
              <Button 
                onClick={toggleScheduler}
                variant={schedulerActive ? "destructive" : "default"}
                className="w-full"
                size="lg"
              >
                {schedulerActive ? "Disable" : "Enable"} Daily Automation
              </Button>
              
              {schedulerActive && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Next post scheduled for tomorrow at 9:00 AM
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <ApiKeyManager />
        </div>

        {/* Content Preview */}
        {currentPost && (
          <ContentPreview post={currentPost} />
        )}

        {/* Post History */}
        <PostHistory posts={posts} />
      </div>
    </div>
  );
};

export default Dashboard;
