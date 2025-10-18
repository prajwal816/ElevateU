import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";

const events = [
  {
    id: 1,
    image: event1,
    date: "29 September 2021",
    title: "Global Education Fall Meeting for Everyone",
    location: "Mumbai",
  },
  {
    id: 2,
    image: event2,
    date: "Tomorrow",
    title: "International Conference on Information Technology",
    location: "New York",
  },
  {
    id: 3,
    image: event3,
    date: "2 July 2022",
    title: "UK Demo Day 2022",
    location: "California",
  },
];

const UpcomingEvents = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-2">
            Upcoming <span className="text-secondary">Education</span> Events
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="group overflow-hidden border-border hover:shadow-xl transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-4 left-4 bg-white text-foreground border-0 shadow-md">
                  <Calendar className="w-3 h-3 mr-1 text-secondary" />
                  {event.date}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 line-clamp-2">
                  {event.title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary">
                    Join now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
