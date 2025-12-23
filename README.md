Carpool Coordinator :
    A simple carpool management application where drivers can create rides and passengers can request to join, with real-time request handling.

Features :
    Authentication (Frontend only) :
        Login with Name, Email, Mobile
        Select role:
            Driver
            Passenger

    Driver Features :
        Create a ride with:
            From location
            To location
            Date & time
            Available seats
        View My Rides
            See pending join requests
            Accept or reject passenger requests
        Automatically:
            Decrease seat count on accept
        View:
            Accepted passengers (with contact details)
            Rejected passengers

    Passenger Features :
        View available rides
        Join a ride by sending a request
        See request status :
            pending
            accepted
            rejected
        Cannot join:
            Past rides
            Full rides
            Same ride twice

Tech Stack :
    Frontend
        React Native
        Functional components
        Hooks (useState, useEffect)
        Fetch API
    
    Backend
        FastAPI
        Pydantic models
        In-memory data storage
        REST APIs
        CORS enabled

API Endpoints
    Create Ride - POST /create-ride
    Get All Rides - GET /rides
    Join Ride - POST /join-ride/{ride_id}
    Handle Join Request (Driver) - POST /handle-request/{ride_id}

Known Limitations
    Data is in-memory (resets on backend restart)
    No real authentication
    No database persistence
    No pagination or search yet

Future Enhancements
    Database (SQLite / PostgreSQL)
    JWT authentication
    Ride filters & search
    Push notifications
    Ride cancellation
    Seat locking logic

How to Run
    Backend
        uvicorn main:app --reload

    Frontend
        npm start

Carpool Coordinator
    Built as a learning project using React Native & FastAPI.