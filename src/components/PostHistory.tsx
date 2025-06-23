
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ExternalLink, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledTime?: string;
  publishedTime?: string;
  createdAt: string;
}

interface PostHistoryProps {
  posts: BlogPost[];
}

const PostHistory = ({ posts }: PostHistoryProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'scheduled':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Post History</span>
          </CardTitle>
          <CardDescription>
            Your generated and published posts will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No posts yet. Generate your first automated blog post!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Post History</span>
        </CardTitle>
        <CardDescription>
          Track all your automated blog posts and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium truncate max-w-md">{post.title}</h4>
                  <Badge variant={getStatusColor(post.status) as any}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(post.status)}
                      <span className="capitalize">{post.status}</span>
                    </div>
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span>Created: {new Date(post.createdAt).toLocaleString()}</span>
                  {post.publishedTime && (
                    <span className="ml-4">Published: {new Date(post.publishedTime).toLocaleString()}</span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {post.status === 'published' && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostHistory;
