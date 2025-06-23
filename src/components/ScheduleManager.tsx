
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ScheduleManager = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [frequency, setFrequency] = useState('daily');

  const handleToggleSchedule = (enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('scheduleEnabled', enabled.toString());
    
    if (enabled) {
      toast({
        title: "Schedule Enabled",
        description: `Automated posting scheduled for ${scheduledTime} ${frequency}.`,
      });
    } else {
      toast({
        title: "Schedule Disabled",
        description: "Automated posting has been turned off.",
      });
    }
  };

  const handleTimeChange = (time: string) => {
    setScheduledTime(time);
    localStorage.setItem('scheduledTime', time);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Schedule Settings</span>
        </CardTitle>
        <CardDescription>
          Configure when your blog posts should be automatically published
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Automated Posting</Label>
            <p className="text-sm text-muted-foreground">
              Automatically generate and publish blog posts
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggleSchedule}
          />
        </div>

        {isEnabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="time">Publishing Time</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => handleTimeChange(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Next Scheduled Post</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Tomorrow at {scheduledTime}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleManager;
