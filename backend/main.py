from fastapi import FastAPI, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

rides = []

class CreateRideBody(BaseModel):
    driver: str
    from_location: str
    to_location: str
    time: str
    seats: int

class JoinRequest(BaseModel):
    passenger_name: str
    passenger_email: str
    passenger_mobile: str
    status: str

class Ride(BaseModel):
    ride_id: int
    driver: str
    from_location: str
    to_location: str
    time: str
    seats: int
    join_requests: List[JoinRequest] = []

class JoinRideBody(BaseModel):
    passenger_name: str
    passenger_email: str
    passenger_mobile: str

class HandleRequestBody(BaseModel):
    passenger_name: str
    action: str

@app.post("/create-ride")
def create_ride(body: CreateRideBody):
    ride = Ride(
        ride_id=len(rides),
        driver=body.driver,
        from_location=body.from_location,
        to_location=body.to_location,
        time=body.time,
        seats=body.seats,
        join_requests=[]
    )
    rides.append(ride)
    return {"message": "Ride created", "ride_id": ride.ride_id}

@app.get("/rides")
def get_rides():
    return rides

@app.post("/join-ride/{ride_id}")
def join_ride(ride_id: int, body: JoinRideBody):
    ride = next(r for r in rides if r.ride_id == ride_id)
    if any(req.passenger_name == body.passenger_name for req in ride.join_requests):
        return {"message": "Already requested"}
    ride.join_requests.append(
        JoinRequest(
            passenger_name=body.passenger_name,
            passenger_email=body.passenger_email,
            passenger_mobile=body.passenger_mobile,
            status="pending"
        )
    )
    return {"message": "Join request sent"}

@app.post("/handle-request/{ride_id}")
def handle_request(ride_id: int, body: HandleRequestBody):
    ride = next(r for r in rides if r.ride_id == ride_id)
    for req in ride.join_requests:
        if req.passenger_name == body.passenger_name:
            if body.action == "accept":
                req.status = "accepted"
                ride.seats -= 1
            elif body.action == "reject":
                req.status = "rejected"
            return {"message": "Request updated"}
    return {"message": "Request not found"}