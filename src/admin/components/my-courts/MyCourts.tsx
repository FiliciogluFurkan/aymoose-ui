import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Box,
  Typography,
  Snackbar,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grow,
} from '@mui/material';
import { tr } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { TimeSlot } from 'src/interfaces/admin/TimeSlot';
import { Court } from '@/interfaces/Court';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import { LocaleReservationUser } from '@/interfaces/admin/LocaleReservationUser';
import { Account } from '@/interfaces/Account';
import { Facility } from '@/interfaces/Facility';
import { getFormattedDate } from '@/services/TimeServices';
import { getIdFromToken } from '@/services/DecodedJwt';

const ReservationSystem = (): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState<Court>();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null);
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [facilityCourts, setFacilityCourts] = useState<Court[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const authState = useAuth();
  const [allTimeSlots, setAllTimeSlots] = useState<String[]>([]);
  const [facility, setFacility] = useState<Facility | null>(null);


  interface ResponseData {
    date: string;
    timeSlots: TimeSlot[];
  }

  useEffect(() => {
    console.log("Selected date:", selectedDate);
    const formattedDate = getFormattedDate(selectedDate);
    console.log("Formatted date:", formattedDate);

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

        // Gelen veriyi dönüştür: alt dizileri kontrol et ve doğru slotu seç
        const processedTimeSlots = response.data.timeSlots.map((slotGroup: any) => {
          if (slotGroup.length === 1) {
            // Alt dizide yalnızca 1 obje varsa, onu al
            return slotGroup[0];
          } else {
            // Alt dizide birden fazla obje varsa, `null` olmayanı al
            return slotGroup.find((slot: TimeSlot) => (slot.reservable !== null) && (slot.reservable.status === "APPROVED") || ((slot.reservable !== null) && (slot.reservable.type === "LOCAL"))) || slotGroup[0];
          }
        });

        console.log("Processed time slots:", processedTimeSlots);

        // İşlenmiş veriyi state'e ata
        setTimeSlots(processedTimeSlots);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    if (selectedCourt && selectedDate) {
      fetchTimeSlots(formattedDate, String(selectedCourt.id));
    }
  }, [selectedDate, selectedCourt]);



  useEffect(() => {
    const referenceTimes = Array.from({ length: 24 }, (_, index) =>
      `${index.toString().padStart(2, "0")}:00`
    );
    setAllTimeSlots(referenceTimes);
  }, []);



  useEffect(() => {

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
        setFacility(facilityResponse.data[0]);
        setFacilityCourts(facilityResponse.data[0].courts);
        setSelectedCourt(facilityResponse.data[0].courts[0]);

      } catch (err) {
        console.error('Error fetching facilities:', err);
      }
    };
    fetchFacility();
  }, []); // Bu sadece API çağrısını yapar


  const [userDetails, setUserDetails] = useState<{ [key: string]: Account }>({});
  const [localUserDetails, setLocalUserDetails] = useState<{ [key: string]: LocaleReservationUser }>({});
  const fetchUserDetails = async (userId: string) => {
    if (userDetails[userId]) return; // Eğer kullanıcı zaten yüklenmişse yeniden yükleme

    try {
      const response = await axios.get(`${apiUrl}/api/v1/account/${userId}`);
      setUserDetails((prev) => ({ ...prev, [userId]: response.data }));
      console.log("Kullanıcı bilgisi yüklendi:", response.data);
    } catch (error) {
      console.error("Kullanıcı bilgisi alınırken hata oluştu:", error);
    }
  };

  useEffect(() => {

    const processSlot = (slot: any) => {
      const reservable = slot.reservable;

      if (!reservable) return; // Eğer reservable boşsa işlem yapma

      // Eğer userId varsa, fetchUserDetails ile kullanıcı bilgilerini çek
      if (reservable.userId) {
        fetchUserDetails(reservable.userId);
      } else if (reservable.name && reservable.phoneNumber) {
        setLocalUserDetails((prev) => ({
          ...prev,
          [reservable.phoneNumber]: { name: reservable.name, phoneNumber: reservable.phoneNumber },
        }));
      }

    };

    // Tüm slotları işleme al
    timeSlots.forEach(processSlot);
  }, [timeSlots]);




  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setSnackbarMessage(`Seçilen tarih: ${date.toLocaleDateString()}`);
      setOpenSnackbar(true);
    }
  };

  const handleCourtChange = (courtId: string) => {
    const selected = facilityCourts.find(court => String(court.id) === courtId);
    setSelectedCourt(selected);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setUserName('');
    setUserSurname('');
    setUserPhone('');
  };

  const handleDialogSubmit = async () => {
    console.log("Current slot index:", currentSlotIndex);

    // Eğer currentSlotIndex geçerli değilse işlemi durdur.
    if (currentSlotIndex === null || currentSlotIndex === undefined) {
      console.error("No slot selected!");
      return;
    }

    // Saat değerini dönüştür
    const rawHour = allTimeSlots[currentSlotIndex]; // Örneğin "18:00"
    const hourAsNumber = parseInt(rawHour.split(":")[0], 10); // "18" -> 18

    // İstek gövdesi oluşturuluyor
    const requestBody = {
      courtId: selectedCourt?.id,
      fullName: userName ? `${userName} ${userSurname}` : "",
      phoneNumber: userPhone,
      date: getFormattedDate(selectedDate), // YYYY-MM-DD formatında olmalı
      hour: hourAsNumber, // Sadece sayı olarak saat
    };

    console.log("Request Body:", requestBody);

    try {
      // POST isteği atılıyor
      const response = await axios.post(`${apiUrl}/api/v1/reservations?type=local`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.user?.access_token}`, // Eğer JWT token gerekiyorsa ekleyin
        },
      });

      console.log("Reservation Response:", response.data);
      alert("Rezervasyon Başarılı bir şekilde oluşturuldu!");

      // Eğer backend başarılı dönerse slot bilgisini güncelle

      handleDialogClose(); // Dialog kapatılır
    } catch (error) {
      console.error("Error while submitting the reservation:", error);
      alert("Failed to create reservation. Please try again.");
    }
  };



  const handleStatusChange = (index: number) => {
    console.log("Current slot index:", index);
    console.log("Time slots:", timeSlots[index]);
    if ((timeSlots[index].reservable?.type !== 'DEFAULT' && timeSlots[index].reservable?.type !== 'LOCAL') || timeSlots[index].reservable?.status === "CANCELLED") {
      setCurrentSlotIndex(index);
      setOpenDialog(true);
    } else {
      // Rezervasyonu iptal etmeden önce onay al
      setCurrentSlotIndex(index);
      setOpenConfirmationDialog(true);
    }
  };

  const handleConfirmationDialogClose = async (confirm: boolean) => {
    setOpenConfirmationDialog(false);  // Onay kutusunu kapat

    if (confirm && currentSlotIndex !== null) {
      const slot = timeSlots[currentSlotIndex];
      console.log("Current slot:", slot);
      console.log("Current slot index:", currentSlotIndex);
      console.log("reservation id:", slot.reservable?.id);
      // `DEFAULT` veya `LOCAL` tipi için uygun işlemi yap
      if (slot.reservable?.type === 'DEFAULT') {
        // `DEFAULT` tipinde rezervasyon iptali için PATCH isteği
        try {
          const response = await axios.patch(
            `${apiUrl}/api/v1/reservation/${slot.reservable.id}/cancel`,
            {
              headers: {
                Authorization: `Bearer ${authState.user?.access_token}`,
              },
            }
          );

          console.log("Reservation canceled (DEFAULT):", response.data);

          // İptal işleminden sonra state'i güncelle
          setTimeSlots((prevSlots) => {
            const newSlots = [...prevSlots];
            newSlots[currentSlotIndex] = { ...slot, reservable: null };  // Slotu boşalt
            return newSlots;
          });
        } catch (error) {
          console.error("Error canceling reservation (DEFAULT):", error);
        }
      } else if (slot.reservable?.type === 'LOCAL') {
        // `LOCAL` tipinde rezervasyon silme için DELETE isteği
        try {
          const response = await axios.delete(
            `${apiUrl}/api/v1/reservation/${slot.reservable.id}/delete-local`,
            {
              headers: {
                Authorization: `Bearer ${authState.user?.access_token}`,
              },
            }
          );


          console.log("Local reservation deleted:", response.data);

          // Silme işleminden sonra state'i güncelle
          setTimeSlots((prevSlots) => {
            const newSlots = [...prevSlots];
            newSlots[currentSlotIndex] = { ...slot, reservable: null };  // Slotu boşalt
            return newSlots;
          });
        } catch (error) {
          console.error("Error deleting local reservation:", error);
        }
      }
    }
  };


  return (
    <Box
      sx={{
        margin: 2,
        padding: 2,
        border: '1px solid #ccc',
        borderRadius: 2,
        backgroundColor: '#424242',
        color: '#fff',
        '& .MuiInputLabel-root': { color: '#90caf9' },
        '& .MuiSelect-root': { color: '#fff' },
        '& .MuiIconButton-root': { color: '#90caf9' }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h4"
          sx={{ color: '#90caf9', fontFamily: 'Roboto, sans-serif' }}
          gutterBottom
        >
          Halısaha Rezervasyon Sistemi
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: '#f48fb1', fontFamily: 'Roboto, sans-serif' }}
        >
          Seçilen Tarih: {selectedDate.toLocaleDateString()}
        </Typography>
      </Box>
      <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: '#90caf9' }}>Saha Seç</InputLabel>
          <Select
            value={String(selectedCourt?.id) || ''}
            onChange={(event) => handleCourtChange(event.target.value)} // Sadece courtId ile çağırıyoruz
            displayEmpty
            label="Saha Seç"
            sx={{
              backgroundColor: '#2c2c2c',
              color: '#fff',
              '& .MuiSelect-icon': { color: '#90caf9' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#90caf9',
                borderWidth: 2,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#64b5f6',
              },
            }}
          >
            {facilityCourts.map(court => (
              <MenuItem
                key={court.id}
                value={court.id}
                sx={{
                  backgroundColor: selectedCourt?.id === court.id ? '#3c3c3c' : '#2c2c2c',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#4c4c4c',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#3c3c3c',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#4c4c4c',
                    },
                  },
                }}
              >
                {court.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '4rem' }}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => handleDateChange(date)}
            customInput={
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#90caf9',
                  color: '#000',
                  '&:hover': { backgroundColor: '#64b5f6' }
                }}
              >
                Tarih Seç
              </Button>
            }
            locale={tr}
          />
        </Box>
      </Box>
      <Dialog
        open={openConfirmationDialog}
        onClose={() => setOpenConfirmationDialog(false)}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#424242", // Arka plan rengini ve opaklık değerini ayarlayın
          }
        }}
      >
        <DialogTitle sx={{ color: "#ffffff" }}>Rezervasyonu İptal Etmek İstediğinizden Emin Misiniz?</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleConfirmationDialogClose(false)} color="primary">
            Hayır
          </Button>
          <Button onClick={() => handleConfirmationDialogClose(true)} color="primary">
            Evet
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 2 }}>
        {timeSlots.map((slot, index) => {
          const defaultUser = slot.reservable?.userId
            ? userDetails[slot.reservable.userId]
            : null;
          const localUser = slot.reservable?.phoneNumber
            ? localUserDetails[slot.reservable.phoneNumber]
            : null;

          const user = defaultUser || localUser;

          const isOutsideWorkingHours =
            typeof facility?.openTime === "number" &&
            typeof facility?.closeTime === "number" &&
            (index < facility.openTime || index >= facility.closeTime);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

          const isPastReservation = selectedDateObj && selectedDateObj < today;

          const isCancelled = slot.reservable?.status === "CANCELLED";
          const isApproved = slot.reservable?.status === "APPROVED";

          return (
            <Grow in={true} key={index}>
              <Box
                sx={{
                  padding: 2,
                  border: "1px solid",
                  borderRadius: 2,
                  backgroundColor: isCancelled
                    ? "#c8e6c9"
                    : isPastReservation || isOutsideWorkingHours
                      ? "#e0e0e0"
                      : isApproved || slot.reservable?.type === "LOCAL"
                        ? "#ffcdd2" // Kırmızı renk, "APPROVED" rezervasyonlar için
                        : "#c8e6c9",
                  flex: "1 1 calc(16.66% - 16px)",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "180px",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ color: "#000" }}>
                    {allTimeSlots[index]}
                  </Typography>
                  <Typography sx={{ color: "#000" }}>
                    {isOutsideWorkingHours
                      ? "Randevu yapılamaz, çalışma saatleri dışındadır."
                      : isCancelled
                        ? "Boş"
                        : isApproved || slot.reservable?.type === "LOCAL"
                          ? "Dolu"
                          : "Boş"
                    }
                  </Typography>
                </Box>
                <Box sx={{ marginTop: 1 }}>
                  {!isOutsideWorkingHours && user && !isCancelled && isApproved || !isOutsideWorkingHours && user && !isCancelled && slot.reservable?.type === "LOCAL" ? (
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        <Typography variant="body2" sx={{ color: "#000" }}>
                          {defaultUser
                            ? `${defaultUser.firstName} ${defaultUser.lastName}`
                            : localUser?.name || "Bilinmiyor"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon fontSize="small" />
                        <Typography variant="body2" sx={{ color: "#000" }}>
                          {!user.phoneNumber ? "numara girilmedi" : user.phoneNumber}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: isOutsideWorkingHours ? "#666" : "#000",
                      }}
                    >
                      {isOutsideWorkingHours
                        ? ""
                        : "Henüz randevu yapılmamıştır."}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  onClick={() => handleStatusChange(index)}
                  disabled={isOutsideWorkingHours || !!isPastReservation}
                  sx={{
                    color: isOutsideWorkingHours
                      ? "#9e9e9e"
                      : isCancelled
                        ? "#4caf50"
                        : isApproved || slot.reservable?.type === "LOCAL"
                          ? "#f44336" // Kırmızı renk, "APPROVED" rezervasyonlar için
                          : "#4caf50",
                    "&:hover": {
                      backgroundColor: !isOutsideWorkingHours
                        ? slot.reservable?.type === "DEFAULT" || isCancelled
                          ? "rgba(76, 175, 80, 0.1)"
                          : "rgba(244, 67, 54, 0.1)"
                        : "transparent",
                    },
                  }}
                >
                  {isOutsideWorkingHours ? (
                    <BlockIcon />
                  ) : isCancelled || (!isApproved && !(slot.reservable?.type === "LOCAL")) ? (
                    <CheckCircleIcon />
                  ) : (
                    <CancelIcon />
                  )}
                </IconButton>
              </Box>
            </Grow>
          );
        })}
      </Box>




      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        action={
          <Button
            color="secondary"
            size="small"
            onClick={() => setOpenSnackbar(false)}
            sx={{ color: '#f48fb1' }}
          >
            Kapat
          </Button>
        }
      />

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#424242',
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ color: '#90caf9' }}>Rezervasyon Yap</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ad"
            type="text"
            fullWidth
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: '#90caf9' },
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#90caf9' },
                '&:hover fieldset': { borderColor: '#64b5f6' }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Soyad"
            type="text"
            fullWidth
            value={userSurname}
            onChange={(e) => setUserSurname(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: '#90caf9' },
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#90caf9' },
                '&:hover fieldset': { borderColor: '#64b5f6' }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Telefon"
            type="tel"
            fullWidth
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: '#90caf9' },
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#90caf9' },
                '&:hover fieldset': { borderColor: '#64b5f6' }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            sx={{ color: '#f44336' }}
          >
            İptal
          </Button>
          <Button
            onClick={handleDialogSubmit}
            sx={{ color: '#90caf9' }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReservationSystem;