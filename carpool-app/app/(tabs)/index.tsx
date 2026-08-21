import { useState ,useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type JoinRequest = {
  passenger_name: string;
  passenger_email: string;
  passenger_mobile: string;
  status: 'pending' | 'accepted' | 'rejected';
};

type Ride = {
  ride_id: number;
  driver: string;
  from_location: string;
  to_location: string;
  time: string;
  seats: number;
  join_requests: JoinRequest[];
};

type Role = 'driver' | 'passenger';

export default function HomeScreen() {
  const [screen, setScreen] = useState<'login' | 'home' | 'create' | 'rides'>(
    'login'
  );
  const [name, setName] = useState('');
  const [rides, setRides] = useState<Ride[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [today, setToday] = useState(new Date());
  const [role, setRole] = useState<Role | ''>('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showAcceptedFor, setShowAcceptedFor] = useState<number | null>(null);
  const [showRejectedFor, setShowRejectedFor] = useState<number | null>(null);
  const fetchRides = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/rides');
      const data = await res.json();
      setRides(data);
    } catch (err) {
      console.error('Failed to fetch rides', err);
    }
  };
  const fetchMyRides = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/rides');
      const data = await res.json();
      const myRides = data.filter((ride: Ride) => ride.driver === name);
      setRides(myRides);
    } catch (err) {
      console.error('Failed to fetch rides', err);
    }
  };

  useEffect(() => {
    setToday(new Date());
  }, []);

  let content = null;

  /* ---------------- LOGIN ---------------- */
  if (screen === 'login') {
    content = (
      <View style={styles.card}>
        <View style={styles.contentContainer}>
        <Text style={styles.title}>Carpool Coordinator</Text>
        <Text style={styles.subtitle}>{isSignUp ? 'Create a new account' : 'Login to continue'}</Text>
        <View style={styles.authToggleRow}>
          <TouchableOpacity
            style={[styles.authToggle, !isSignUp && styles.authToggleActive]}
            onPress={() => setIsSignUp(false)}
          >
            <Text style={[styles.authToggleText, !isSignUp && styles.authToggleTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authToggle, isSignUp && styles.authToggleActive]}
            onPress={() => setIsSignUp(true)}
          >
            <Text style={[styles.authToggleText, isSignUp && styles.authToggleTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
        />
        <Text style={{ marginBottom: 8 }}>Select Role:</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            onPress={() => setRole('driver')}
            style={[styles.roleButton, role === 'driver' && styles.roleButtonActive]}
          >
            <Text style={[styles.roleText, role === 'driver' && styles.roleTextActive]}>DRIVER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setRole('passenger')}
            style={[styles.roleButton, role === 'passenger' && styles.roleButtonActive]}
          >
            <Text style={[styles.roleText, role === 'passenger' && styles.roleTextActive]}>PASSENGER</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ width: '100%' }}>
          <Button
            title={isSignUp ? 'Sign Up' : 'Login'}
            onPress={() => {
              if (!name || !email || !mobile || !role) {
                setError('All fields including role are required');
                return;
              }
              setError('');
              setScreen('home');
            }}
          />
        </View>
      </View>
      </View>
    );
  }

  /* ---------------- HOME ---------------- */
  if (screen === 'home') {
    content = (
      <View style={styles.card}>
        <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome, {name}</Text>
        <Text style={styles.dateText}>Today: {today.toDateString()}</Text>
        <View style={styles.spacer} />
        {role === 'driver' && (
          <>
            <Button title="Create Ride" onPress={() => setScreen('create')} />
            <View style={styles.spacer} />
            <Button
              title="View My Rides"
              onPress={async () => {
                await fetchMyRides();
                setScreen('rides');
              }}
            />
          </>
        )}
        {role === 'passenger' && (
          <>
            <Button title="View Available Rides" onPress={async () => { await fetchRides(); setScreen('rides'); }} />
          </>
        )}
      </View>
      </View>
    );
  }

  /* ---------------- CREATE RIDE ---------------- */
  if (screen === 'create') {
    content = (
      <View style={styles.card}>
        <View style={styles.contentContainer}>
        <Text style={styles.title}>Create Ride</Text>
        <Text style={styles.dateText}>
          Today: {today.toDateString()}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="From"
          value={from}
          onChangeText={setFrom}
        />
        <TextInput
          style={styles.input}
          placeholder="To"
          value={to}
          onChangeText={setTo}
        />
        <View style={{ width: '100%', marginBottom: 12, alignItems: 'flex-start' }}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDateModal(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.datePickerText}>{selectedDate && selectedTime ? `${selectedDate} ${selectedTime}` : 'Select date & time'}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Seats"
          value={seats}
          onChangeText={setSeats}
          keyboardType="numeric"
        />
        <Button
          title="Create Ride"
          onPress={async () => {
            // prefer selectedDate/selectedTime if chosen, fallback to typed time string
            const timeVal = selectedDate && selectedTime ? `${selectedDate} ${selectedTime}` : time;
            if (!from || !to || !timeVal || !seats) return;
            await fetch('http://127.0.0.1:8000/create-ride', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                driver: name,
                from_location: from,
                to_location: to,
                time: timeVal,
                seats: Number(seats),
              }),
            });
            setFrom('');
            setTo('');
            setTime('');
            setSelectedDate('');
            setSelectedTime('');
            setSeats('');
            setScreen('home');
          }}
        />
        <View style={styles.spacer} />
        <Button title="Back" onPress={() => setScreen('home')} />
      </View>
      </View>
    );
  }

  /* ---------------- VIEW RIDES ---------------- */
  if (screen === 'rides') {
    content = (
      <View style={styles.card}>
        <View style={styles.contentContainer}>
        <Text style={styles.title}>
          {role === 'driver' ? 'My Rides' : 'Available Rides'}
        </Text>
        <Text style={styles.dateText}>
          Today: {today.toDateString()}
        </Text>
        <Button
          title="Refresh"
          onPress={role === 'driver' ? fetchMyRides : fetchRides}
        />
        <View style={styles.spacerSmall} />
        <ScrollView style={{ marginTop: 10, width: '100%' }}>
          {rides.map((ride, index) => {
            const rideDate = new Date(ride.time);
            const isPast = rideDate < today;
            return (
              <View key={index} style={[styles.rideCard, isPast && { backgroundColor: '#ddd' }]}>
                <Text style={styles.cardTitle}>
                  {ride.from_location} → {ride.to_location}
                </Text>
                <Text>Driver: {ride.driver}</Text>
                <Text>Time: {ride.time}</Text>
                <Text>Seats: {ride.seats}</Text>
                {isPast && <Text style={{ color: 'red' }}>Past Ride</Text>}
                <View style={styles.spacerSmall} />

                {/* PASSENGER: Join Ride Button */}
                {role === 'passenger' && (
                  <Button
                    title={ride.join_requests.some(req => req.passenger_name === name)
                      ? 'Request Sent'
                      : ride.seats === 0 || isPast
                        ? 'No Seats Left'
                        : 'Join Ride'}
                    disabled={
                      ride.seats === 0 ||
                      isPast ||
                      ride.join_requests.some(req => req.passenger_name === name)
                    }
                    onPress={async () => {
                      await fetch(`http://127.0.0.1:8000/join-ride/${ride.ride_id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          passenger_name: name,
                          passenger_email: email,
                          passenger_mobile: mobile,
                        }),
                      });
                      const res = await fetch('http://127.0.0.1:8000/rides');
                      setRides(await res.json());
                    }}
                  />
                )}

                {/* DRIVER: Requests */}
                {role === 'driver' && ride.join_requests.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    {ride.join_requests.some(req => req.status === 'pending') && (
                      <Text style={{ fontWeight: 'bold' }}>Pending Requests:</Text>
                    )}
                    <ScrollView style={{ maxHeight: 140, marginTop: 6 }}>
                      {ride.join_requests
                        .filter(req => req.status === 'pending')
                        .map((req, i) => (
                          <View
                            key={i}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginVertical: 6,
                              alignItems: 'center'
                            }}
                          >
                            <Text>{req.passenger_name}</Text>
                            <View style={{ flexDirection: 'row' }}>
                              <TouchableOpacity
                                style={styles.smallAction}
                                onPress={async () => {
                                  await fetch(`http://127.0.0.1:8000/handle-request/${ride.ride_id}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      passenger_name: req.passenger_name,
                                      action: 'accept',
                                    }),
                                  });
                                  const res = await fetch('http://127.0.0.1:8000/rides');
                                  setRides(await res.json());
                                }}
                              >
                                <Text style={{ color: '#fff' }}>Accept</Text>
                              </TouchableOpacity>
                              <View style={{ width: 8 }} />
                              <TouchableOpacity
                                style={[styles.smallAction, { backgroundColor: '#d9534f' }]}
                                onPress={async () => {
                                  await fetch(`http://127.0.0.1:8000/handle-request/${ride.ride_id}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      passenger_name: req.passenger_name,
                                      action: 'reject',
                                    }),
                                  });
                                  const res = await fetch('http://127.0.0.1:8000/rides');
                                  setRides(await res.json());
                                }}
                              >
                                <Text style={{ color: '#fff' }}>Reject</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                    </ScrollView>

                    {/* DRIVER ACTION BUTTONS */}
                    <View style={{ marginTop: 10 }}>
                      <Button
                        title="View Accepted Passengers"
                        onPress={() =>
                          setShowAcceptedFor(showAcceptedFor === ride.ride_id ? null : ride.ride_id)
                        }
                      />
                      <View style={{ height: 6 }} />
                      <Button
                        title="View Rejected Passengers"
                        onPress={() =>
                          setShowRejectedFor(showRejectedFor === ride.ride_id ? null : ride.ride_id)
                        }
                      />
                    </View>

                    {/* ACCEPTED PROFILES */}
                    {showAcceptedFor === ride.ride_id && (
                      <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: 'bold' }}>Accepted Passengers</Text>
                        {ride.join_requests
                          .filter(req => req.status === 'accepted')
                          .map((req, i) => (
                            <View
                              key={i}
                              style={{
                                backgroundColor: '#e8ffe8',
                                padding: 8,
                                borderRadius: 6,
                                marginTop: 6,
                              }}
                            >
                              <Text>👤 {req.passenger_name}</Text>
                              <Text>📞 {req.passenger_mobile}</Text>
                              <Text>✉️ {req.passenger_email}</Text>
                            </View>
                          ))}
                        {ride.join_requests.filter(req => req.status === 'accepted').length === 0 && (
                          <Text>No accepted passengers</Text>
                        )}
                      </View>
                    )}

                    {/* REJECTED PROFILES */}
                    {showRejectedFor === ride.ride_id && (
                      <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: 'bold' }}>Rejected Requests</Text>
                        {ride.join_requests
                          .filter(req => req.status === 'rejected')
                          .map((req, i) => (
                            <View
                              key={i}
                              style={{
                                backgroundColor: '#ffe8e8',
                                padding: 8,
                                borderRadius: 6,
                                marginTop: 6,
                              }}
                            >
                              <Text>👤 {req.passenger_name}</Text>
                              <Text>📞 {req.passenger_mobile}</Text>
                              <Text>✉️ {req.passenger_email}</Text>
                            </View>
                          ))}
                        {ride.join_requests.filter(req => req.status === 'rejected').length === 0 && (
                          <Text>No rejected requests</Text>
                        )}
                      </View>
                    )}
                  </View>
                )}

                {/* PASSENGER: Show status if already requested */}
                {role === 'passenger' && ride.join_requests.some(req => req.passenger_name === name) && (
                  <Text style={{ marginTop: 4 }}>
                    Request Status: {ride.join_requests.find(req => req.passenger_name === name)?.status}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.spacer} />
        <Button title="Back" onPress={() => setScreen('home')} />
      </View>
      </View>
    );
  }
  // Date/time chooser modal (simple, UI-only)
  const nextNDates = (n: number) => {
    const arr: string[] = [];
    const base = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  };

  const timeSlots = () => {
    const slots: string[] = [];
    for (let h = 6; h <= 22; h++) {
      slots.push((h < 10 ? '0' + h : h) + ':00');
      slots.push((h < 10 ? '0' + h : h) + ':30');
    }
    return slots;
  };

  const DateTimeModal = (
    <Modal visible={showDateModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Select Date</Text>
          <ScrollView style={{ maxHeight: 140, marginBottom: 8 }}>
            {nextNDates(21).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.dateOption, selectedDate === d && styles.dateOptionActive]}
                onPress={() => setSelectedDate(d)}
              >
                <Text style={selectedDate === d ? { color: '#fff' } : {}}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Select Time</Text>
          <ScrollView style={{ maxHeight: 120, marginBottom: 12 }}>
            {timeSlots().map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.dateOption, selectedTime === t && styles.dateOptionActive]}
                onPress={() => setSelectedTime(t)}
              >
                <Text style={selectedTime === t ? { color: '#fff' } : {}}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <Button title="Cancel" onPress={() => setShowDateModal(false)} />
            <Button
              title="Confirm"
              onPress={() => {
                if (selectedDate && selectedTime) setShowDateModal(false);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {DateTimeModal}
        {content}
      </View>
    </ImageBackground>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0)',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: 450,
    height: 450,
    padding: 20,
    borderRadius: 12,
    elevation: 4
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',  
    alignItems: 'center',      
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#666',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  spacer: {
    height: 12,
  },
  spacerSmall: {
    height: 8,
  },
  rideCard: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  authToggleRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 8,
  },
  authToggle: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 6,
  },
  authToggleActive: {
    backgroundColor: '#2b9cff',
  },
  authToggleText: {
    color: '#444',
  },
  authToggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#777',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#153e8a',
  },
  roleText: {
    color: '#fff',
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#fff',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b9cff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  datePickerText: {
    color: '#fff',
    fontWeight: '600',
  },
  smallAction: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 340,
    maxHeight: '80%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
  },
  dateOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f4f4f4',
    marginBottom: 6,
  },
  dateOptionActive: {
    backgroundColor: '#2b9cff',
  },
});