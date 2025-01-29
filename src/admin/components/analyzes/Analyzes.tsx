import { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, Grid, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { CalendarToday, AccessTime, LocationOn, Cancel, Block } from '@mui/icons-material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { tr } from 'date-fns/locale';
import { Facility } from '@/interfaces/Facility';
import { Court } from '@/interfaces/Court';
import { TimeSlot } from '@/interfaces/admin/TimeSlot';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { Reservation } from '@/interfaces/admin/Reservation';
import { getFormattedDate } from '@/services/TimeServices';
import { getIdFromToken } from '@/services/DecodedJwt';


const ReservationCardBlock = ({ reservation, status }: { reservation:Reservation, status: string }) => (

  <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 3, transition: '0.3s', '&:hover': { boxShadow: 6 }, p: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {reservation.firstName} {reservation.lastName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {reservation.phoneNumber}
          </Typography>
        </Box>
        <Chip
          label={status === 'CANCELLED' ? 'İptal' : 'Reddedildi'}
          color={status === 'CANCELLED' ? 'error' : 'warning'}
          icon={status === 'CANCELLED' ? <Cancel /> : <Block />}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarToday sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="body2">{reservation.date}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime sx={{ color: 'success.main', mr: 1 }} />
          <Typography variant="body2">{reservation.hour}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOn sx={{ color: 'error.main', mr: 1 }} />
          <Typography variant="body2">{reservation.courtName}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Analyzes = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState('iptal');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [facility, setFacility] = useState<Facility | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court>();
  const [courts, setCourts] = useState<Court[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [cancelledReservations, setCancelledReservations] = useState<Reservation[]>([]);
  const [rejectedReservations, setRejectedReservations] = useState<Reservation[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const authState = useAuth();

  interface ResponseData {
    date: string;
    timeSlots: TimeSlot[];
  }

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/account/${userId}`);
      return response.data;  // response.data, kullanıcı bilgilerini içeriyor
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;  // hata durumunda null döndür
    }
  };

  useEffect(() => {
    console.log(facility)
    console.log(timeSlots)
    const fetchFacility = async () => {
      try {
        const facilityResponse = await axios.get(
          `${apiUrl}/api/v1/facilities?userId=${
            getIdFromToken(authState.user?.access_token).sub
          }`,
          {}
        );

        console.log(facilityResponse.data);
        console.log("facility printed");
        setFacility(facilityResponse.data);
        setCourts(facilityResponse.data[0].courts);
        setSelectedCourt(facilityResponse.data[0].courts[0]);
      } catch (err) {
        console.error('Error fetching facilities:', err);
      }
    };

    fetchFacility();
  }, []);



  const fetchTimeSlots = async (date: string, courtId: string) => {
    try {
      const response = await axios.get<ResponseData>(
        `${apiUrl}/api/v1/reservations/slots-rich/${courtId}/${date}`,
        {
          headers: {
            Authorization: `Bearer ${authState.user?.access_token}`,
          },
        }
      );

      console.log("Raw time slots response:", response);

      const processedTimeSlots = response.data.timeSlots.map((slotGroup: any) => {
        if (slotGroup.length === 1) {
          return slotGroup[0];
        } else {
          return slotGroup.find(
            (slot: TimeSlot) =>
              slot.reservable !== null &&
              (slot.reservable.status === "CANCELLED" || slot.reservable.status === "REJECTED")
          ) || null;
        }
      });

      console.log("Processed time slots:", processedTimeSlots);
      setTimeSlots(processedTimeSlots);

      // CANCELLED rezervasyonları işle
      const cancelledReservations = await Promise.all(
        processedTimeSlots
          .filter((slot) => slot?.reservable?.status === "CANCELLED")
          .map(async (reservation) => {
            const userDetails = await fetchUserDetails(reservation.reservable.userId);
            return {
              id: reservation.reservable.id,
              date: reservation.reservable.date,
              hour: reservation.reservable.hour,
              firstName: userDetails?.firstName || '',
              lastName: userDetails?.lastName || '',
              phoneNumber: userDetails?.phoneNumber || '',
              courtName: selectedCourt?.name || '',
            };
          })
      );
      setCancelledReservations(cancelledReservations);

      // REJECTED rezervasyonları işle
      const rejectedReservations = await Promise.all(
        processedTimeSlots
          .filter((slot) => slot?.reservable?.status === "REJECTED")
          .map(async (reservation) => {
            const userDetails = await fetchUserDetails(reservation.reservable.userId);
            return {
              id: reservation.reservable.id,
              date: reservation.reservable.date,
              hour: reservation.reservable.hour,
              firstName: userDetails?.firstName || '',
              lastName: userDetails?.lastName || '',
              phoneNumber: userDetails?.phoneNumber || '',
              courtName: selectedCourt?.name || '',
            };
          })
      );
      setRejectedReservations(rejectedReservations);

      console.log("Cancelled reservations:", cancelledReservations);
      console.log("Rejected reservations:", rejectedReservations);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };


  useEffect(() => {
    console.log("Selected date:", selectedDate);
    const formattedDate = getFormattedDate(selectedDate);
    console.log("Formatted date:", formattedDate);
    console.log("Selected court:", selectedCourt?.id);



    if (selectedCourt && selectedDate) {
      fetchTimeSlots(formattedDate, String(selectedCourt.id));
    }
  }, [selectedDate, selectedCourt]);


  const handleCourtChange = (courtId: string) => {
    const selectedCourt = courts.find((court) => String(court.id) === String(courtId));
    setSelectedCourt(selectedCourt);
  };

  const handleDateChange = (date: Date | null, event?: React.SyntheticEvent) => {
    console.log(event)
    if (date) {
      setSelectedDate(date);
    }
  };


  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        Halısaha reservation Yönetimi
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant={activeTab === 'iptal' ? 'contained' : 'outlined'}
          color="error"
          onClick={() => setActiveTab('iptal')}
          sx={{ mr: 1 }}
        >
          İptal Edilenler ({cancelledReservations.length})
        </Button>
        <Button
          variant={activeTab === 'reddedildi' ? 'contained' : 'outlined'}
          color="warning"
          onClick={() => setActiveTab('reddedildi')}
        >
          Reddedilenler ({rejectedReservations.length})
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mb: 3 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="saha-select-label">Saha Seç</InputLabel>
          <Select
            labelId="saha-select-label"
            id="saha-select"
            value={String(selectedCourt?.id)}
            label="Saha Seç"
            onChange={(event) => handleCourtChange(event.target.value)} // Burada sadece court ID'sini iletiyoruz
            sx={{
              '& .MuiSelect-outlined': { borderRadius: 2 },
            }}
          >
            {courts.map((court) => (
              <MenuItem key={court.id} value={court.id}>
                {court.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            customInput={
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#90caf9',
                  color: '#000',
                  '&:hover': { backgroundColor: '#64b5f6' },
                  borderRadius: 2,
                }}
              >
                Tarih Seç
              </Button>
            }
            locale={tr}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {activeTab === 'iptal' &&
          cancelledReservations.map((reservation) => (
            <Grid item xs={12} sm={6} key={reservation.id}>
              <ReservationCardBlock reservation={reservation} status={"CANCELLED"} />
            </Grid>
          ))}
        {activeTab === 'reddedildi' &&
          rejectedReservations.map((reservation) => (
            <Grid item xs={12} sm={6} key={reservation.id}>
              <ReservationCardBlock reservation={reservation} status={"REJECTED"} />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default Analyzes;
