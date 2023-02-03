Drop Database hikeusers
Create Database hikeusers
\c hikeusers

Create Table users (
    username VarChar(25) Primary Key,
    password Text Not Null,
    first_name Text Not Null,
    last_name Text Not Null,
    email Text Not Null Check (position('@' In email) > 1),
    is_admin Boolean Not Null Default false
); 

Create Table usersHikes (
    user_id VarChar(25) REFERENCES users ON Delete Cascade,
    hike_id VarChar(25), 
    hike_name VarChar(25)
)