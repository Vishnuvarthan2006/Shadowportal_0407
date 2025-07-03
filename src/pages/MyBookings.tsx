import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, CreditCard, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import StarField from '@/components/StarField';
import { toast } from '@/components/ui/sonner';

interface Booking {
  id: string;
  destinationName: string;
  destinationImage: string;
  bookedBy: string;
  email: string;
  numberOfPeople: number;
  checkInDate: string;
  checkOutDate: string;
  amountPaid: number;
  currency: string;
  bookingDate: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  specialRequests?: string;
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadBookings();
  }, [user, navigate]);

  useEffect(() => {
    filterBookingsByStatus();
  }, [bookings, filterStatus]);

  const loadBookings = () => {
    // Simulate loading bookings from localStorage or API
    setTimeout(() => {
      const mockBookings: Booking[] = [
        {
          id: 'SITH-2024-001',
          destinationName: 'Mustafar Volcano Spires',
          destinationImage: 'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?auto=format&fit=crop&w=800&q=80',
          bookedBy: user?.user_metadata?.full_name || 'Sith Traveler',
          email: user?.email || '',
          numberOfPeople: 2,
          checkInDate: '2024-03-15',
          checkOutDate: '2024-03-18',
          amountPaid: 7500,
          currency: 'Imperial Credits',
          bookingDate: '2024-02-10',
          status: 'upcoming',
          specialRequests: 'Heat-resistant gear required for lava chambers'
        },
        {
          id: 'SITH-2024-002',
          destinationName: 'Exegol Meditation Crypts',
          destinationImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
          bookedBy: user?.user_metadata?.full_name || 'Sith Traveler',
          email: user?.email || '',
          numberOfPeople: 1,
          checkInDate: '2024-01-20',
          checkOutDate: '2024-01-25',
          amountPaid: 25000,
          currency: 'Imperial Credits',
          bookingDate: '2024-01-05',
          status: 'completed',
          specialRequests: 'Silent meditation chambers preferred'
        },
        {
          id: 'SITH-2023-045',
          destinationName: 'Korriban Tomb Suites',
          destinationImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
          bookedBy: user?.user_metadata?.full_name || 'Sith Traveler',
          email: user?.email || '',
          numberOfPeople: 3,
          checkInDate: '2023-12-10',
          checkOutDate: '2023-12-15',
          amountPaid: 19000,
          currency: 'Imperial Credits',
          bookingDate: '2023-11-25',
          status: 'completed'
        }
      ];

      // Load any real bookings from localStorage
      const savedBookings = localStorage.getItem('user-bookings');
      if (savedBookings) {
        try {
          const parsed = JSON.parse(savedBookings);
          setBookings([...mockBookings, ...parsed]);
        } catch (error) {
          setBookings(mockBookings);
        }
      } else {
        setBookings(mockBookings);
      }
      
      setLoading(false);
    }, 1000);
  };

  const filterBookingsByStatus = () => {
    if (filterStatus === 'all') {
      setFilteredBookings(bookings);
    } else {
      const now = new Date();
      let filtered = bookings;

      if (filterStatus === 'upcoming') {
        filtered = bookings.filter(booking => 
          new Date(booking.checkInDate) > now || booking.status === 'upcoming'
        );
      } else if (filterStatus === 'past') {
        filtered = bookings.filter(booking => 
          new Date(booking.checkOutDate) < now || booking.status === 'completed'
        );
      } else {
        filtered = bookings.filter(booking => booking.status === filterStatus);
      }

      setFilteredBookings(filtered);
    }
  };

  const getStatusBadge = (booking: Booking) => {
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);

    if (booking.status === 'cancelled') {
      return <Badge className="bg-red-600 text-white">CANCELLED</Badge>;
    } else if (checkOut < now) {
      return <Badge className="bg-gray-600 text-white">COMPLETED</Badge>;
    } else if (checkIn > now) {
      return <Badge className="bg-green-600 text-white">UPCOMING</Badge>;
    } else {
      return <Badge className="bg-blue-600 text-white">ACTIVE</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sith-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sith-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sith-red text-lg title-font">LOADING YOUR DARK JOURNEYS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sith-black relative">
      <StarField />
      
      <div className="relative z-10 pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-sith-red hover:text-sith-red-light"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Empire
              </Button>
              <div>
                <h1 className="text-4xl font-bold sith-text-glow title-font">MY DARK JOURNEYS</h1>
                <p className="text-gray-400 mt-2 font-exo">
                  Your passage through the shadows of the galaxy
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sith-red font-semibold font-syncopate">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Sith Traveler'}
              </p>
              <p className="text-sm text-gray-400 font-exo">
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-sith-red" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-sith-gray/50 border-sith-red/30 text-white">
                  <SelectValue placeholder="Filter bookings" />
                </SelectTrigger>
                <SelectContent className="bg-sith-black border-sith-red/30">
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-sith-gray/30 rounded-full flex items-center justify-center">
                <MapPin className="h-12 w-12 text-sith-red/50" />
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-4 title-font">
                NO DARK JOURNEYS FOUND
              </h3>
              <p className="text-gray-500 mb-8 font-exo">
                {filterStatus === 'all' 
                  ? "You have not booked your passage through the stars yet."
                  : `No ${filterStatus} bookings found.`
                }
              </p>
              <Button 
                onClick={() => navigate('/all-destinations')}
                className="sith-button"
              >
                EXPLORE DESTINATIONS
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="galaxy-card hover:sith-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Destination Image & Info */}
                      <div className="lg:col-span-1">
                        <div className="relative h-32 w-full rounded-lg overflow-hidden mb-3">
                          <img 
                            src={booking.destinationImage} 
                            alt={booking.destinationName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(booking)}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-sith-red planet-name">
                          {booking.destinationName}
                        </h3>
                        <p className="text-xs text-gray-400 mono-text">
                          Booking ID: {booking.id}
                        </p>
                      </div>

                      {/* Booking Details */}
                      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-sith-red" />
                            <div>
                              <p className="text-xs text-gray-400 font-syncopate">CHECK-IN</p>
                              <p className="text-sm font-medium font-exo">
                                {formatDate(booking.checkInDate)} at 11:00 AM
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-sith-red" />
                            <div>
                              <p className="text-xs text-gray-400 font-syncopate">CHECK-OUT</p>
                              <p className="text-sm font-medium font-exo">
                                {formatDate(booking.checkOutDate)} at 11:00 AM
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-sith-red" />
                            <div>
                              <p className="text-xs text-gray-400 font-syncopate">TRAVELERS</p>
                              <p className="text-sm font-medium font-exo">
                                {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'Person' : 'People'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-sith-red" />
                            <div>
                              <p className="text-xs text-gray-400 font-syncopate">AMOUNT PAID</p>
                              <p className="text-sm font-medium text-green-400 mono-text">
                                {booking.amountPaid.toLocaleString()} {booking.currency}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex flex-col justify-between">
                        <div className="text-right mb-4">
                          <p className="text-xs text-gray-400 font-syncopate">DURATION</p>
                          <p className="text-lg font-bold text-sith-red mono-text">
                            {calculateNights(booking.checkInDate, booking.checkOutDate)} Nights
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => handleViewDetails(booking)}
                          variant="outline"
                          className="w-full border-sith-red/30 text-sith-red hover:bg-sith-red hover:text-white font-syncopate"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          VIEW DETAILS
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl bg-sith-black border-sith-red/30 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center sith-text-glow title-font">
              BOOKING DETAILS
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Destination Header */}
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img 
                  src={selectedBooking.destinationImage} 
                  alt={selectedBooking.destinationName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sith-black via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white planet-name">
                    {selectedBooking.destinationName}
                  </h3>
                  <p className="text-sith-red mono-text">{selectedBooking.id}</p>
                </div>
                <div className="absolute top-4 right-4">
                  {getStatusBadge(selectedBooking)}
                </div>
              </div>

              {/* Booking Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-sith-red font-syncopate">TRAVELER INFORMATION</h4>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400 font-syncopate">BOOKED BY</p>
                      <p className="text-white font-exo">{selectedBooking.bookedBy}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 font-syncopate">EMAIL ID</p>
                      <p className="text-white font-exo">{selectedBooking.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 font-syncopate">NUMBER OF PEOPLE</p>
                      <p className="text-white font-exo">{selectedBooking.numberOfPeople}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-sith-red font-syncopate">JOURNEY DETAILS</h4>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400 font-syncopate">CHECK-IN DATE</p>
                      <p className="text-white font-exo">{formatDate(selectedBooking.checkInDate)} at 11:00 AM</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 font-syncopate">CHECK-OUT DATE</p>
                      <p className="text-white font-exo">{formatDate(selectedBooking.checkOutDate)} at 11:00 AM</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 font-syncopate">DURATION</p>
                      <p className="text-white font-exo">
                        {calculateNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)} Nights
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="p-4 bg-sith-gray/30 rounded-lg border border-sith-red/20">
                <h4 className="text-lg font-bold text-sith-red mb-3 font-syncopate">PAYMENT DETAILS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 font-syncopate">AMOUNT PAID</p>
                    <p className="text-xl font-bold text-green-400 mono-text">
                      {selectedBooking.amountPaid.toLocaleString()} {selectedBooking.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-syncopate">BOOKING DATE</p>
                    <p className="text-white font-exo">{formatDate(selectedBooking.bookingDate)}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="p-4 bg-sith-red/10 border border-sith-red/30 rounded-lg">
                  <h4 className="text-lg font-bold text-sith-red mb-2 font-syncopate">SPECIAL REQUESTS</h4>
                  <p className="text-gray-300 font-exo">{selectedBooking.specialRequests}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;