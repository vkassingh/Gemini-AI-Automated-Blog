
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledTime?: string;
  publishedTime?: string;
  createdAt: string;
}

interface ContentPreviewProps {
  post: BlogPost;
}

const ContentPreview = ({ post }: ContentPreviewProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Latest Content</span>
        </CardTitle>
        <CardDescription>
          Preview of the most recently generated content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <Badge variant={getStatusColor(post.status) as any}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(post.status)}
              <span className="capitalize">{post.status}</span>
            </div>
          </Badge>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-3 text-sm leading-relaxed">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Created: {new Date(post.createdAt).toLocaleString()}</span>
          {post.publishedTime && (
            <span>Published: {new Date(post.publishedTime).toLocaleString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentPreview;
