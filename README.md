## Authentication

Patient Sign-in: /api/auth/patient/signin
Allows patients to log into the application.
Doctor Sign-in: /api/auth/doctor/signin
Allows doctors to log into the application.
Patient Signup: /api/auth/patient/signup
Enables new patients to register.
Doctor Signup: /api/auth/doctor/signup
Enables new doctors to register.

## Profile Management

Update Patient Profile: /api/auth/updatePatientProfile
Patients can update their profile information.

## Appointment Management

Book Appointment: /api/doctor/bookappointment
Enables patients to book appointments with doctors.
Cancel Appointment: /api/doctor/cancelAppointment
Allows patients to cancel their appointments.
Reschedule Appointment: /api/doctor/recheduleAppointment
Enables patients to reschedule their appointments.

## Medical Records

Add Medication: /api/doctor/addMedication
Allows doctors to add medication prescriptions for patients.
Get Medication by Patient: /api/patient/getMedicationbyPatient
Retrieves a list of medications prescribed to a patient.

## Utilities

Search Doctors: /api/doctor/search
Facilitates searching for doctors by various criteria.
Refresh Token: /api/auth/refreshToken
Used to refresh the authentication token.
