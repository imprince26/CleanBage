import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Settings,
  Clock,
  Info,
  AlertTriangle,
  Mail,
  ArrowLeft,
  RefreshCcw,
  Construction,
  Server
} from 'lucide-react';

const MaintenancePage = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 0,
    seconds: 0
  });

  const [progress, setProgress] = useState(0);
  const maintenanceInfo = {
    startTime: "10:00 AM GMT+5:30",
    expectedDuration: "2 hours",
    reason: "System upgrade and database optimization",
    status: "in_progress", // can be 'scheduled', 'in_progress', 'extended', 'completing'
    updates: [
      {
        time: "10:00 AM",
        message: "Maintenance window started - Database backup in progress"
      },
      {
        time: "10:30 AM",
        message: "System upgrade initiated - Core services temporarily offline"
      }
    ]
  };

  // Calculate countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          return prev;
        }

        let newHours = prev.hours;
        let newMinutes = prev.minutes;
        let newSeconds = prev.seconds - 1;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        return {
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update progress
  useEffect(() => {
    const totalSeconds = 2 * 60 * 60; // 2 hours in seconds
    const currentSeconds = (timeLeft.hours * 60 * 60) + (timeLeft.minutes * 60) + timeLeft.seconds;
    const progressPercent = ((totalSeconds - currentSeconds) / totalSeconds) * 100;
    setProgress(progressPercent);
  }, [timeLeft]);

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: { variant: "secondary", label: "Scheduled" },
      in_progress: { variant: "warning", label: "In Progress" },
      extended: { variant: "destructive", label: "Extended" },
      completing: { variant: "success", label: "Completing" }
    };
    return variants[status] || variants.scheduled;
  };

  const formatTime = (value) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <div className="container min-h-screen flex items-center justify-center py-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Main Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-fit p-4 rounded-full bg-yellow-50 dark:bg-yellow-900/20 mb-4">
              <Construction className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
            </div>
            <CardTitle className="text-3xl">System Maintenance</CardTitle>
            <CardDescription className="text-base mt-2">
              Our system is currently undergoing scheduled maintenance to improve your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status and Timer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-muted-foreground animate-pulse" />
                <div>
                  <p className="font-medium">System Status</p>
                  <Badge {...getStatusBadge(maintenanceInfo.status)}>
                    {getStatusBadge(maintenanceInfo.status).label}
                  </Badge>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Estimated Time Remaining</p>
                <p className="text-3xl font-bold font-mono">
                  {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Maintenance Info */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Started at {maintenanceInfo.startTime}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Expected duration: {maintenanceInfo.expectedDuration}
                  </p>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Maintenance Details</AlertTitle>
                <AlertDescription>
                  {maintenanceInfo.reason}
                </AlertDescription>
              </Alert>

              {/* Updates */}
              <div className="space-y-3">
                <h3 className="font-medium">Recent Updates</h3>
                <div className="space-y-2">
                  {maintenanceInfo.updates.map((update, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <RefreshCcw className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{update.time}</p>
                        <p className="text-sm text-muted-foreground">
                          {update.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Homepage
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <a href="mailto:support@cleanbag.com">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </a>
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Check Status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;