import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Shield, Zap, Star, Crown, Swords, Moon, User, LogOut, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import AuthModal from '@/components/auth/AuthModal';
import BookingModal from '@/components/booking/BookingModal';
import DarthZenChat from '@/components/DarthZenChat';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/supabase';
import { getTopDestinations, searchDestinations, getDestinationsByRank } from '@/data/destinations';
import { getUserTier } from '@/data/subscriptionTiers';
import { useNavigate, useLocation } from 'react-router-dom';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showDarthZen, setShowDarthZen] = useState(false);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for subscription success from payment portal
  useEffect(() => {
    if (location.state?.subscriptionSuccess) {
      const { newRank, userName } = location.state;
      
      // Show success message with dramatic effect
      setTimeout(() => {
        toast.success(`Welcome to your new rank, ${newRank} ${userName}! Your power has increased significantly.`);
      }, 1000);

      // Clear the state to prevent repeated messages
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const userRank = user?.user_metadata?.rank || 'Acolyte';
  const userTier = getUserTier(userRank);

  // Get top 10 destinations that user has access to
  const topDestinations = useMemo(() => {
    const accessible = getDestinationsByRank(userRank);
    return getTopDestinations(10).filter(dest => 
      accessible.some(acc => acc.id === dest.id)
    );
  }, [userRank]);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return topDestinations;
    
    const accessible = getDestinationsByRank(userRank);
    const searched = searchDestinations(searchQuery);
    return searched.filter(dest => 
      accessible.some(acc => acc.id === dest.id)
    );
  }, [searchQuery, userRank, topDestinations]);

  const amenities = [
    { name: "Force Meditation Chambers", icon: Moon, description: "Channel the dark side in isolation" },
    { name: "Lightsaber Dueling Arenas", icon: Swords, description: "Practice your combat skills" },
    { name: "Anti-Jedi Detection Fields", icon: Shield, description: "Complete privacy guaranteed" },
    { name: "Dark Side Spa", icon: Zap, description: "Rejuvenate with Force lightning" }
  ];

  const reviews = [
    {
      name: "Darth Malak",
      rank: "Sith Lord",
      rating: 5,
      review: "The meditation chambers on Exegol exceeded my expectations. The dark side flows strongly here.",
      planet: "Exegol"
    },
    {
      name: "Savage Opress",
      rank: "Sith Acolyte",
      rating: 4,
      review: "Mustafar's volcanic energy is intoxicating. Perfect for dark rituals.",
      planet: "Mustafar"
    },
    {
      name: "Asajj Ventress",
      rank: "Dark Assassin",
      rating: 5,
      review: "Korriban's ancient tombs whisper secrets of power. Highly recommended.",
      planet: "Korriban"
    }
  ];

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Failed to sign out');
        return;
      }
      
      // Clear local subscription data
      localStorage.removeItem('sith-subscription');
      
      toast.success('May the Force be with you on your next journey');
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleBookDestination = (destination: any) => {
    if (!user) {
      toast.error('You must join the Empire first to book destinations');
      setShowAuthModal(true);
      return;
    }
    setSelectedDestination(destination);
    setShowBookingModal(true);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Sith Acolyte';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sith-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sith-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sith-red text-lg title-font">AWAKENING THE FORCE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sith-black overflow-x-hidden relative">
      <StarField />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 holographic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold sith-text-glow title-font">SHADOWPORTALS</h1>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#destinations" className="hover:text-sith-red transition-colors font-medium font-syncopate">DESTINATIONS</a>
              <Button
                variant="ghost"
                onClick={() => navigate('/all-destinations')}
                className="hover:text-sith-red transition-colors font-medium font-syncopate"
              >
                ALL DESTINATIONS
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
              <a href="#amenities" className="hover:text-sith-red transition-colors font-medium font-syncopate">AMENITIES</a>
              <a href="#reviews" className="hover:text-sith-red transition-colors font-medium font-syncopate">REVIEWS</a>
              <Button
                variant="ghost"
                onClick={() => navigate('/subscription-tiers')}
                className="hover:text-sith-red transition-colors font-medium font-syncopate"
              >
                RANKS
                <Crown className="h-4 w-4 ml-1" />
              </Button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 border border-sith-red/30">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-sith-red text-white font-syncopate">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-sith-black border-sith-red/30" align="end">
                    <DropdownMenuItem className="text-white hover:bg-sith-gray/50">
                      <User className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-exo">{getUserDisplayName()}</span>
                        <span className="text-xs text-sith-red font-syncopate">{userRank}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/my-bookings')}
                      className="text-white hover:bg-sith-gray/50 font-syncopate"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>MY BOOKINGS</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/subscription-tiers')}
                      className="text-white hover:bg-sith-gray/50 font-syncopate"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      <span>UPGRADE RANK</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-white hover:bg-sith-gray/50 font-syncopate"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>LOGOUT</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  className="sith-button"
                  onClick={() => setShowAuthModal(true)}
                >
                  JOIN THE EMPIRE
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden nebula-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sith-black/50 to-sith-black">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-sith-red/10 via-transparent to-sith-red/10 animate-red-flicker"></div>
        </div>

        <div className="relative z-10 text-center px-4 animate-slide-up">
          <h1 className="text-6xl md:text-8xl font-black mb-6 sith-text-glow animate-pulse-glow title-font">
            SHADOWPORTALS
          </h1>
          <p className="text-2xl md:text-3xl mb-4 text-sith-red font-bold planet-name">
            BOOK YOUR STAY IN THE SHADOWS OF THE GALAXY
          </p>
          <p className="text-xl mb-8 opacity-90 font-medium description-text">
            Luxury, secrecy, and domination await in the darkest corners of space.
          </p>
          
          {user && (
            <div className="mb-6">
              <Badge className="bg-sith-red text-white text-lg px-4 py-2 font-syncopate animate-pulse-glow">
                WELCOME, {userRank.toUpperCase()} {getUserDisplayName().toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-400 mt-2 font-exo">
                Access to {userTier.destinationLimit === 999 ? 'all' : userTier.destinationLimit} destinations
              </p>
              {userRank !== 'Acolyte' && (
                <p className="text-xs text-green-400 mt-1 font-exo animate-pulse">
                  ✨ Enhanced powers active - Your rank grants special privileges
                </p>
              )}
            </div>
          )}
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-sith-red" />
                <Input
                  placeholder="Search destinations... let the dark side guide you"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-sith-gray/80 border-sith-red/30 text-white placeholder-gray-400 h-12 backdrop-blur-sm font-exo"
                />
              </div>
              <Button 
                className="sith-button h-12 px-8"
                onClick={() => setShowDarthZen(true)}
              >
                CONSULT DARTH ZEN
              </Button>
            </div>
          </div>

          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-sith-red" />
              <span className="font-medium font-syncopate">JEDI-FREE ZONES</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-sith-red" />
              <span className="font-medium font-syncopate">FORCE ENHANCED</span>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-sith-red" />
              <span className="font-medium font-syncopate">EMPIRE APPROVED</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section id="destinations" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 sith-text-glow title-font">DARK DESTINATIONS</h2>
            <p className="text-xl text-gray-300 description-text">Top-rated destinations for your rank</p>
            {searchQuery && (
              <p className="text-sith-red mt-2 font-exo">
                Found {filteredDestinations.length} destinations matching "{searchQuery}"
              </p>
            )}
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/all-destinations')}
                className="border-sith-red/30 text-sith-red hover:bg-sith-red hover:text-white font-syncopate"
              >
                VIEW ALL {getDestinationsByRank(userRank).length} DESTINATIONS
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination, index) => (
              <Card key={index} className="galaxy-card hover:sith-glow transition-all duration-500 group cursor-pointer overflow-hidden animate-float-slow">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sith-black via-transparent to-transparent opacity-80"></div>
                  <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    <div className="bg-sith-red/90 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm mono-text">
                      ADV: {destination.adventureLevel}/10
                    </div>
                    <div className="bg-sith-red/90 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm mono-text">
                      DNG: {destination.dangerLevel}/10
                    </div>
                    <div className="bg-sith-red/90 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm mono-text">
                      {destination.gravityLevel}G
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-purple-600 text-white text-xs font-syncopate">
                      {destination.requiredRank.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-bold mono-text">
                      {destination.ratings.average} ({destination.ratings.count})
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl text-sith-red planet-name">{destination.name}</CardTitle>
                  <CardDescription className="text-gray-300 text-lg description-text">
                    {destination.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 description-text">
                    {destination.backgroundLore}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-sith-red mono-text">{destination.price}</span>
                    <Button 
                      className="sith-button"
                      onClick={() => handleBookDestination(destination)}
                    >
                      ENTER THE DARKNESS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDestinations.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400 description-text">No destinations found matching your search.</p>
              <p className="text-sith-red font-syncopate">THE DARK SIDE HAS NOT YET REVEALED THESE SECRETS...</p>
            </div>
          )}
        </div>
      </section>

      {/* Sith Concierge Bot */}
      <section className="py-20 px-4 bg-sith-gray/20 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="holographic p-12 rounded-2xl animate-float-slow">
            <div className="w-32 h-32 mx-auto mb-8 bg-sith-red/20 rounded-full flex items-center justify-center sith-glow animate-pulse-glow">
              <div className="w-16 h-16 bg-sith-red rounded-full animate-glow-pulse"></div>
            </div>
            <h2 className="text-4xl font-bold mb-4 sith-text-glow title-font">DARTH ZEN</h2>
            <p className="text-xl mb-6 text-sith-red font-semibold planet-name">YOUR SITH CONCIERGE AI</p>
            <p className="text-lg mb-8 text-gray-300 description-text">
              "Greetings, worthy traveler. I sense great power within you. Allow me to guide you to destinations that match your darkness level and Force sensitivity."
            </p>
            <Button 
              className="sith-button text-lg px-8 py-4"
              onClick={() => setShowDarthZen(true)}
            >
              CONSULT THE DARK ORACLE
            </Button>
            {!userTier.hasAiChat && (
              <p className="text-sm text-yellow-400 mt-4 font-syncopate">
                ⚠ UPGRADE TO INQUISITOR RANK OR HIGHER FOR FULL AI ACCESS
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section id="amenities" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 sith-text-glow title-font">SITH AMENITIES</h2>
            <p className="text-xl text-gray-300 description-text">Luxuries befitting the dark side elite</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenities.map((amenity, index) => (
              <Card key={index} className="galaxy-card hover:sith-glow transition-all duration-300 text-center group">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-sith-red/20 rounded-full flex items-center justify-center group-hover:bg-sith-red/40 transition-colors group-hover:animate-pulse-glow">
                    <amenity.icon className="h-8 w-8 text-sith-red" />
                  </div>
                  <CardTitle className="text-xl text-sith-red planet-name">{amenity.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 description-text">{amenity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 px-4 bg-sith-gray/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 sith-text-glow title-font">EMPIRE REVIEWS</h2>
            <p className="text-xl text-gray-300 description-text">Testimonials from the galaxy's most feared</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <Card key={index} className="galaxy-card hover:sith-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CardTitle className="text-xl text-sith-red planet-name">{review.name}</CardTitle>
                      <CardDescription className="text-gray-400 font-medium font-syncopate">{review.rank}</CardDescription>
                    </div>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-sith-red fill-current" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 italic description-text">"{review.review}"</p>
                  <div className="flex items-center space-x-2 text-sm text-sith-red">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium planet-name">{review.planet}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Side Loyalty Program */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8 sith-text-glow title-font">DARK SIDE ASCENSION</h2>
          <p className="text-xl mb-12 text-gray-300 description-text">Rise through the ranks of our loyalty program</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Acolyte', 'Inquisitor', 'Lord', 'Darth'].map((rank, index) => (
              <div key={index} className={`galaxy-card p-6 hover:sith-glow transition-all duration-300 group ${
                userRank === rank ? 'ring-2 ring-sith-red animate-pulse-glow' : ''
              }`}>
                <div className="w-16 h-16 mx-auto mb-4 bg-sith-red/20 rounded-full flex items-center justify-center group-hover:animate-pulse-glow">
                  <Crown className="h-8 w-8 text-sith-red" />
                </div>
                <h3 className="text-xl font-bold text-sith-red mb-2 planet-name">{rank}</h3>
                <p className="text-sm text-gray-400 description-text">
                  {index + 1 === 1 && "Begin your journey into darkness"}
                  {index + 1 === 2 && "Access exclusive destinations"}
                  {index + 1 === 3 && "Force-enhanced luxury suites"}
                  {index + 1 === 4 && "Ultimate power and access"}
                </p>
                {userRank === rank && (
                  <Badge className="bg-sith-red text-white mt-2 font-syncopate animate-pulse">CURRENT</Badge>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <Button
              onClick={() => navigate('/subscription-tiers')}
              className="sith-button text-lg px-8 py-3"
            >
              VIEW ALL RANKS & PRICING
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sith-black border-t border-sith-red/20 py-12 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 sith-text-glow title-font">SHADOWPORTALS</h3>
              <p className="text-gray-400 description-text">The galaxy's premier dark side travel platform.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-sith-red font-syncopate">DESTINATIONS</h4>
              <ul className="space-y-2 text-gray-400 description-text">
                <li>Mustafar</li>
                <li>Exegol</li>
                <li>Korriban</li>
                <li>Dromund Kaas</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-sith-red font-syncopate">SERVICES</h4>
              <ul className="space-y-2 text-gray-400 description-text">
                <li>Hyperspace Travel</li>
                <li>Force Training</li>
                <li>Sith Concierge</li>
                <li>Dark Side Spa</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-sith-red font-syncopate">EMPIRE CONTACT</h4>
              <ul className="space-y-2 text-gray-400 description-text">
                <li className="mono-text">Hologram: +GAL-SITH-RULE</li>
                <li>darkside@shadowportals.empire</li>
                <li>Death Star Sector 7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-sith-red/20 mt-8 pt-8 text-center text-gray-400">
            <p className="description-text">&copy; {new Date().getFullYear()} ShadowPortals. All rights reserved across the galaxy. May the Force serve you.</p>
          </div>
        </div>
      </footer>

      {/* Modals and Components */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
      
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        destination={selectedDestination}
      />

      <DarthZenChat
        isOpen={showDarthZen}
        onToggle={() => setShowDarthZen(!showDarthZen)}
      />
    </div>
  );
};

export default Index;