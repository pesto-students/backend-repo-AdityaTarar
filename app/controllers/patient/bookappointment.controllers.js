const db = require("../../models");
const Doctor = db.doctor
const Appointments = db.appointments
const DoctorAvailability = db.doctorsAvailability
const VideoConference = db.videoConference
const Payments = db.payments
var axios = require("axios").default;
const moment = require('moment');
var CryptoJS = require("crypto-js");

const accountSid = process.env.TWILIO_SID_TOKEN;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

exports.doctorSearch = async (req, res) => {
  try {
    const { specialization, name, city } = req.query;

    const currentDate = moment().format('YYYY-MM-DD');

    const pipeline = [];

    // Match specialization
    if (specialization) {
      pipeline.push({ $match: { specialization } });
    }

    // Match city
    if (city) {
      pipeline.push({ $match: { city } });
    }

    // Match name
    if (name) {
      const nameFilter = {
        $or: [
          { first_name: { $regex: new RegExp(name, 'i') } },
          { last_name: { $regex: new RegExp(name, 'i') } },
        ],
      };
      pipeline.push({ $match: nameFilter });
    }

    // Lookup DoctorAvailability documents
    pipeline.push({
      $lookup: {
        from: 'doctoravailabilities',
        let: { doctorId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$doctorId', '$$doctorId'] },
                  { $gte: ['$availability.date', currentDate] },
                ],
              },
            },
          },
        ],
        as: 'availability',
      },
    });

    // Match doctors with future availability
    pipeline.push({
      $match: {
        $expr: { $gt: [{ $size: '$availability' }, 0] },
      },
    });

    // Exclude password field
    pipeline.push({ $project: { password: 0 } });

    // Aggregate the results
    const doctors = await Doctor.aggregate(pipeline);

    if (!doctors || doctors.length === 0) {
      return res.status(200).json({ message: 'No doctors found with the specified criteria.' });
    }

    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.bookApoointmentController = async (req, res) => {
  const { appointmentData } = req.body

  var bytes = CryptoJS.AES.decrypt(appointmentData, "pestohealth");
  var formData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  const { doctorId, date, time } = formData
  try {
    const doctorDetails = await Doctor.findById(doctorId)
    const appointment = new Appointments({
      doctorId: formData.doctorId,
      patientId: formData.patientId,
      date: formData.date,
      time: formData.time,
      onlineConsultation: formData.onlineConsultation,
      location: formData.location,
      status: formData.status,
      patientInfo: formData.patientInfo,
      paymentMode: formData.paymentMode,
      paymentId: formData.paymentId,
      issue: formData.issue,
      consultationFee: formData.consultationFee,
      doctorDetails: doctorDetails
    });
    const appointmentResponse = await appointment.save()

    if (appointmentResponse?.onlineConsultation) {
      var options = {
        method: 'POST',
        url: 'https://api.dyte.io/v2/meetings',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic MTRiMzA3YzktNGJiZS00MjM1LTgyYWYtYjNjOWU5MzU4Nzg2OmZkODQ5ZjliZjQ2MGJmY2E2NmU0'
        },
        data: {
          title: `Meeting with ${appointmentResponse?.patientInfo?.full_name}`,
          preferred_region: 'ap-south-1',
          record_on_start: false,
          live_stream_on_start: false,
          recording_config: {
            max_seconds: 60,
            file_name_prefix: 'string',
            video_config: {
              codec: 'H264',
              width: 1280,
              height: 720,
              watermark: { url: 'http://example.com', size: { width: 1, height: 1 }, position: 'left top' }
            },
            audio_config: { codec: 'AAC', channel: 'stereo' },
            storage_config: {
              type: 'aws',
              access_key: 'string',
              secret: 'string',
              bucket: 'string',
              region: 'us-east-1',
              path: 'string',
              auth_method: 'KEY',
              username: 'string',
              password: 'string',
              host: 'string',
              port: 0,
              private_key: 'string'
            },
            dyte_bucket_config: { enabled: true },
            live_streaming_config: { rtmp_url: 'rtmp://a.rtmp.youtube.com/live2' }
          }
        }
      };

      axios.request(options).then(async function (response) {
        if (response?.data?.success) {
          const conferenceDetails = new VideoConference({
            patientId: appointmentResponse.patientId,
            doctorId: appointmentResponse.doctorId,
            appointmentId: appointmentResponse._id,
            meetingInfo: response?.data?.data
          })
          await conferenceDetails.save()
        }
        console.log('response.data', response.data);
      }).catch(function (error) {
        console.error(error);
      });
    }
    await DoctorAvailability.findOneAndUpdate(
      { doctorId, 'availability.date': date },
      {
        $push: {
          'availability.$.unavailableTimeSlots': time
        }
      },
      { new: true }
    );


    console.log('appointmentResponse', appointmentResponse);

    const responseData = {
      appointmentId: appointment.appointmentId, // Assuming appointmentId is a field in your Appointments model
      patientInfo: appointment.patientInfo,
      date: appointment.date,
      time: appointment.time,
      doctorId: appointment?.doctorId,
      doctorDetails: doctorDetails
    };
    const payments = new Payments({
      appointmentId: appointment?._id,
      doctorId: formData.doctorId,
      patientId: formData.patientId,
      orderId: formData.paymentId,
      paymentDate: moment(new Date()).format('LLL'),
      paymentMode: formData.paymentMode,
      paymentStatus: formData.paymentMode === 'Online' ? 'Success' : 'Pending',
      consultationMode: formData.onlineConsultation ? 'Online' : 'In Clinic',
      paymentId: formData.paymentId,
      consultationFee: formData.consultationFee
    });
    await payments.save()

    res.status(201).json({ data: responseData, message: 'Appointmnet has been created successfully' })
    // if (appointmentResponse) {
    //   const messageBody = `Appointment booked successfully with ${`Dr .${doctorDetails.first_name} ${doctorDetails.last_name}`} on ${appointmentResponse.date} at ${appointmentResponse.time}.`;
    //   client.messages
    //     .create({
    //       body: messageBody,
    //       to: '+918412962312',
    //       from: '+13145495492'
    //     })
    //     .then(message => console.log(message.sid))
    //     .done();
    // }
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.cancelAppointment = async (req, res) => {
  const { appointmentId, doctorId, date, time } = req.body
  console.log('cancelAppointment', appointmentId, doctorId, date, time);
  try {
    const updateAppointment = await Appointments.findOneAndUpdate({ appointmentId: appointmentId }, {
      status: 'cancelled'
    }, { new: true })
    if (!updateAppointment) {
      return res.status(404).send({ message: 'Appointment not found' })
    }
    await DoctorAvailability.findOneAndUpdate(
      { doctorId, 'availability.date': date },
      {
        $pull: {
          'availability.$.unavailableTimeSlots': time
        }
      },
      { new: true }
    );
    res.status(200).send({ message: 'Appointment canclled successfully' })
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.recheduleAppointment = async (req, res) => {
  const { appointmentId, newDate, newTime, oldDate, oldTime, doctorId } = req.body;
  try {
    // First, update the appointment itself with the new date and time
    const updateAppointment = await Appointments.findOneAndUpdate({ appointmentId: appointmentId }, {
      date: newDate,
      time: newTime,
      status: 'recheduled'
    }, { new: true });

    if (!updateAppointment) {
      return res.status(404).send({ message: 'Appointment not found' });
    }

    // If the date has changed, remove the old time slot from the old date
    if (newDate !== oldDate) {
      await DoctorAvailability.findOneAndUpdate(
        { doctorId, 'availability.date': oldDate },
        {
          $pull: {
            'availability.$.unavailableTimeSlots': oldTime
          }
        }
      );
      // Add the new time slot to the new date
      await DoctorAvailability.updateOne(
        { doctorId, 'availability.date': newDate },
        {
          $push: {
            'availability.$.unavailableTimeSlots': newTime
          }
        },
        { upsert: true } // This will add a new date if it doesn't exist
      );
    } else {
      // If the date hasn't changed, just update the time slot
      await DoctorAvailability.findOneAndUpdate(
        { doctorId, 'availability.date': newDate },
        {
          $pull: {
            'availability.$.unavailableTimeSlots': oldTime
          },
          $push: {
            'availability.$.unavailableTimeSlots': newTime
          }
        }
      );
    }

    res.status(200).send({ message: 'Appointment rescheduled successfully' });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getAppointmentStatusByID = async (req, res) => {
  const { appointmentId } = req.body;
  try {
    // Assuming appointmentId is a valid ObjectId
    const appointment = await Appointments.findOne({ appointmentId: appointmentId });

    if (!appointment) {
      // If no appointment is found, return a 404 status with a message
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // If the appointment is found, return it in the response
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error searching appointment by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAppointmentByPatient = async (req, res) => {
  const { id, userType } = req.query;
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Get today's date in the format "YYYY-MM-DD"

    const appointmentsList = userType === 'patient' ? await Appointments.find({ patientId: id }) : await Appointments.find({ doctorId: id })
    if (!appointmentsList || appointmentsList.length === 0) {
      return res.status(200).json({
        upcomingAppointments: [],
        pastAppointments: [],
        message: 'No Appointments booked'
      });
    }

    // Separate appointments into past and upcoming based on the appointment date
    const pastAppointments = appointmentsList.filter(appointment => appointment.date < currentDate);
    const upcomingAppointments = appointmentsList.filter(appointment => appointment.date >= currentDate);

    // Sort past appointments by date in descending order
    pastAppointments.sort((a, b) => (a.date > b.date) ? -1 : 1);

    // Sort upcoming appointments by date in ascending order
    upcomingAppointments.sort((a, b) => (a.date > b.date) ? 1 : -1);

    // Create the final response object
    const response = {
      upcomingAppointments: upcomingAppointments.filter((appointment) => appointment.status !== 'cancelled'),
      pastAppointments: pastAppointments
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error searching appointment by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getVideoConferenceDetails = async (req, res) => {
  const { appointmentId } = req.body
  console.log('appointmentId', appointmentId);
  try {
    const details = await VideoConference.findOne({ appointmentId: appointmentId })
    if (!details) {
      return res.status(200).json({ message: 'No Appointments booked' })
    }
    res.status(200).json(details)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
exports.getAllDoctorList = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password')
    res.status(200).json(doctors)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });

  }
}
exports.fetchDoctorDetails = async (req, res) => {
  try {
    console.log('req.params.id', req.query.id);
    const doctorDetails = await Doctor.findOne(req.params.id).select('-password')
    res.status(200).json(doctorDetails)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });

  }
}