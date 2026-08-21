import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { canLogin, findUser, registerUser } from '../../services/authLogic';

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
  const [registeredUsers, setRegisteredUsers] = useState<Array<{ name: string; email: string; mobile: string; role: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showYearList, setShowYearList] = useState(false);
  const [timeHour, setTimeHour] = useState(4);
  const [timeMinute, setTimeMinute] = useState(30);
  const [timeMeridiem, setTimeMeridiem] = useState<'AM' | 'PM'>('AM');
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const clockNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minuteSteps = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const parseSelectedTime = (timeValue: string): { hour: number; minute: number; meridiem: 'AM' | 'PM' } => {
    if (!timeValue) {
      return { hour: 4, minute: 30, meridiem: 'AM' };
    }

    const [rawHour, rawMinute] = timeValue.split(':');
    const hourValue = Number(rawHour);
    const minuteValue = Number(rawMinute);
    const meridiem: 'AM' | 'PM' = hourValue >= 12 ? 'PM' : 'AM';
    const normalizedHour = hourValue % 12 === 0 ? 12 : hourValue % 12;

    return {
      hour: normalizedHour,
      minute: minuteValue,
      meridiem,
    };
  };

  const openDatePicker = () => {
    const baseDate = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date();
    setCalendarMonth(baseDate.getMonth());
    setCalendarYear(baseDate.getFullYear());
    setShowYearList(false);
    setDatePickerMode('date');
  };

  const openTimePicker = () => {
    const parsed = parseSelectedTime(selectedTime);
    setTimeHour(parsed.hour);
    setTimeMinute(parsed.minute);
    setTimeMeridiem(parsed.meridiem);
    setDatePickerMode('time');
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  let content = null;

  const getUserByNameAndEmail = (userName: string, userEmail: string) => findUser(registeredUsers, userName, userEmail);

  const handleAuthSubmit = () => {
    const cleanedName = name.trim();
    const cleanedEmail = email.trim();
    const cleanedMobile = mobile.trim();

    if (!cleanedName || !cleanedEmail) {
      setError('Name and email are required.');
      return;
    }

    if (isSignUp) {
      if (!cleanedMobile || !role) {
        setError('Mobile number and role are required to create an account.');
        return;
      }

      const duplicateUser = findUser(registeredUsers, cleanedName, cleanedEmail);
      if (duplicateUser) {
        setError('This name and email are already registered. Please login instead.');
        return;
      }

      const nextUsers = registerUser(registeredUsers, {
        name: cleanedName,
        email: cleanedEmail,
        mobile: cleanedMobile,
        role,
      });

      if (nextUsers.length === registeredUsers.length) {
        setError('This account could not be created. Please try again.');
        return;
      }

      setRegisteredUsers(nextUsers);
      setError('');
      setIsSignUp(false);
      setRole('');
      setEmail('');
      setMobile('');
      setName(cleanedName);
      return;
    }

    if (!role) {
      setError('Please select your role before logging in.');
      return;
    }

    const existingUser = getUserByNameAndEmail(cleanedName, cleanedEmail);
    if (!existingUser) {
      setError('No matching account found for this name and email. Please sign up first.');
      return;
    }

    if (existingUser.role !== role) {
      setError(`This email is registered as a ${existingUser.role}.`);
      return;
    }

    setError('');
    setEmail(existingUser.email);
    setMobile(existingUser.mobile);
    setScreen('home');
  };

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
              onPress={() => {
                setIsSignUp(false);
                setError('');
              }}
            >
              <Text style={[styles.authToggleText, !isSignUp && styles.authToggleTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authToggle, isSignUp && styles.authToggleActive]}
              onPress={() => {
                setIsSignUp(true);
                setError('');
              }}
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
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
          )}

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
              onPress={handleAuthSubmit}
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
        <View style={styles.fieldStack}>
          <TouchableOpacity
            style={styles.fieldWithIcon}
            onPress={openDatePicker}
          >
            <Text style={[styles.fieldWithIconText, !selectedDate && styles.fieldPlaceholderText]}>
              {selectedDate || 'Date'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#2b9cff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fieldWithIcon}
            onPress={openTimePicker}
          >
            <Text style={[styles.fieldWithIconText, !selectedTime && styles.fieldPlaceholderText]}>
              {selectedTime || 'Time'}
            </Text>
            <Ionicons name="time-outline" size={20} color="#2b9cff" />
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
  const getCalendarDays = () => {
    const firstDate = new Date(calendarYear, calendarMonth, 1);
    const firstDayIndex = firstDate.getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const previousMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();

    const cells: Array<{ day: number; inCurrentMonth: boolean }> = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({ day: previousMonthDays - i, inCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, inCurrentMonth: true });
    }

    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - (daysInMonth + firstDayIndex) + 1;
      cells.push({ day: nextDay, inCurrentMonth: false });
    }

    return cells;
  };

  const dateCells = getCalendarDays();
  const yearOptions = Array.from({ length: 13 }, (_, idx) => calendarYear - 6 + idx);

  const handleDateSelection = (dateValue: string) => {
    setSelectedDate(dateValue);
    setDatePickerMode(null);
  };

  const handleTimeCommit = () => {
    const hour24 = timeMeridiem === 'AM'
      ? (timeHour === 12 ? 0 : timeHour)
      : (timeHour === 12 ? 12 : timeHour + 12);

    setSelectedTime(`${String(hour24).padStart(2, '0')}:${String(timeMinute).padStart(2, '0')}`);
    setDatePickerMode(null);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Modal visible={Boolean(datePickerMode)} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            {datePickerMode === 'date' ? (
              <View style={styles.calendarSheet}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      if (calendarMonth === 0) {
                        setCalendarMonth(11);
                        setCalendarYear((prev) => prev - 1);
                      } else {
                        setCalendarMonth((prev) => prev - 1);
                      }
                    }}
                  >
                    <Text style={styles.calendarNavText}>{'<'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setShowYearList((prev) => !prev)}>
                    <Text style={styles.calendarTitleText}>{monthNames[calendarMonth]} {calendarYear}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (calendarMonth === 11) {
                        setCalendarMonth(0);
                        setCalendarYear((prev) => prev + 1);
                      } else {
                        setCalendarMonth((prev) => prev + 1);
                      }
                    }}
                  >
                    <Text style={styles.calendarNavText}>{'>'}</Text>
                  </TouchableOpacity>
                </View>

                {showYearList ? (
                  <View style={styles.yearListWrap}>
                    {yearOptions.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[styles.yearOption, year === calendarYear && styles.yearOptionActive]}
                        onPress={() => {
                          setCalendarYear(year);
                          setShowYearList(false);
                        }}
                      >
                        <Text style={[styles.yearOptionText, year === calendarYear && styles.yearOptionTextActive]}>{year}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <>
                    <View style={styles.weekRow}>
                      {dayNames.map((day) => (
                        <Text key={day} style={styles.weekDayText}>{day}</Text>
                      ))}
                    </View>

                    <View style={styles.calendarGrid}>
                      {dateCells.map((cell, idx) => {
                        const cellDate = new Date(calendarYear, calendarMonth, cell.day);
                        const cellValue = formatLocalDate(cellDate);
                        const isSelected = cell.inCurrentMonth && selectedDate
                          ? selectedDate === cellValue
                          : false;

                        return (
                          <TouchableOpacity
                            key={`${cell.day}-${idx}`}
                            style={[
                              styles.dateCell,
                              !cell.inCurrentMonth && styles.dateCellMuted,
                              isSelected && styles.dateCellSelected,
                            ]}
                            onPress={() => {
                              if (!cell.inCurrentMonth) return;
                              const value = formatLocalDate(cellDate);
                              handleDateSelection(value);
                            }}
                          >
                            <Text style={[styles.dateCellText, isSelected && styles.dateCellTextSelected]}>{cell.day}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                <TouchableOpacity style={styles.calendarOkButton} onPress={() => setDatePickerMode(null)}>
                  <Text style={styles.calendarOkText}>Ok</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.timeSheet}>
                <Text style={styles.timeSheetTitle}>Select time</Text>

                <View style={styles.timeDisplayRow}>
                  <Text style={styles.timeDisplayText}>{String(timeHour).padStart(2, '0')}</Text>
                  <Text style={styles.timeSeparatorText}>:</Text>
                  <Text style={styles.timeDisplayText}>{String(timeMinute).padStart(2, '0')}</Text>
                  <View style={styles.meridiemGroup}>
                    <TouchableOpacity
                      style={[styles.meridiemButton, timeMeridiem === 'AM' && styles.meridiemButtonActive]}
                      onPress={() => setTimeMeridiem('AM')}
                    >
                      <Text style={[styles.meridiemText, timeMeridiem === 'AM' && styles.meridiemTextActive]}>a.m.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.meridiemButton, timeMeridiem === 'PM' && styles.meridiemButtonActive]}
                      onPress={() => setTimeMeridiem('PM')}
                    >
                      <Text style={[styles.meridiemText, timeMeridiem === 'PM' && styles.meridiemTextActive]}>p.m.</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.clockFaceWrap}>
                  <View style={styles.clockFace}>
                    {clockNumbers.map((value, index) => {
                      const angle = index * 30 - 90;
                      const radius = 105;
                      const x = 120 + Math.cos((angle * Math.PI) / 180) * radius;
                      const y = 120 + Math.sin((angle * Math.PI) / 180) * radius;

                      return (
                        <TouchableOpacity
                          key={value}
                          style={[styles.clockNumber, { left: x - 14, top: y - 14 }, timeHour === value && styles.clockNumberActive]}
                          onPress={() => setTimeHour(value)}
                        >
                          <Text style={[styles.clockNumberText, timeHour === value && styles.clockNumberTextActive]}>{value}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    <View style={styles.clockCenter} />
                    <View
                      style={[
                        styles.clockHand,
                        { transform: [{ rotate: `${(timeHour % 12) * 30}deg` }] },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.minuteRow}>
                  {minuteSteps.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[styles.minuteButton, timeMinute === minute && styles.minuteButtonActive]}
                      onPress={() => setTimeMinute(minute)}
                    >
                      <Text style={[styles.minuteButtonText, timeMinute === minute && styles.minuteButtonTextActive]}>{String(minute).padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.timeDoneButton} onPress={handleTimeCommit}>
                  <Text style={styles.timeDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
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
  fieldStack: {
    width: '100%',
    gap: 12,
    marginBottom: 12,
  },
  fieldWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  fieldWithIconText: {
    flex: 1,
    color: '#1f1f1f',
    fontSize: 15,
  },
  fieldPlaceholderText: {
    color: '#9aa0a6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarSheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  calendarHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarNavText: {
    fontSize: 28,
    color: '#333',
    fontWeight: '600',
  },
  calendarTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  weekRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: 32,
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
  },
  calendarGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dateCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  dateCellMuted: {
    opacity: 0.35,
  },
  dateCellSelected: {
    backgroundColor: '#2b9cff',
  },
  dateCellText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  dateCellTextSelected: {
    color: '#fff',
  },
  yearListWrap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  yearOption: {
    width: '30%',
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
  },
  yearOptionActive: {
    backgroundColor: '#2b9cff',
  },
  yearOptionText: {
    color: '#333',
    fontWeight: '600',
  },
  yearOptionTextActive: {
    color: '#fff',
  },
  calendarOkButton: {
    marginTop: 14,
    width: '100%',
    backgroundColor: '#9a9a9a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  calendarOkText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  timeSheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#2c2724',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  timeSheetTitle: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    color: '#f5f5f5',
    fontSize: 14,
    fontWeight: '500',
  },
  timeDisplayRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  timeDisplayText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 52,
  },
  timeSeparatorText: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  meridiemGroup: {
    flexDirection: 'row',
    marginLeft: 16,
    backgroundColor: '#4a423d',
    borderRadius: 24,
    padding: 4,
  },
  meridiemButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  meridiemButtonActive: {
    backgroundColor: '#d5d5d5',
  },
  meridiemText: {
    color: '#d8d8d8',
    fontWeight: '600',
  },
  meridiemTextActive: {
    color: '#2c2724',
  },
  clockFaceWrap: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  clockFace: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#3b3532',
    position: 'relative',
  },
  clockNumber: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockNumberActive: {
    backgroundColor: '#f2a47a',
  },
  clockNumberText: {
    color: '#f4f4f4',
    fontSize: 16,
    fontWeight: '700',
  },
  clockNumberTextActive: {
    color: '#2c2724',
  },
  clockCenter: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#f2a47a',
    borderRadius: 8,
    left: 112,
    top: 112,
  },
  clockHand: {
    position: 'absolute',
    width: 4,
    height: 80,
    left: 118,
    top: 44,
    backgroundColor: '#f2a47a',
    borderRadius: 4,
  },
  minuteRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  minuteButton: {
    width: 44,
    height: 32,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minuteButtonActive: {
    backgroundColor: '#f2a47a',
  },
  minuteButtonText: {
    color: '#333',
    fontWeight: '700',
  },
  minuteButtonTextActive: {
    color: '#2c2724',
  },
  timeDoneButton: {
    width: '100%',
    backgroundColor: '#e3e3e3',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeDoneText: {
    color: '#2c2724',
    fontWeight: '700',
    fontSize: 16,
  },
  smallAction: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
});