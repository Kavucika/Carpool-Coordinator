## About

Carpool Coordinator is a full-stack carpool management application built with React Native and FastAPI. It allows drivers to create rides and manage passenger requests, while passengers can discover available rides and request to join them.

The application includes a deployed FastAPI backend and an installable Android build created with Expo EAS.

## Live Demo

- **Backend API:** https://carpool-coordinator-api.onrender.com
- **Swagger API Documentation:** https://carpool-coordinator-api.onrender.com/docs
- **Android APK:** https://expo.dev/accounts/kavucika/projects/carpool-app/builds/e4d6a1fb-cc53-451e-9e4c-392627e09cd4

## Features :
    User Authentication (Client-side) :
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

## Tech Stack :
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

## Deployment

- **Frontend:** Android APK built using Expo EAS Build
- **Backend:** FastAPI deployed on Render
- **API Documentation:** FastAPI Swagger/OpenAPI
- **Communication:** REST API over HTTPS

## API Endpoints
    Create Ride - POST /create-ride
    Get All Rides - GET /rides
    Join Ride - POST /join-ride/{ride_id}
    Handle Join Request (Driver) - POST /handle-request/{ride_id}

## Known Limitations

- Ride data is currently stored in memory and resets when the backend restarts.
- Authentication is currently handled on the frontend and is not production-grade.
- No persistent database is currently configured.
- No pagination or ride search yet.

## Future Enhancements
    Database (SQLite / PostgreSQL)
    JWT authentication
    Ride filters & search
    Push notifications
    Ride cancellation
    Seat locking logic

## How to Run
    Backend
        uvicorn main:app --reload

    Frontend
        npm start

## Carpool Coordinator
    Built as a learning project using React Native & FastAPI.