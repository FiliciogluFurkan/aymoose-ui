import CourtManagement from '../court-management/CourtManagement';
import { useState } from 'react';
import { Facility } from 'src/interfaces/Facility';
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControlLabel,
} from '@mui/material';
import { FormControl, Switch, Alert } from '@mui/material';
import { Clock } from 'lucide-react';
import { Avatar } from '@mui/material';
import CourtServices from '../court-services/CourtServices';
import PhotographGallery from '../photograph-gallery/PhotographGallery';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { Account } from '@/interfaces/Account';
import { useRef } from 'react';
import { Modal } from '@mui/material';
import { getIdFromToken } from '@/services/DecodedJwt';

const ManageFacility = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState('genel');

  const authState = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;
  const tabs = [
    { id: 'genel', label: 'Genel Bilgiler' },
    { id: 'sahalar', label: 'Saha Yönetimi' },
    { id: 'ozellikler', label: 'Tesis Özellikleri' },
    { id: 'galeri', label: 'Fotoğraf Galerisi' },
  ];


 

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const facilityResponse = await axios.get(
          `${apiUrl}/api/v1/facilities?userId=${
            getIdFromToken(authState.user?.access_token).sub
          }`,
          {}
        );
          console.log("facility Response:::")
          console.log(facilityResponse);
        // Gelen veriyi formData'ya set et
        if (facilityResponse.data && facilityResponse.data.length > 0) {

          setOriginalData(facilityResponse.data[0]);
          setFacility(facilityResponse.data[0]);
        }
        console.log(facilityResponse);
      } catch (err) {
        console.error('Error fetching facilities:', err);
      }

    };

    fetchFacility();
  }, []);

  const [user, setUser] = useState<Account>();


  useEffect(() => {
    const fetchUser = async () => {
      const userId = getIdFromToken(authState.user?.access_token)?.sub;
      console.log("userId:");
      console.log(userId);

      try {
        const response = await axios.get(`${apiUrl}/api/v1/account/${userId}`, {
          headers: {
            Authorization: `Bearer ${authState.user?.access_token}`,
          },
        });
        console.log("User:");
        console.log(response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [authState.user?.access_token]);  // Sadece authState'deki token'a bağlı olarak güncelleme yapalım





  const [facility, setFacility] = useState<Facility>();
  const [originalData, setOriginalData] = useState<Facility>();
  const [isEdited, setIsEdited] = useState(false);

  const handleChange = (field: keyof Facility, value: string | boolean | Number) => {
    console.log(`Field: ${field}, Value: ${value}`);
    setFacility((prev) => {
      const updatedFacility = prev ? { ...prev, [field]: value } : prev;
      console.log('Before Update:', prev);
      console.log('After Update:', updatedFacility);
      return updatedFacility;
    });
    setIsEdited(true);
  };


  const handleReset = () => {
    setFacility(originalData);
    setIsEdited(false);
  };

  const saveEditedField = async () => {

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(facility)], { type: 'application/json' }));

    try {

      const response = await axios.patch(`${apiUrl}/api/v1/facilities/${facility?.id}`, formData,
        {
          headers: {
            'Authorization': `Bearer ${authState.user?.access_token}`,
            'Accept': 'application/json',
          },
        }
      );
      setIsEdited(false);
      console.log(response);
    }
    catch (error) {
      console.error('Error saving edited facility:', error);
    }
  };

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  // Profil bilgilerini API'den çekme
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = getIdFromToken(authState.user?.access_token)?.sub;
        console.log(userId)
        const response = await axios.get(`${apiUrl}/api/v1/account/${userId}`, {
          headers: {
            Authorization: `Bearer ${authState.user?.access_token}`,
          },
        });
        setUser(response.data);

        console.log(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (authState.user?.access_token) {
      fetchProfile();
    }
  }, [authState.user?.access_token]);

  // Profil fotoğrafını değiştirme işlemi
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Dosya kontrolü
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      // API'ye istek gönderimi
      const response = await axios.patch(
        `${apiUrl}/api/v1/account/my/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authState.user?.access_token}`,
          },
        }
      );

      // Fotoğraf başarılı bir şekilde yüklendiyse, modal'ı kapat
      setIsImageModalOpen(false);

      const imageUrl = URL.createObjectURL(file);

      // Kullanıcıyı güncelle (profil fotoğrafını geçici URL ile güncelle)
      setUser((prevUser) => {
        if (!prevUser) return prevUser; // Eğer prevUser undefined ise, değişiklik yapma
        return {
          ...prevUser,  // önceki kullanıcı verilerini koru
          profilePicture: imageUrl, // yeni profil fotoğrafını URL olarak güncelle
        };
      });


      // Kullanıcıyı güncelle (yeniden profil bilgilerini çekme)
      console.log("Image uploaded successfully:", response.data);
    } catch (error: any) {
      console.error("Error uploading image:", error);

      if (error.response) {
        console.error("Response error:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
    }
  };


  return (
    <Box minHeight="100vh" bgcolor="#f9fafb" p={4}>
      <Box maxWidth="lg" mx="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="bold">
            Tesis Yönetimi
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar alt="Kullanıcı Adı" src={user?.profilePicture} onClick={openImageModal} sx={{ cursor: 'pointer' }} />
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: 'text.primary',
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
          </Box>

          {/* Modal */}
          <Modal
            open={isImageModalOpen}
            onClose={closeImageModal}
            aria-labelledby="image-modal-title"
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 420,
                bgcolor: '#f9f9f9',
                borderRadius: '16px',
                boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.1)',
                border: 'none',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '90%',
              }}
            >
              <h2
                id="image-modal-title"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '1.7rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#2e2e2e',
                }}
              >
                Profil Fotoğrafını Değiştir
              </h2>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: '#ffffff',
                  padding: '1rem 1.5rem',
                  borderRadius: '30px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#45a049',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Fotoğraf Seç
              </Box>
              <Box
                sx={{
                  marginTop: '1.2rem',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '0.9rem',
                  color: '#666',
                  opacity: '0.8',
                  maxWidth: '280px',
                }}
              >
                <p>Profil fotoğrafınızı değiştirmek için yukarıdaki butona tıklayın.</p>
              </Box>
            </Box>
          </Modal>

        </Box>


        {/* Tab Menüsü */}
        <Box display="flex" gap={1} mb={4} bgcolor="white" borderRadius={2} p={1} boxShadow={1}>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'contained' : 'text'}
              color={activeTab === tab.id ? 'success' : 'inherit'}
              sx={{
                flex: 1,
                textTransform: 'none',
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Genel Bilgiler */}
        {activeTab === 'genel' && (

          <Box sx={{ p: 4, spaceY: 4 }}>
            <Card sx={{ p: 6, background: 'linear-gradient(to bottom right, #ebf8ff, #f5f5f5)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box>
                  <Typography variant="h6">Tesis Bilgileri</Typography>
                  <Typography variant="body2" color="text.secondary">Lütfen tesis detaylarını doldurunuz</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">Tesis Durumu</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={facility?.isActive || false} // Varsayılan olarak false
                        onChange={() => handleChange('isActive', !(facility?.isActive || false))}

                        sx={{
                          '& .MuiSwitch-thumb': {
                            backgroundColor: facility?.isActive ? 'green' : 'gray',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          color: facility?.isActive ? 'green' : 'gray',
                          fontWeight: 'bold',
                        }}
                      >
                        {facility?.isActive ? 'Aktif' : 'Pasif'}
                      </Typography>
                    }
                  />
                </Box>

              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    position: 'relative', // Sticky için gerekli
                  }}
                >
                  {/* Tesis Adı */}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        padding: '4px 8px',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Tesis Adı
                      </Typography>
                    </Box>
                    <TextField
                      label=""
                      value={facility?.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      fullWidth
                      placeholder="Tesis adını giriniz"
                    />
                  </Box>

                  {/* Adres */}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        padding: '4px 8px',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Adres
                      </Typography>
                    </Box>
                    <TextField
                      label=""
                      value={facility?.fullAddress}
                      onChange={(e) => handleChange('fullAddress', e.target.value)}
                      fullWidth
                      placeholder="Detaylı adres bilgisi"
                      multiline
                      rows={3}
                    />
                  </Box>

                  {/* İl ve İlçe */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
                    {/* Mail Adresi Girişi */}
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 10,
                          padding: '4px 8px',
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          Mail Adresi
                        </Typography>
                      </Box>
                      <FormControl fullWidth>
                        <TextField
                          type="email"
                          value={facility?.contactDetails || ''}
                          onChange={(e) => handleChange('contactDetails', e.target.value)}
                          placeholder="example@mail.com"
                          variant="outlined"
                        />
                      </FormControl>
                    </Box>
                  </Box>

                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    position: 'relative', // Sticky için gerekli
                  }}
                >
                  {/* İletişim Numarası */}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        padding: '4px 8px',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        İletişim Numarası
                      </Typography>
                    </Box>
                    <TextField
                      label=""
                      value={facility?.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      fullWidth
                      placeholder="0532 XXX XX XX"
                    />
                  </Box>

                  {/* Açılış ve Kapanış Saatleri */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {/* Açılış Saati */}
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 10,
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Clock style={{ width: 16, height: 16 }} />
                        <Typography variant="body2" fontWeight="bold">
                          Açılış Saati
                        </Typography>
                      </Box>
                      <Select
                        value={facility?.openTime?.toString().padStart(2, '0') || ""}
                        onChange={(e) => handleChange('openTime', e.target.value)}
                        fullWidth
                        MenuProps={{
                          sx: {
                            '& .MuiPaper-root': {
                              backgroundColor: '#d4d1d1',
                            },
                            '& .MuiMenuItem-root': {
                              backgroundColor: '#d4d1d1',
                              '&:hover': {
                                backgroundColor: '#3e4e72',
                              },
                            },
                          },
                        }}
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <MenuItem key={i} value={i.toString().padStart(2, '0')}>
                            {`${i.toString().padStart(2, '0')}:00`}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                    {/* Kapanış Saati */}
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 10,
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Clock style={{ width: 16, height: 16 }} />
                        <Typography variant="body2" fontWeight="bold">
                          Kapanış Saati
                        </Typography>
                      </Box>
                      <Select
                        value={facility?.closeTime || ""}
                        onChange={(e) => handleChange('closeTime', e.target.value)}
                        fullWidth
                        MenuProps={{
                          sx: {
                            '& .MuiPaper-root': {
                              backgroundColor: '#d4d1d1',
                            },
                            '& .MuiMenuItem-root': {
                              backgroundColor: '#d4d1d1',
                              '&:hover': {
                                backgroundColor: '#3e4e72',
                              },
                            },
                          },
                        }}
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <MenuItem key={i} value={i.toString().padStart(2, '0')}>
                            {`${i.toString().padStart(2, '0')}:00`}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Box>

                  {/* Tesis Açıklaması */}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        padding: '4px 8px',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Tesis Açıklaması
                      </Typography>
                    </Box>
                    <TextField
                      label=""
                      value={facility?.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      fullWidth
                      placeholder="Tesis hakkında kısa açıklama"
                      multiline
                      rows={3}
                    />
                  </Box>
                </Box>

              </Box>

              {isEdited && (
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'end', gap: 4 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                  >
                    Değişiklikleri İptal Et
                  </Button>
                  <Button
                    onClick={saveEditedField}
                    variant="contained"
                    color="primary"
                  >
                    Kaydet
                  </Button>
                </Box>
              )}

              {facility?.isActive === false && (
                <Alert severity="error" sx={{ mt: 4 }}>
                  Tesis şu anda pasif durumda. Aktif hale getirmek için yukarıdaki düğmeyi kullanabilirsiniz.
                </Alert>
              )}
            </Card>
          </Box>
        )}

        {/* Saha Yönetimi */}
        {activeTab === 'sahalar' && (
          <CourtManagement />
        )}

        {/* Tesis Özellikleri */}
        {activeTab === 'ozellikler' && (
          <CourtServices />
        )}

        {/* Fotoğraf Galerisi */}
        {activeTab === 'galeri' && (
          <PhotographGallery />
        )}
      </Box>
    </Box>
  );
};

export default ManageFacility;

