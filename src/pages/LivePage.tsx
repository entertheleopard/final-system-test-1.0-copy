import { useNavigate } from 'react-router-dom';
import { useLive } from '@/contexts/LiveContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { handleAvatarError, handleImageError } from '@/lib/utils';
import { Radio, Users, Eye, Clock, Play } from 'lucide-react';

export default function LivePage() {
  const navigate = useNavigate();
  const { startLive } = useLive();
  const liveStreams = [
    {
      id: 1,
      title: 'Digital Painting Session',
      streamer: 'Creative Artist',
      avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
      thumbnail: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png',
      viewers: 234,
      duration: '1h 23m',
      isLive: true,
    },
    {
      id: 2,
      title: '3D Modeling Workshop',
      streamer: 'Digital Visionary',
      avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png',
      thumbnail: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_2.png',
      viewers: 156,
      duration: '45m',
      isLive: true,
    },
    {
      id: 3,
      title: 'Abstract Art Tutorial',
      streamer: 'Modern Creator',
      avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_3.png',
      thumbnail: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_3.png',
      viewers: 89,
      duration: '2h 10m',
      isLive: true,
    },
  ];

  const upcomingStreams = [
    {
      id: 4,
      title: 'Portfolio Review Session',
      streamer: 'Art Mentor',
      avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_4.png',
      scheduledTime: 'Today at 6:00 PM',
    },
    {
      id: 5,
      title: 'Color Theory Masterclass',
      streamer: 'Design Expert',
      avatar: 'https://c.animaapp.com/mlix9h3omwDIgk/img/ai_5.png',
      scheduledTime: 'Tomorrow at 2:00 PM',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-h1 font-medium text-foreground mb-2">Live Streams</h1>
          <p className="text-body text-tertiary-foreground">
            Watch and learn from creators in real-time
          </p>
        </header>

        {/* Live Now */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Radio className="w-6 h-6 text-error animate-pulse" strokeWidth={1.5} />
            <h2 className="text-h2 font-medium text-foreground">Live Now</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((stream) => (
              <Card 
                key={stream.id} 
                onClick={() => navigate(`/live/watch/${stream.id}`)}
                className="border border-border shadow-md hover:shadow-lg transition-all duration-normal overflow-hidden group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-normal"
                    onError={handleImageError}
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-error text-error-foreground rounded-md flex items-center gap-1 text-caption font-medium">
                    <Radio className="w-3 h-3" strokeWidth={2} />
                    LIVE
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 text-white rounded text-caption flex items-center gap-1">
                    <Eye className="w-3 h-3" strokeWidth={2} />
                    {stream.viewers}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-normal flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary-foreground ml-1" strokeWidth={1.5} fill="currentColor" />
                    </div>
                  </div>
                </div>

                <CardContent className="pt-4">
                  <h3 className="text-h4 font-medium text-foreground mb-2 line-clamp-1">
                    {stream.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={stream.avatar}
                      alt={stream.streamer}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={handleAvatarError}
                    />
                    <p className="text-body-sm text-tertiary-foreground">
                      {stream.streamer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-caption text-tertiary-foreground">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    <span>{stream.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Upcoming */}
        <section>
          <h2 className="text-h2 font-medium text-foreground mb-6">Upcoming Streams</h2>

          <div className="space-y-4">
            {upcomingStreams.map((stream) => (
              <Card key={stream.id} className="border border-border shadow-md hover:shadow-lg transition-all duration-normal">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={stream.avatar}
                        alt={stream.streamer}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={handleAvatarError}
                      />
                      <div>
                        <h3 className="text-h4 font-medium text-foreground mb-1">
                          {stream.title}
                        </h3>
                        <p className="text-body-sm text-tertiary-foreground mb-1">
                          by {stream.streamer}
                        </p>
                        <p className="text-caption text-tertiary-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" strokeWidth={1.5} />
                          {stream.scheduledTime}
                        </p>
                      </div>
                    </div>
                    <Button className="bg-gradient-primary text-primary-foreground shadow-button-primary hover:bg-primary-hover">
                      Set Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Start Your Own Stream */}
        <Card className="border border-border shadow-md mt-12 bg-gradient-secondary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-h3 font-medium text-foreground mb-2">
                  Ready to go live?
                </h3>
                <p className="text-body text-tertiary-foreground">
                  Share your creative process with the community and connect with fellow artists in real-time.
                </p>
              </div>
              <Button 
                onClick={startLive}
                className="h-12 px-8 bg-gradient-primary text-primary-foreground shadow-button-primary hover:bg-primary-hover whitespace-nowrap"
              >
                <Radio className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Start Streaming
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
