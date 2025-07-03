import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CreditCard, Users, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: {
    name: string;
    price: string;
    image: string;
    description: string;
  } | null;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, destination }) => {
  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: ''
  });

  const handleBookingSubmit = () => {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
      toast.error('Please fill in all payment details');
      return;
    }

    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Save booking to localStorage
      const booking = {
        id: `SITH-${Date.now()}`,
        destinationName: destination?.name,
        destinationImage: destination?.image,
        bookedBy: user?.user_metadata?.full_name || 'Sith Traveler',
        email: user?.email || '',
        numberOfPeople: parseInt(guests),
        checkInDate: checkIn?.toISOString().split('T')[0],
        checkOutDate: checkOut?.toISOString().split('T')[0],
        amountPaid: calculateTotal(),
        currency: 'Imperial Credits',
        bookingDate: new Date().toISOString().split('T')[0],
        status: 'upcoming',
        specialRequests: specialRequests || undefined
      };

      // Get existing bookings
      const existingBookings = localStorage.getItem('user-bookings');
      let bookings = [];
      
      if (existingBookings) {
        try {
          bookings = JSON.parse(existingBookings);
        } catch (error) {
          bookings = [];
        }
      }

      // Add new booking
      bookings.push(booking);
      localStorage.setItem('user-bookings', JSON.stringify(bookings));

      toast.success('Payment successful! Your dark journey awaits.');
      setIsLoading(false);
      onClose();
      setStep(1);
      
      // Reset form
      setCheckIn(undefined);
      setCheckOut(undefined);
      setGuests('1');
      setSpecialRequests('');
      setPaymentData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        billingAddress: ''
      });
    }, 3000);
  };

  const calculateNights = () => {
    if (checkIn && checkOut) {
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const pricePerNight = parseInt(destination?.price?.replace(/[^\d]/g, '') || '0');
    return nights * pricePerNight;
  };

  if (!destination) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-sith-black border-sith-red/30 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center sith-text-glow title-font">
            {step === 1 ? 'Book Your Dark Retreat' : 'Complete Your Payment'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Destination Info */}
            <div className="flex gap-4 p-4 rounded-lg bg-sith-gray/30 border border-sith-red/20">
              <img 
                src={destination.image} 
                alt={destination.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-sith-red">{destination.name}</h3>
                <p className="text-gray-400 text-sm">{destination.description}</p>
                <p className="text-sith-red font-bold">{destination.price}/night</p>
              </div>
            </div>

            {/* Booking Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sith-red">Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-sith-gray/50 border-sith-red/30 text-white hover:bg-sith-gray/70"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-sith-red" />
                      {checkIn ? format(checkIn, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-sith-black border-sith-red/30">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sith-red">Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-sith-gray/50 border-sith-red/30 text-white hover:bg-sith-gray/70"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-sith-red" />
                      {checkOut ? format(checkOut, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-sith-black border-sith-red/30">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sith-red">Number of Guests</Label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="bg-sith-gray/50 border-sith-red/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-sith-black border-sith-red/30">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <SelectItem key={num} value={num.toString()} className="text-white hover:bg-sith-gray/50">
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sith-red">Special Requests</Label>
              <Textarea
                placeholder="Any dark rituals or special accommodations needed..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="bg-sith-gray/50 border-sith-red/30 text-white"
              />
            </div>

            {/* Booking Summary */}
            {checkIn && checkOut && (
              <div className="p-4 rounded-lg bg-sith-gray/30 border border-sith-red/20">
                <h4 className="font-semibold text-sith-red mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Nights:</span>
                    <span>{calculateNights()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per night:</span>
                    <span>{destination.price}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sith-red">
                    <span>Total:</span>
                    <span>{calculateTotal().toLocaleString()} Imperial Credits</span>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleBookingSubmit} className="w-full sith-button">
              Proceed to Payment
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sith-red">Cardholder Name</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-sith-red" />
                  <Input
                    placeholder="Darth Cardholder"
                    value={paymentData.cardholderName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardholderName: e.target.value })}
                    className="pl-10 bg-sith-gray/50 border-sith-red/30 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sith-red">Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                  className="bg-sith-gray/50 border-sith-red/30 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sith-red">Expiry Date</Label>
                  <Input
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                    className="bg-sith-gray/50 border-sith-red/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sith-red">CVV</Label>
                  <Input
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                    className="bg-sith-gray/50 border-sith-red/30 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sith-red">Billing Address</Label>
                <Textarea
                  placeholder="Your billing address..."
                  value={paymentData.billingAddress}
                  onChange={(e) => setPaymentData({ ...paymentData, billingAddress: e.target.value })}
                  className="bg-sith-gray/50 border-sith-red/30 text-white"
                />
              </div>
            </div>

            {/* Final Summary */}
            <div className="p-4 rounded-lg bg-sith-gray/30 border border-sith-red/20">
              <h4 className="font-semibold text-sith-red mb-2">Final Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span>{destination.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{calculateNights()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{guests}</span>
                </div>
                <div className="flex justify-between font-bold text-sith-red text-lg">
                  <span>Total Amount:</span>
                  <span>{calculateTotal().toLocaleString()} Imperial Credits</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep(1)} 
                variant="outline" 
                className="flex-1 border-sith-red/30 text-white hover:bg-sith-gray/50"
              >
                Back
              </Button>
              <Button 
                onClick={handlePayment} 
                className="flex-1 sith-button" 
                disabled={isLoading}
              >
                {isLoading ? 'Processing Payment...' : 'Complete Payment'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;