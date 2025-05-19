
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarRange } from 'lucide-react';

interface ConsentLogsFilterBarProps {
  domains: string[];
  dateRange: [Date | undefined, Date | undefined];
  selectedDomain: string | null;
  selectedEventType: string | null;
  selectedRegion: string | null;
  onDateRangeChange: (range: [Date | undefined, Date | undefined]) => void;
  onDomainChange: (domain: string | null) => void;
  onEventTypeChange: (eventType: string | null) => void;
  onRegionChange: (region: string | null) => void;
}

const ConsentLogsFilterBar: React.FC<ConsentLogsFilterBarProps> = ({
  domains,
  dateRange,
  selectedDomain,
  selectedEventType,
  selectedRegion,
  onDateRangeChange,
  onDomainChange,
  onEventTypeChange,
  onRegionChange
}) => {
  const [startDate, endDate] = dateRange;
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Helper for calendar date selection
  const handleCalendarSelect = (date: Date | undefined) => {
    const [start, end] = dateRange;
    
    if (!start || (start && end)) {
      // If no start date is selected or both dates are selected, set the clicked date as start
      onDateRangeChange([date, undefined]);
    } else {
      // If only start date is selected
      if (date && date < start) {
        // If selected date is before start date, swap them
        onDateRangeChange([date, start]);
      } else {
        // Otherwise set it as end date
        onDateRangeChange([start, date]);
      }
      
      // Close the calendar after selecting both dates
      if (date) setIsCalendarOpen(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    onDateRangeChange([undefined, undefined]);
    onDomainChange(null);
    onEventTypeChange(null);
    onRegionChange(null);
  };

  // Format date range for display
  const dateRangeText = React.useMemo(() => {
    if (startDate && endDate) {
      return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    if (startDate) {
      return `From ${format(startDate, 'MMM d, yyyy')}`;
    }
    return "Select dates";
  }, [startDate, endDate]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Date Range Selector */}
      <div className="w-full md:w-auto">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-[300px] justify-start text-left font-normal">
              <CalendarRange className="mr-2 h-4 w-4" />
              <span>{dateRangeText}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: startDate,
                to: endDate,
              }}
              onSelect={(range) => {
                onDateRangeChange([range?.from, range?.to]);
              }}
              numberOfMonths={2}
              defaultMonth={startDate || new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Domain Filter */}
      <div className="w-full md:w-auto">
        <Select 
          value={selectedDomain || "all"} 
          onValueChange={(value) => onDomainChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {domains && domains.length > 0 ? (
              domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-domains" disabled>No domains available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Event Type Filter */}
      <div className="w-full md:w-auto">
        <Select 
          value={selectedEventType || "all"} 
          onValueChange={(value) => onEventTypeChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            <SelectItem value="accept">Accept</SelectItem>
            <SelectItem value="reject">Reject</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="ping">Ping</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Region Filter */}
      <div className="w-full md:w-auto">
        <Select 
          value={selectedRegion || "all"} 
          onValueChange={(value) => onRegionChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            <SelectItem value="eu">EU</SelectItem>
            <SelectItem value="us">US</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Filters Button */}
      <div className="w-full md:w-auto md:ml-auto">
        <Button 
          variant="outline" 
          onClick={handleResetFilters}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default ConsentLogsFilterBar;
