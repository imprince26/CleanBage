import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import api from '@/utils/api';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  bin: z.string().min(1, 'Please select a bin'),
  collector: z.string().min(1, 'Please select a collector'),
  scheduledDate: z.date({
    required_error: 'Please select a date',
  }),
  timeSlot: z.object({
    start: z.string().min(1, 'Start time is required'),
    end: z.string().min(1, 'End time is required'),
  }),
  priority: z.number().min(0).max(10).default(5),
  recurrence: z.enum(['none', 'daily', 'weekly', 'biweekly', 'monthly']).default('none'),
  recurrenceEndDate: z.date().optional().nullable(),
  notes: z.string().optional(),
  route: z.string().optional(),
});

const CreateSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [bins, setBins] = React.useState([]);
  const [collectors, setCollectors] = React.useState([]);
  const [routes, setRoutes] = React.useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: 5,
      recurrence: 'none',
      timeSlot: {
        start: '08:00',
        end: '12:00',
      },
      notes: '',
    },
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [binsResponse, collectorsResponse, routesResponse] = await Promise.all([
          api.get('/collections'),
          api.get('/users/', { params: { role: 'garbage_collector' } }),
          api.get('/routes'),
        ]);

        setBins(binsResponse.data.data);
        setCollectors(collectorsResponse.data.data);
        setRoutes(routesResponse.data.data);
      } catch (error) {
        toast.error('Error loading form data');
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post('/schedules', values);
      toast.success('Schedule created successfully');
      navigate('/admin/schedules');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating schedule');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Schedule</CardTitle>
          <CardDescription>
            Schedule a new waste collection assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bin Selection */}
                <FormField
                  control={form.control}
                  name="bin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bin</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a bin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bins.map((bin) => (
                            <SelectItem key={bin._id} value={bin._id}>
                              Bin #{bin.binId} - {bin.location.address.street}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Collector Selection */}
                <FormField
                  control={form.control}
                  name="collector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a collector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {collectors.map((collector) => (
                            <SelectItem key={collector._id} value={collector._id}>
                              {collector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Scheduled Date */}
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time Slot */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeSlot.start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeSlot.end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Priority */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Route */}
                <FormField
                  control={form.control}
                  name="route"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a route" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routes.map((route) => (
                            <SelectItem key={route._id} value={route._id}>
                              {route.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Recurrence */}
                <FormField
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recurrence" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Recurrence End Date (shown only if recurrence is not 'none') */}
                {form.watch('recurrence') !== 'none' && (
                  <FormField
                    control={form.control}
                    name="recurrenceEndDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Recurrence End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <= form.watch('scheduledDate') ||
                                date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes here..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/schedules')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Schedule
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSchedule;