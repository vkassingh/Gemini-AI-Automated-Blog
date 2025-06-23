
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ApiKeyManager = () => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [bloggerApiKey, setBloggerApiKey] = useState('');
  const [blogId, setBlogId] = useState('');
  const [isGeminiValid, setIsGeminiValid] = useState(false);
  const [isBloggerValid, setIsBloggerValid] = useState(false);

  useEffect(() => {
    // Load saved API keys
    const savedGemini = localStorage.getItem('geminiApiKey');
    const savedBlogger = localStorage.getItem('bloggerApiKey');
    const savedBlogId = localStorage.getItem('blogId');
    
    if (savedGemini) {
      setGeminiApiKey(savedGemini);
      setIsGeminiValid(true);
    }
    if (savedBlogger) {
      setBloggerApiKey(savedBlogger);
      setIsBloggerValid(true);
    }
    if (savedBlogId) {
      setBlogId(savedBlogId);
    }
  }, []);

  const testGeminiApi = async (apiKey: string) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Test message"
            }]
          }]
        }),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const saveGeminiKey = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid Gemini API key.",
        variant: "destructive",
      });
      return;
    }

    const isValid = await testGeminiApi(geminiApiKey);
    
    if (isValid) {
      localStorage.setItem('geminiApiKey', geminiApiKey);
      setIsGeminiValid(true);
      toast({
        title: "Success",
        description: "Gemini API key saved and verified.",
      });
    } else {
      setIsGeminiValid(false);
      toast({
        title: "Invalid API Key",
        description: "Could not verify Gemini API key. Please check and try again.",
        variant: "destructive",
      });
    }
  };

  const saveBloggerCredentials = () => {
    if (!bloggerApiKey.trim() || !blogId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both Blogger API key and Blog ID.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('bloggerApiKey', bloggerApiKey);
    localStorage.setItem('blogId', blogId);
    setIsBloggerValid(true);
    
    toast({
      title: "Success",
      description: "Blogger credentials saved successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <span>API Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure your API keys for content generation and blog publishing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gemini API Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="gemini-key">Gemini API Key</Label>
            <Badge variant={isGeminiValid ? "default" : "secondary"}>
              {isGeminiValid ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <X className="h-3 w-3 mr-1" />
                  Not Set
                </>
              )}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Input
              id="gemini-key"
              type="password"
              placeholder="Enter your Gemini API key"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
            />
            <Button onClick={saveGeminiKey} variant="outline">
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>
          </p>
        </div>

        {/* Blogger API Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="blogger-key">Blogger API Key</Label>
            <Badge variant={isBloggerValid ? "default" : "secondary"}>
              {isBloggerValid ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Configured
                </>
              ) : (
                <>
                  <X className="h-3 w-3 mr-1" />
                  Not Set
                </>
              )}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Input
              id="blogger-key"
              type="password"
              placeholder="Enter your Blogger API key"
              value={bloggerApiKey}
              onChange={(e) => setBloggerApiKey(e.target.value)}
            />
          </div>
          
          <Label htmlFor="blog-id">Blog ID</Label>
          <div className="flex space-x-2">
            <Input
              id="blog-id"
              placeholder="Enter your Blog ID"
              value={blogId}
              onChange={(e) => setBlogId(e.target.value)}
            />
            <Button onClick={saveBloggerCredentials} variant="outline">
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key from <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a> and find your Blog ID in Blogger settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;
