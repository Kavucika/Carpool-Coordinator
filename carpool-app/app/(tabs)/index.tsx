import { useState ,useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from 'react-native';

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
        <Text style={styles.subtitle}>Login to continue</Text>
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
        <Text style={{ marginBottom: 5 }}>Select Role:</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <Button
            title="Driver"
            onPress={() => setRole('driver')}
            color={role === 'driver' ? 'blue' : 'gray'}
          />
          <Button
            title="Passenger"
            onPress={() => setRole('passenger')}
            color={role === 'passenger' ? 'blue' : 'gray'}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title="Login"
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
        <TextInput
          style={styles.input}
          placeholder="Time (YYYY-MM-DD HH:mm)"
          value={time}
          onChangeText={setTime}
        />
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
            if (!from || !to || !time || !seats) return;
            await fetch('http://127.0.0.1:8000/create-ride', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                driver: name,
                from_location: from,
                to_location: to,
                time,
                seats: Number(seats),
              }),
            });
            setFrom('');
            setTo('');
            setTime('');
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
                    {ride.join_requests
                      .filter(req => req.status === 'pending')
                      .map((req, i) => (
                        <View
                          key={i}
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginVertical: 2,
                          }}
                        >
                          <Text>{req.passenger_name}</Text>
                          <View style={{ flexDirection: 'row' }}>
                            <Button
                              title="Accept"
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
                            />
                            <Button
                              title="Reject"
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
                            />
                          </View>
                        </View>
                      ))}

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
  return (
    <ImageBackground
      source={require('../../assets/images/bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>{content}</View>
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
});